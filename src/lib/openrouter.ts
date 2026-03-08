export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }>;
}

export interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function chatCompletion(
  messages: OpenRouterMessage[],
  model: string = 'openai/gpt-4o-mini',
  options: { temperature?: number; max_tokens?: number } = {}
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not defined in environment variables');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://deepguard-ai.vercel.app', // Optional, for OpenRouter rankings
      'X-Title': 'DeepGuard AI', // Optional, for OpenRouter rankings
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      ...options,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenRouter API error: ${response.status} ${JSON.stringify(errorData)}`);
  }

  const data: OpenRouterResponse = await response.json();
  return data.choices[0].message.content;
}
