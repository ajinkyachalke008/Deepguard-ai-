<div align="center">

<!-- HEADER BANNER -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0d1117,50:1a1a2e,100:16213e&height=200&section=header&text=DeepGuard%20AI&fontSize=60&fontColor=00d4ff&fontAlignY=38&desc=Advanced%20AI-Powered%20Deepfake%20Detection%20%26%20Media%20Forensics%20Platform&descAlignY=60&descSize=16&descColor=8892b0&animation=fadeIn" width="100%"/>

<!-- BADGES ROW 1 -->
<p>
  <img src="https://img.shields.io/badge/Next.js-15.3.6-000000?style=for-the-badge&logo=nextdotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white"/>
</p>

<!-- BADGES ROW 2 -->
<p>
  <img src="https://img.shields.io/badge/PyTorch-Deep_Learning-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white"/>
  <img src="https://img.shields.io/badge/TensorFlow-AI_Model-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white"/>
  <img src="https://img.shields.io/badge/OpenCV-Computer_Vision-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white"/>
  <img src="https://img.shields.io/badge/CNN-Forensic_Analysis-00CEC9?style=for-the-badge"/>
</p>

<!-- BADGES ROW 3 -->
<p>
  <img src="https://img.shields.io/badge/Status-Active_Development-00b894?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Build-Stable-brightgreen?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Platform-Web-orange?style=for-the-badge"/>
</p>

<!-- LIVE DEMO BUTTON -->
<br/>
<a href="https://deepguard-ai-ajinkyachalke008s-projects.vercel.app">
  <img src="https://img.shields.io/badge/🛡️_LIVE_DEMO-deepguard--ai.vercel.app-00d4ff?style=for-the-badge&labelColor=0d1117"/>
</a>
&nbsp;
<a href="https://github.com/ajinkyachalke008/Deepguard-ai-">
  <img src="https://img.shields.io/badge/⭐_Star_this_Repo-GitHub-181717?style=for-the-badge&logo=github"/>
</a>
&nbsp;
<a href="https://linkedin.com/in/ajinkya-chalke-711b953b5">
  <img src="https://img.shields.io/badge/LinkedIn-Ajinkya_Chalke-0077B5?style=for-the-badge&logo=linkedin"/>
</a>

<br/><br/>

> **🛡️ DeepGuard AI** is a production-grade, AI-powered media forensics platform built to detect deepfake images and videos using **Convolutional Neural Networks (CNN)**, **multi-signal forensic analysis**, and **real-time browser-side engines** — developed by **Ajinkya Chalke**, EE Student @ GCEK.

</div>

---

## 📋 Table of Contents

- [🌐 Overview](#-overview)
- [🎯 Problem Statement](#-problem-statement)
- [🚀 Key Features](#-key-features)
- [🏗️ System Architecture](#️-system-architecture)
- [🧠 ML Pipeline](#-ml-pipeline)
- [🧩 Forensic Engines](#-forensic-engines)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [⚡ Quick Start](#-quick-start)
- [📚 Datasets](#-datasets)
- [📈 Evaluation Metrics](#-evaluation-metrics)
- [⚠️ Limitations & Future Work](#️-limitations--future-work)
- [👨‍💻 Author](#-author)

---

## 🌐 Overview

**DeepGuard AI** is an advanced **AI-powered media forensics platform** designed to detect deepfake images and videos generated using modern generative models — **GANs (Generative Adversarial Networks)** and **diffusion-based AI systems**.

The platform combines **Convolutional Neural Networks (CNNs)** with **multi-signal forensic analysis** to identify manipulation artifacts, frequency anomalies, and hidden metadata — all running in a sleek, production-grade Next.js 15 interface with real-time feedback.

```
📸 Upload Image/Video  ──►  🔬 Multi-Signal Analysis  ──►  📊 Forensic Score  ──►  📄 PDF Report
```

---

## 🎯 Problem Statement

The rapid rise of **generative AI** has made it trivial to create hyper-realistic fake media. Deepfakes are actively weaponized for:

| Threat Vector | Impact |
|---|---|
| ⚠️ Misinformation & Propaganda | Erodes public trust |
| 🎭 Identity Impersonation | Financial & reputational damage |
| 💸 Financial Fraud | Scams, fake KYC bypass |
| 🗳️ Political Manipulation | Election interference |
| 🕵️ Social Engineering | Targeted cyber attacks |

DeepGuard AI addresses these challenges with **deep learning + digital forensics** to verify media authenticity at scale.

---

## 🚀 Key Features

### 🤖 AI-Based Deepfake Detection
CNN models trained on **FaceForensics++**, **Celeb-DF**, and **DFDC** datasets identify subtle visual artifacts:
- Unnatural facial textures & skin boundaries
- Lighting and shadow inconsistencies
- Blending artifacts around manipulated regions
- GAN frequency fingerprints

### 🎬 Frame-by-Frame Video Analysis
Full video forensics pipeline:
```
Video Input → Frame Extraction → Face Detection → CNN Analysis → Temporal Aggregation → Score
```

### 📊 Frequency Domain Analysis
**Fourier Transform analysis** exposes GAN-specific spectral signatures:
- Checkerboard artifact detection
- Spectral discontinuity mapping
- Generator fingerprint identification

### 🕵️ EXIF & Metadata Forensics
Extracts hidden signals embedded in media files:
- Camera make, model, lens data
- GPS coordinates & timestamps
- Editing software traces
- Steganographic payload detection

### 🧠 Multi-Signal Fusion Engine
7-layer forensic verification combining:

| Signal | Technique |
|---|---|
| CNN Spatial | Artifact detection via deep features |
| Frequency Domain | Fourier spectral analysis |
| Temporal | SSIM + MSE frame comparison |
| Metadata | EXIF + C2PA content provenance |
| Steganography | Bit-plane analysis |
| Entropy | Shannon entropy computation |
| Statistical | Anomaly scoring pipeline |

### ⚡ Offline-First Forensic Resilience
Built for **air-gapped & restricted environments**:
- 🛡️ Local Blob Processing — no cloud upload required
- 🧠 In-Memory State Caching — analysis persists across sessions
- 🛑 Intelligent Mock Fallback — zero crashes during network outages

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     DeepGuard AI Platform                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐    ┌──────────────┐    ┌────────────────────┐  │
│  │  Upload  │───►│ Preprocessor │───►│  Feature Extractor │  │
│  │  Media   │    │  & Validator │    │  (CNN / ResNet)    │  │
│  └──────────┘    └──────────────┘    └────────────────────┘  │
│                                               │               │
│  ┌────────────────────────────────────────────▼────────────┐  │
│  │              Multi-Signal Forensic Engine               │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │  │
│  │  │ Spectral │ │ Temporal │ │  Stegano │ │ Entropy  │  │  │
│  │  │ Engine   │ │ Engine   │ │  Engine  │ │ Engine   │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                               │                               │
│  ┌────────────────────────────▼────────────────────────────┐  │
│  │                    Result Generator                      │  │
│  │         AI Score │ Confidence │ Artifact Report          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                               │                               │
│  ┌────────────────────────────▼────────────────────────────┐  │
│  │              PDF Forensic Report Generator               │  │
│  │      Crypto Hash Verification + Evidence Bundle          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧠 ML Pipeline

```
Input Image (224×224×3)
       │
       ▼
┌─────────────────────┐
│  Normalization Layer │  ← Pixel value scaling [0,1]
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Conv Block 1        │  ← 32 filters, 3×3 kernel, ReLU
│  + MaxPool           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Conv Block 2        │  ← 64 filters, 3×3 kernel, ReLU
│  + MaxPool           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Conv Block 3        │  ← 128 filters, 3×3 kernel, ReLU
│  + MaxPool           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Fully Connected     │  ← 512 neurons + Dropout 0.5
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Output Layer        │  ← Sigmoid: Real (0) / Deepfake (1)
└─────────────────────┘
```

---

## 🧩 Forensic Engines

### 1️⃣ Spectral Engine
Analyzes **frequency distribution** for GAN generator artifacts — particularly checkerboard patterns endemic to upsampling layers in generator architectures.

### 2️⃣ Temporal Engine
Maps **Structural Similarity Index (SSIM)** and pixel-delta variance across video frame timelines to detect inter-frame anomalies introduced by face-swap algorithms.

### 3️⃣ Steganography Engine
Scans for **hidden data payloads** using Bit-Plane Analysis — detecting LSB (Least Significant Bit) steganographic embedding used to watermark or tamper with media.

### 4️⃣ Entropy Engine
Real-time **Shannon Entropy computation** on 1024-byte blocks to detect encrypted payloads, anomalous compression, or structural irregularities in media files.

### 5️⃣ High-Fidelity Forensic UI
| Tool | Description |
|---|---|
| 🖼️ Pixel Differential Comparator | Layer-based difference mapping between frames |
| 🎵 Audio Spectrogram Viewer | Real-time Fourier analysis detecting synthetic pitch shifts |
| 🔢 Hex-Entropy Visualizer | 1024-byte block heatmaps for deep bit-level analysis |

### 6️⃣ Automated PDF Reports
Generates court-ready forensic reports with:
- Cryptographic SHA-256 verification hashes
- Frame-level annotated evidence
- Signal-by-signal scoring breakdown
- Chain-of-custody metadata

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 15.3.6 | App Router + Turbopack |
| React | 19.0.0 | UI Framework |
| TypeScript | 5.x | Type Safety |
| Tailwind CSS | v4 | Styling |
| Framer Motion | 12.x | Animations |
| Three.js | 0.178.0 | 3D Visualizations |
| Radix UI | Latest | Accessible Components |
| Supabase | 2.89.0 | Database & Auth |
| Drizzle ORM | 0.44.7 | Type-safe DB Queries |
| better-auth | 1.3.10 | Authentication |
| jsPDF | 3.0.4 | PDF Report Generation |

### ML & Backend
| Technology | Purpose |
|---|---|
| PyTorch | CNN Model Training |
| TensorFlow | Model Inference |
| OpenCV | Computer Vision Pipeline |
| NumPy | Numerical Computing |
| FastAPI / Flask | API Backend |
| FFmpeg | Video Frame Extraction |

---

## 📁 Project Structure

```
Deepguard-ai-/
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Radix/shadcn components
│   │   ├── forensics/          # Forensic analysis components
│   │   └── visualizations/     # 3D & chart components
│   └── lib/                    # Utilities & helpers
├── public/                     # Static assets
├── .github/workflows/          # CI/CD pipelines
├── .orchids/                   # Orchids config
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- npm / bun
- Python 3.10+ (for ML backend)

### Installation

```bash
# Clone the repository
git clone https://github.com/ajinkyachalke008/Deepguard-ai-.git
cd Deepguard-ai-

# Install dependencies
npm install --legacy-peer-deps

# Set up environment variables
cp .env.example .env.local
# Fill in your Supabase, Auth, and API keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Usage

```
1. Navigate to the Upload page
2. Drop an image or video file
3. Watch the real-time forensic analysis run
4. Review the authenticity score & artifact breakdown
5. Download the forensic PDF report
```

---

## 📚 Datasets

| Dataset | Description | Size |
|---|---|---|
| FaceForensics++ | Video manipulation dataset | 1,000+ videos |
| Celeb-DF | Celebrity deepfake videos | 5,639 videos |
| DFDC | DeepFake Detection Challenge | 100,000+ clips |
| DeeperForensics | High-quality manipulations | 60,000 videos |

---

## 📈 Evaluation Metrics

| Metric | Description |
|---|---|
| ✅ Accuracy | Overall correct predictions |
| 🎯 Precision | True positives / (True + False positives) |
| 📡 Recall | True positives / (True positives + False negatives) |
| ⚖️ F1 Score | Harmonic mean of Precision & Recall |
| 📊 ROC-AUC | Area under the Receiver Operating Characteristic curve |

---

## ⚠️ Limitations & Future Work

### Current Limitations
- Heavy compression can strip forensic artifacts before analysis
- Adversarial attacks specifically targeting detection models
- Continuously evolving generative model realism

### 🔮 Roadmap
- [ ] Transformer-based deepfake detection (ViT architecture)
- [ ] Real-time video stream analysis
- [ ] Audio deepfake detection (voice cloning)
- [ ] Blockchain-based media provenance (C2PA full integration)
- [ ] Cross-dataset generalization improvements
- [ ] Mobile app (React Native)
- [ ] Browser extension for real-time social media scanning

---

## 👨‍💻 Author

<div align="center">

<img src="https://avatars.githubusercontent.com/u/225726874?v=4" width="100" style="border-radius: 50%"/>

### **Ajinkya Arun Chalke**
*Electrical Engineering Student — Government College of Engineering Karad (GCEK)*

[![Portfolio](https://img.shields.io/badge/🌐_Portfolio-Visit-00d4ff?style=for-the-badge)](https://portfolio-eta-ruby-7fs42ayh6b.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-ajinkyachalke008-181717?style=for-the-badge&logo=github)](https://github.com/ajinkyachalke008)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/ajinkya-chalke-711b953b5)
[![Email](https://img.shields.io/badge/Email-ajinkyachalke008@gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:ajinkyachalke008@gmail.com)

</div>

---

## 📜 License

This project is released under the **MIT License**.

```
MIT License — Copyright (c) 2026 Ajinkya Chalke
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software.
```

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:16213e,50:1a1a2e,100:0d1117&height=100&section=footer&animation=fadeIn" width="100%"/>

**⭐ If DeepGuard AI helped you, please star the repo!**

*Built with 🛡️ by Ajinkya Chalke — GCEK Karad, Maharashtra, India*

</div>
