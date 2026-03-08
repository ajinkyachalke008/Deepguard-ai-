import { JPEG, PNG, BMFF } from '@trustnxt/c2pa-ts/asset';
import { SuperBox } from '@trustnxt/c2pa-ts/jumbf';
import { ManifestStore, ValidationResult } from '@trustnxt/c2pa-ts/manifest';

export type C2PAIntegrityStatus = 'verified' | 'partial' | 'invalid' | 'absent';

export interface C2PAEditAction {
  action: string;
  tool: string;
  timestamp: string;
}

export interface C2PAResult {
  status: C2PAIntegrityStatus;
  signatureValid: boolean | null;
  creator?: string;
  creationTool?: string;
  creationDate?: string;
  editHistory: C2PAEditAction[];
  issuer?: string;
  certificateChain: string[];
  claimGenerator?: string;
  ingredients: Array<{
    title?: string;
    format?: string;
    instanceId?: string;
  }>;
  validationErrors: string[];
  rawManifestCount: number;
}

const MIME_TYPE_MAP: Record<string, string> = {
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'webp': 'image/webp',
  'mp4': 'video/mp4',
  'mov': 'video/quicktime',
};

function getMimeType(fileName: string): string | null {
  const ext = fileName.split('.').pop()?.toLowerCase();
  return ext ? MIME_TYPE_MAP[ext] || null : null;
}

function extractCreator(manifest: Record<string, unknown>): string | undefined {
  try {
    const assertions = manifest.assertions as Array<{ label: string; data: unknown }> | undefined;
    if (!assertions) return undefined;
    
    const creativeWork = assertions.find(a => 
      a.label === 'stds.schema-org.CreativeWork' || 
      a.label.includes('CreativeWork')
    );
    
    if (creativeWork?.data) {
      const data = creativeWork.data as Record<string, unknown>;
      if (typeof data.author === 'string') return data.author;
      if (Array.isArray(data.author) && data.author[0]) {
        const author = data.author[0] as Record<string, unknown>;
        return author.name as string || author['@id'] as string;
      }
    }
    
    return undefined;
  } catch {
    return undefined;
  }
}

function extractCreationTool(manifest: Record<string, unknown>): string | undefined {
  try {
    const claimGeneratorInfo = manifest.claim_generator_info as Array<{ name?: string; version?: string }> | undefined;
    if (claimGeneratorInfo?.[0]) {
      const { name, version } = claimGeneratorInfo[0];
      return version ? `${name} ${version}` : name;
    }
    
    const claimGenerator = manifest.claim_generator as string | undefined;
    return claimGenerator;
  } catch {
    return undefined;
  }
}

function extractEditHistory(manifest: Record<string, unknown>): C2PAEditAction[] {
  try {
    const assertions = manifest.assertions as Array<{ label: string; data: unknown }> | undefined;
    if (!assertions) return [];
    
    const actionsAssertion = assertions.find(a => 
      a.label === 'c2pa.actions' || 
      a.label.includes('actions')
    );
    
    if (!actionsAssertion?.data) return [];
    
    const data = actionsAssertion.data as { actions?: Array<{
      action?: string;
      softwareAgent?: string | { name?: string };
      when?: string;
      parameters?: Record<string, unknown>;
    }> };
    
    if (!data.actions) return [];
    
    return data.actions.map(action => {
      let tool = 'Unknown';
      if (typeof action.softwareAgent === 'string') {
        tool = action.softwareAgent;
      } else if (action.softwareAgent?.name) {
        tool = action.softwareAgent.name;
      }
      
      const actionLabel = action.action?.replace('c2pa.', '').replace('_', ' ') || 'Unknown action';
      const formattedAction = actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1);
      
      return {
        action: formattedAction,
        tool,
        timestamp: action.when || new Date().toISOString(),
      };
    });
  } catch {
    return [];
  }
}

function extractIssuer(manifest: Record<string, unknown>): string | undefined {
  try {
    const signatureInfo = manifest.signature_info as { issuer?: string; cert_serial_number?: string } | undefined;
    return signatureInfo?.issuer;
  } catch {
    return undefined;
  }
}

function extractCertificateChain(manifest: Record<string, unknown>): string[] {
  try {
    const signatureInfo = manifest.signature_info as { cert_chain?: string[] } | undefined;
    if (signatureInfo?.cert_chain) {
      return signatureInfo.cert_chain.map(cert => {
        const cnMatch = cert.match(/CN=([^,]+)/);
        return cnMatch ? cnMatch[1] : 'Unknown Certificate';
      });
    }
    return [];
  } catch {
    return [];
  }
}

function extractIngredients(manifest: Record<string, unknown>): Array<{ title?: string; format?: string; instanceId?: string }> {
  try {
    const ingredients = manifest.ingredients as Array<{ title?: string; format?: string; instance_id?: string }> | undefined;
    if (!ingredients) return [];
    
    return ingredients.map(ing => ({
      title: ing.title,
      format: ing.format,
      instanceId: ing.instance_id,
    }));
  } catch {
    return [];
  }
}

function determineStatus(
  validationResult: ValidationResult | null,
  hasManifest: boolean
): { status: C2PAIntegrityStatus; signatureValid: boolean | null; errors: string[] } {
  if (!hasManifest) {
    return { status: 'absent', signatureValid: null, errors: [] };
  }
  
  if (!validationResult) {
    return { status: 'partial', signatureValid: null, errors: ['Validation incomplete'] };
  }
  
  const errors: string[] = [];
  
  if (validationResult.isValid) {
    return { status: 'verified', signatureValid: true, errors: [] };
  }
  
  if (validationResult.statusEntries) {
    for (const entry of validationResult.statusEntries) {
      if (entry.explanation) {
        errors.push(entry.explanation);
      }
    }
  }
  
  return { status: 'invalid', signatureValid: false, errors };
}

export async function parseC2PAFromBuffer(
  buffer: Buffer,
  fileName: string
): Promise<C2PAResult> {
  const mimeType = getMimeType(fileName);
  
  if (!mimeType) {
    return {
      status: 'absent',
      signatureValid: null,
      editHistory: [],
      certificateChain: [],
      ingredients: [],
      validationErrors: ['Unsupported file format for C2PA parsing'],
      rawManifestCount: 0,
    };
  }
  
  try {
    const uint8Array = new Uint8Array(buffer);
    let asset: InstanceType<typeof JPEG> | InstanceType<typeof PNG> | InstanceType<typeof BMFF> | null = null;
    
    if (JPEG.canRead(uint8Array)) {
      asset = new JPEG(uint8Array);
    } else if (PNG.canRead(uint8Array)) {
      asset = new PNG(uint8Array);
    } else if (BMFF.canRead(uint8Array)) {
      asset = new BMFF(uint8Array);
    }
    
    if (!asset) {
      return {
        status: 'absent',
        signatureValid: null,
        editHistory: [],
        certificateChain: [],
        ingredients: [],
        validationErrors: [],
        rawManifestCount: 0,
      };
    }
    
    const jumbf = asset.getManifestJUMBF();
    
    if (!jumbf) {
      return {
        status: 'absent',
        signatureValid: null,
        editHistory: [],
        certificateChain: [],
        ingredients: [],
        validationErrors: [],
        rawManifestCount: 0,
      };
    }
    
    let manifestStore: ManifestStore | null = null;
    let validationResult: ValidationResult | null = null;
    
    try {
      const superBox = SuperBox.fromBuffer(jumbf);
      manifestStore = ManifestStore.read(superBox);
      
      if (manifestStore) {
        validationResult = await manifestStore.validate(asset);
      }
    } catch (parseError) {
      return {
        status: 'partial',
        signatureValid: null,
        editHistory: [],
        certificateChain: [],
        ingredients: [],
        validationErrors: [parseError instanceof Error ? parseError.message : 'Manifest parsing failed'],
        rawManifestCount: 1,
      };
    }
    
    const activeManifest = manifestStore?.getActiveManifest();
    
    if (!manifestStore || !activeManifest) {
      return {
        status: 'absent',
        signatureValid: null,
        editHistory: [],
        certificateChain: [],
        ingredients: [],
        validationErrors: [],
        rawManifestCount: 0,
      };
    }
    
    const manifestData = activeManifest as unknown as Record<string, unknown>;
    
    const { status, signatureValid, errors } = determineStatus(validationResult, true);
    
    let creator: string | undefined;
    let creationTool: string | undefined;
    let creationDate: string | undefined;
    let issuer: string | undefined;
    let claimGenerator: string | undefined;
    
    if (activeManifest.claim) {
      const claim = activeManifest.claim as Record<string, unknown>;
      claimGenerator = claim.claim_generator as string | undefined;
      creationDate = claim.signature_time as string | undefined;
    }
    
    creator = extractCreator(manifestData);
    creationTool = extractCreationTool(manifestData) || claimGenerator;
    issuer = extractIssuer(manifestData);
    
    const editHistory = extractEditHistory(manifestData);
    const certificateChain = extractCertificateChain(manifestData);
    const ingredients = extractIngredients(manifestData);
    
    return {
      status,
      signatureValid,
      creator,
      creationTool,
      creationDate,
      editHistory,
      issuer,
      certificateChain,
      claimGenerator,
      ingredients,
      validationErrors: errors,
      rawManifestCount: manifestStore.manifests?.length || 1,
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
    
    if (errorMessage.includes('No manifest') || errorMessage.includes('not found') || errorMessage.includes('MalformedContentError')) {
      return {
        status: 'absent',
        signatureValid: null,
        editHistory: [],
        certificateChain: [],
        ingredients: [],
        validationErrors: [],
        rawManifestCount: 0,
      };
    }
    
    return {
      status: 'invalid',
      signatureValid: false,
      editHistory: [],
      certificateChain: [],
      ingredients: [],
      validationErrors: [errorMessage],
      rawManifestCount: 0,
    };
  }
}

export function createAbsentResult(): C2PAResult {
  return {
    status: 'absent',
    signatureValid: null,
    editHistory: [],
    certificateChain: [],
    ingredients: [],
    validationErrors: [],
    rawManifestCount: 0,
  };
}
