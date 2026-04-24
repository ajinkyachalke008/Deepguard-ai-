# 🛡️ DeepGuard AI  
### Advanced AI-Powered Deepfake Detection & Media Forensics Platform

<h1 align="center">🛡️ DeepGuard AI</h1>

<p align="center">
Advanced AI-Powered Deepfake Detection & Media Forensics Platform
</p>

<p align="center">
<b>Developed by AJINKYA CHALKE</b><br>
📧 ajinkyachalke008@gmail.com
</p>

---

<p align="center">

<img src="https://img.shields.io/badge/AI-Deepfake%20Detection-6C5CE7?style=for-the-badge&logo=openai&logoColor=white"/>
<img src="https://img.shields.io/badge/Research-AI%20Forensics-E84393?style=for-the-badge"/>
<img src="https://img.shields.io/badge/CNN-Convolutional%20Neural%20Network-00CEC9?style=for-the-badge"/>
<img src="https://img.shields.io/badge/Computer%20Vision-Media%20Analysis-0984E3?style=for-the-badge"/>

</p>

<p align="center">

<img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
<img src="https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
<img src="https://img.shields.io/badge/Next.js-15%20(App%20Router)-000000?style=for-the-badge&logo=nextdotjs"/>
<img src="https://img.shields.io/badge/TailwindCSS-v4-38BDF8?style=for-the-badge&logo=tailwindcss"/>

</p>

<p align="center">

<img src="https://img.shields.io/badge/PyTorch-Deep%20Learning-EE4C2C?style=for-the-badge&logo=pytorch"/>
<img src="https://img.shields.io/badge/TensorFlow-AI%20Model-FF6F00?style=for-the-badge&logo=tensorflow"/>
<img src="https://img.shields.io/badge/OpenCV-Computer%20Vision-5C3EE8?style=for-the-badge&logo=opencv"/>
<img src="https://img.shields.io/badge/NumPy-Numerical%20Computing-013243?style=for-the-badge&logo=numpy"/>

</p>

<p align="center">

<img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge"/>
<img src="https://img.shields.io/badge/Build-Stable-brightgreen?style=for-the-badge"/>
<img src="https://img.shields.io/badge/Maintained-Yes-blue?style=for-the-badge"/>
<img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge"/>

</p>

---

👨‍💻 **Developed by:** AJINKYA CHALKE  
📧 **Email:** ajinkyachalke008@gmail.com  

---

# 🌐 Overview

**DeepGuard AI** is an advanced **AI-powered media forensics platform** designed to detect deepfake images and videos generated using modern generative models such as **GANs (Generative Adversarial Networks)** and **diffusion-based AI systems**.

The platform combines **Convolutional Neural Networks (CNNs)** with **multi-signal forensic analysis techniques** to identify manipulation artifacts, frequency anomalies, and hidden metadata.

DeepGuard AI aims to **protect digital authenticity**, helping users verify whether media content is **real or AI-generated**.

---

# 🎯 Motivation

The rapid development of **generative AI technologies** has made it easier to create highly realistic fake media.

These manipulated contents can be misused for:

⚠️ Misinformation and propaganda  
⚠️ Identity impersonation  
⚠️ Financial fraud  
⚠️ Social engineering attacks  
⚠️ Political manipulation  

DeepGuard AI addresses these challenges by using **deep learning and digital forensic analysis** to verify the authenticity of images and videos.

---

# 🚀 Key Features

## 🤖 AI-Based Deepfake Detection

DeepGuard AI uses **Convolutional Neural Networks (CNN)** to identify subtle visual artifacts introduced by AI generators.

Examples of detectable artifacts include:

🔍 Unnatural facial textures  
🔍 Lighting inconsistencies  
🔍 Blending artifacts around manipulated regions  
🔍 Shadow irregularities  
🔍 GAN frequency fingerprints  

---

## 🎬 Frame-by-Frame Video Analysis

For video inputs, the platform performs **frame-level analysis**.

Processing pipeline:

1️⃣ Video frame extraction  
2️⃣ Face detection and alignment  
3️⃣ CNN artifact detection  
4️⃣ Temporal aggregation of anomaly scores  

This improves detection accuracy by analyzing **multiple frames instead of a single image**.

---

## 📊 Frequency Domain Analysis

Deepfake generation models often leave traces in the **frequency spectrum**.

DeepGuard AI performs **Fourier Transform analysis** to detect:

📡 Spectral inconsistencies  
📡 Checkerboard artifacts  
📡 Generator fingerprints  

Combining spatial and frequency analysis improves detection reliability.

---

## 🕵️ Hidden Information Extraction

DeepGuard AI can extract hidden information embedded inside images.

The system detects:

📷 EXIF metadata  
📷 Camera and lens information  
📍 GPS coordinates  
🧾 Editing software traces  
🖼️ Embedded thumbnails  
🔐 Possible steganographic signals  

This helps determine whether media has been edited or manipulated.

---

## 🧠 Multi-Signal Forensic Detection

Instead of relying on a single model, DeepGuard AI uses **multi-layer forensic verification**.

Signals analyzed include:

🔬 CNN spatial artifact detection  
📊 Frequency domain anomalies (Spectral Discontinuities)  
🎞️ Temporal consistency (Temporal Flickering & MSE)  
🗂️ Metadata & EXIF inspection  
🔐 Steganographic signal analysis  
🧾 C2PA / Content Provenance Verification  
📈 High-fidelity statistical anomaly scoring  

This **multi-signal architecture reduces false positives** and improves reliability.

---

## ⚡ Offline-First Forensic Resilience
To ensure continuity of investigations in strict air-gapped environments or during backend downtimes, DeepGuard AI features a **Resilient Offline Mode**. 

🛡️ **Local Blob Processing**: Media uploads generate secure, local Object URLs instead of requiring cloud storage.
🧠 **In-Memory Caching**: Forensic analysis states are cached in the browser's global memory.
🛑 **Mock Data Generation**: Missing cloud stats seamlessly fall back to intelligent heuristic mocks.

This guarantees critical intelligence platforms like the Batch Analyzer and Hex Entropy Engine never crash during internet drops.

---

# 🏗️ System Architecture

DeepGuard AI detection pipeline consists of several stages:

### 1️⃣ Media Upload
User uploads an image or video file.

### 2️⃣ Preprocessing
Media undergoes preprocessing including:

• Image resizing  
• Pixel normalization  
• Face detection and alignment  
• Frame extraction for video inputs  

### 3️⃣ Feature Extraction
CNN models extract visual features that may indicate manipulation.

### 4️⃣ Frequency Analysis
Spectral analysis detects GAN-related frequency artifacts.

### 5️⃣ Multi-Signal Fusion
All signals are combined to calculate a forensic authenticity score.

### 6️⃣ Result Generation
The system outputs:

📊 AI Likelihood Score  
📊 Forensic Confidence Score  
📊 Artifact Explanations  

---

# 🧠 CNN Model Overview

The core deep learning model is a **Convolutional Neural Network designed for forensic analysis**.

Architecture components include:

### 📥 Input Layer
Image normalization and resizing.

### 🔍 Convolution Layers
Extract spatial features using multiple filters.

### ⚡ Activation Functions
ReLU activation introduces non-linearity.

### 📉 Pooling Layers
Reduce dimensionality while preserving important patterns.

### 🔗 Fully Connected Layers
Perform classification using extracted features.

### 📤 Output Layer

Binary classification:

✔️ Real Media  
❌ AI Generated Media  

---

# 🧩 Advanced Processing Engines

The standard detection pipeline is heavily augmented by our **Web Worker-Driven Real-Time Engines**.

### 1️⃣ Advanced Batch Processing
Multiple files can be analyzed asynchronously using **Web Worker parallelism**, preventing UI freezes during heavy forensic scans.

### 2️⃣ Multi-Signal Diagnostic Suite
*   **Spectral Engine**: Analyzes frequency distribution for checkerboard artifact patterns endemic to GAN generators.
*   **Temporal Engine**: Maps Structural Similarity (SSIM) and pixel-delta variance across video timelines.
*   **Steganography Engine**: Scans for hidden data payloads using Bit-Plane Analysis.
*   **Entropy Engine**: Real-time Shannon Entropy computation to detect encrypted or anomalous data patterns.

### 3️⃣ High-Fidelity Forensic UI
*   **Pixel Differential Comparator**: Layer-based difference mapping between frames.
*   **Audio Spectrogram Viewer**: Real-time Fourier analysis of audio streams to detect synthetic pitch shifts.
*   **Hex-Entropy Visualizer**: 1024-byte block heatmaps of file structure for deep-level bit analysis.

### 4️⃣ Automated Forensic Reporting
Generates comprehensive PDF reports with cryptographic verification hashes, frame-level evidence, and summarized signal scores for research lab use.

---

# 🛠️ Technologies Used

### 🎨 Frontend
React 19  
Next.js 15 (App Router & Turbopack)  
Tailwind CSS 4  
Framer Motion  
Lucide React  
Radix UI  

### ⚙️ Backend
Python  
FastAPI / Flask  

### 🧠 Machine Learning
PyTorch  
TensorFlow  
OpenCV  
NumPy  

### 🧰 Data Processing
FFmpeg  
Image Processing Pipelines  

---

# 📚 Datasets Used

📂 FaceForensics++  
📂 Celeb-DF  
📂 DeepFake Detection Challenge (DFDC)  
📂 DeeperForensics  

These datasets include **both real and manipulated media samples**.

---

# ▶️ Usage

1️⃣ Open the application in your browser  
2️⃣ Upload an image or video file  
3️⃣ The system performs forensic analysis  
4️⃣ Results page displays authenticity scores  

---

# 📈 Evaluation Metrics

✔️ Accuracy  
✔️ Precision  
✔️ Recall  
✔️ F1 Score  
✔️ ROC-AUC  

These metrics measure how accurately the system identifies manipulated media.

---

# ⚠️ Limitations

Deepfake detection is an evolving research problem.

Possible limitations include:

• Heavy compression removing forensic artifacts  
• Adversarial manipulation attempts  
• Increasing realism of generative models  

Continuous research is required to improve detection robustness.

---

# 🔮 Future Work

🚀 Transformer-based deepfake detection  
🚀 Real-time video analysis  
🚀 Audio deepfake detection  
🚀 Blockchain-based media provenance  
🚀 Cross-dataset generalization improvements  

---

# 🎓 Research and Academic Use

This project is intended for:

📖 Research  
🎓 Educational purposes  
🔬 Digital media forensics studies  

If you use this project for research, please cite the related work.

---

# 👨‍💻 Author

**AJINKYA CHALKE**  
Electrical Engineering Student  
Government College of Engineering Karad  

📧 Email: ajinkyachalke008@gmail.com  

---

# 📜 License

This project is released under the **MIT License** *(Under Process)*.
