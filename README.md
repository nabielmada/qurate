# 🤖 Qurate: AI-Powered Web3 Payment Agent

> **"The first truly autonomous AI payment agent for Web3 — where the user only needs to scan and type the amount, and the AI handles the rest."**

[![Hackathon](https://img.shields.io/badge/Event-Four.meme%20AI%20Sprint%202025-blueviolet)](https://four.meme)
[![Version](https://img.shields.io/badge/Version-2.0.0--MVP-orange)](#)
[![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20|%20NestJS%20|%20Gemini-blue)](#)

---

## 🌟 Vision
**Qurate** is an AI-driven Web3 payment platform that enables anyone to pay with crypto just by scanning a static QR code — without needing to understand tokens, chains, gas fees, or complex routing.

Our AI Agent automatically scans the user's wallet, evaluates multiple routes, selects the most optimal token and chain, executes the transaction with **fallback routing** mechanisms, and explains its reasoning through **comparative natural language** (Bahasa Indonesia).

---

## 🚀 Key Innovations (v2.0)

### 1. Autonomous Multichain Routing & Decision Matrix
Unlike traditional Web3 payment gateways where users must manually select assets, Qurate's AI Agent:
- Scans assets across **L2 Networks** (Ethereum, Base, Arbitrum, Polygon, BSC) in real-time using Alchemy.
- Analyzes all candidate routes creating an **AI Decision Matrix** based on 4 metrics: Gas Efficiency, Speed, Stablecoin Bonus, and Liquidity.
- Assigns a Composite Efficiency Score to every route.
- Displays full transparency of the choices before finalizing the payment.

### 2. Comparative Reasoning Explainer (Gemini 1.5 Flash)
Every transaction decision is narrated by **Google Gemini 1.5 Flash**. Upgraded from simple narration, the AI provides **comparative reasoning** — explaining *why* it chose the winning route and *why* it rejected the others:
> *"Rute USDT di Polygon dipilih karena biaya adminnya paling rendah (Rp 150) dan masuk kategori tabungan stabil. Sebaliknya, rute Ethereum diabaikan karena biayanya luar biasa mahal mencapai Rp 50.000."*

### 3. Automated Fallback Safety
If the primary selected route fails (e.g., wallet RPC issue, node failure, or user rejection), the AI Agent automatically falls back to the #2 alternative in the decision matrix to ensure the payment successfully settles.

### 4. Static QR "Zero Code" Interaction
Merchants only need to print a **Static QR** containing their `Merchant ID`. The customer scans the QR, manually inputs the amount in **IDR**, and the AI calculates the reverse crypto conversion real-time based on live CoinGecko prices.

---

## 🏗️ Technical Architecture

Qurate is built as a highly robust **Monorepo** using [Turborepo](https://turbo.build/):

- **`/frontend`**: Next.js 15 (App Router) + TailwindCSS 4 + **Wagmi/Viem** (Web3 Connection Layer). All endpoints connected securely via `.env`.
- **`/backend`**: NestJS (Node.js) + Alchemy API for multichain scanning. Features modular services (`AiRouterService`, `AiExplainerService`, `WalletScannerService`).
- **`/contracts`**: Solidity (`PayAIRouter`) deployed on **Base Sepolia**.

### Agent Protocol Flow
1. **Input**: User scans Static QR & inputs nominal in IDR.
2. **Scan**: `WalletScannerService` pulls live balances via Alchemy.
3. **Analyze**: `AiRouterService` fetches live gas fees and token prices, generating the `candidates[]` matrix.
4. **Explain**: `AiExplainerService` passes the matrix to Gemini 1.5 Flash for comparative reasoning generation.
5. **Execute**: Frontend triggers Wagmi `writeContractAsync` against `PayAIRouter` on Base Sepolia.
6. **Settle**: Transaction confirmed and saved to Supabase vector DB (alongside AI reasoning logs).

---

## 🛠️ Getting Started

### Prerequisites
- Node.js v20+
- NPM / FVM

### 1. Environment Variables
Create a `.env.local` inside `frontend/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"
```

Create a `.env` in the root (for backend):
```env
GEMINI_API_KEY="your_google_ai_key"
ALCHEMY_API_KEY="your_alchemy_key"
```

### 2. Installation & Run
```bash
# Install dependencies for the whole monorepo
npm install

# Run frontend, backend, and contracts in development mode
npm run dev
```

---

## 📄 Smart Contracts
The `PayAIRouter.sol` contract serves as the trustless settlement layer. 
- **`payNative`**: Handles direct ETH payments to registered merchant IDs.
- **`payDirect`**: Enables automated token transfers for ERC20 assets.
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
