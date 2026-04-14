# 🤖 Qurate: AI-Powered Web3 Payment Agent

> **"The first truly autonomous AI payment agent for Web3 — where the user only decides to pay, and the AI handles everything else."**

[![Hackathon](https://img.shields.io/badge/Event-Four.meme%20AI%20Sprint%202025-blueviolet)](https://four.meme)
[![Version](https://img.shields.io/badge/Version-1.0.0--MVP-orange)](#)
[![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20|%20NestJS%20|%20Gemini-blue)](#)

---

## 🌟 Vision
**Qurate** is an AI-driven Web3 payment platform that enables anyone to pay with crypto just by scanning a QR code — without needing to understand tokens, chains, or gas fees. 

Our AI Agent automatically scans the user's wallet, selects the most optimal token and chain, executes the transaction, and explains its reasoning in human-readable language (Bahasa Indonesia).

---

## 🚀 Key Features

### 1. Autonomous AI Routing
Unlike traditional Web3 payment gateways (like Binance Pay or AEON) where users must manually select assets, Qurate's AI Agent:
- Scans assets across **L2 Networks** (Base, Polygon, Ethereum) in real-time.
- Calculates a **Composite Efficiency Score** based on live gas fees (IDR-equivalent), speed, and routing logic.
- Selects the most cost-effective path automatically for zero-input execution.

### 2. Natural Language Explainer (Gemini 1.5 Flash)
Every transaction decision is narrated by **Google Gemini 1.5 Flash**. It translates complex blockchain logic into friendly messages:
> *"Saya memilih USDC di jaringan Polygon karena biaya kirimnya hanya Rp 150 hari ini — jauh lebih murah dibanding opsi lainnya."*

### 3. Dynamic & Static QR Support
- **Digital Cashier (POS)**: Integrated for merchants with transaction-specific payment routing.
- **Unified QR**: Single scan point for all assets; AI Agent handles the network and bridge selection automatically.

### 4. Real-Time Bento UI
A premium, minimalist dashboard that shows live activity, asset allocation, and real-time AI processing logs.

---

## 🏗️ Technical Architecture

Qurate is built as a **Monorepo** using [Turborepo](https://turbo.build/):

- **`/frontend`**: Next.js 15 (App Router) + TailwindCSS 4 + **Wagmi/Viem** (Web3 Connection Layer).
- **`/backend`**: NestJS (Node.js) + Alchemy API for multichain scanning.
- **`/contracts`**: Solidity (PayAIRouter) deployed on **Base Sepolia**.
- **AI Engine**: Google Generative AI (Gemini 1.5 Flash) for intent parsing and decision narration.

### Tech Stack Symbols
- **Blockchain Data**: `Alchemy API`
- **Reasoning**: `Gemini 1.5 Flash`
- **Settlement**: `Base Sepolia` (`0xeEe66cBe7aF484A0736e691bf94682Ef95aF50bE`)
- **Communication**: `127.0.0.1` optimized for low-latency dev flow.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js v20+
- NPM / FVM

### 1. Environment Variables
Create a `.env` file in the root (or `backend/`) with the following:
```env
GEMINI_API_KEY="your_google_ai_key"
ALCHEMY_API_KEY="your_alchemy_key"
ALCHART_RPC_BASE="your_base_rpc"
# See .env.example for more
```

### 2. Installation & Run
```bash
# Install dependencies for the whole monorepo
npm install

# Run frontend, backend, and contracts in development mode
npm run dev
```
The app will be available at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`

---

## 📄 Smart Contracts
The `PayAIRouter.sol` contract serves as the trustless settlement layer. 
- **`payNative`**: Handles direct ETH payments to registered merchant IDs (Our primary demo flow).
- **`payDirect`**: Enables automated token transfers for ERC20 assets across various chains.
- **`registerMerchant`**: Securely maps unique Merchant IDs to settlement wallet addresses.

---

## 🗺️ Roadmap (Post-Hackathon)
- [ ] **L2 Native Settlement**: Deeper integration with Base/Polygon for sub-second finality.
- [ ] **Account Abstraction (ERC-4337)**: AI Agent with its own smart wallet for true "Zero-Input" payments.
- [ ] **Mobile App**: Native iOS/Android via Flutter.

---

## 👥 Contributors
- **Nabiel Mada** - Lead Developer & Product Architect

---
Built for the **Four.meme AI Sprint 2025**. 🚀
