# 🤖 Qurate: AI-Powered Web3 Payment Agent

> **"The first truly autonomous AI payment agent for Web3 — where the user only needs to scan and type the amount, and the AI handles the rest."**

[![Hackathon](https://img.shields.io/badge/Event-Four.meme%20AI%20Sprint%202025-blueviolet)](https://four.meme)
[![Version](https://img.shields.io/badge/Version-2.0.0--MVP-orange)](#)
[![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20|%20NestJS%20|%20Gemini-blue)](#)

---

## 🌟 Vision
**Qurate** is an AI-driven Web3 payment platform that enables anyone to pay with crypto just by scanning a static QR code — without needing to understand tokens, chains, gas fees, or complex routing.

Our AI Agent automatically scans the user's wallet, evaluates multiple routes, selects the most optimal token and chain, executes the transaction with **fallback routing** mechanisms, and explains its reasoning through **comparative natural language** (English).

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
> *"The USDT route on Polygon was chosen because it has the lowest fee ($0.01) and qualifies as a stable savings category. Conversely, the Ethereum route was ignored because its fee is incredibly high, reaching $3.50."*

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

## 🧠 Project Philosophy: Technical Depth & Decisions

During this hackathon sprint, we prioritized **User Experience (UX)** and **Transaction Speed**. Below is our reasoning for certain architectural choices:

### 1. The "1-Click" vs "2-Step" ERC20 Dilemma
In a production environment, paying with ERC20 (USDC/USDT) requires two on-chain signatures: `Approve` and `Transfer`. This creates friction. For this MVP, we focus on **Native Settlement (Base ETH)** to demonstrate the **Atomic "1-Click" Scan-to-Pay** flow. In our production roadmap, we intend to use **Permit2** or **Account Abstraction Session Keys** to bundle these into a single signature.

### 2. Cross-Chain Routing Simulation
While our AI correctly identifies assets on Arbitrum or Polygon, "bridging" them to Base real-time can take 2-5 minutes. For demo purposes, we simulate the settlement to show the **Instant UX** we aim for. Our code is architected to integrate with **Li.Fi SDK** or **LayerZero** to handle these bridges asynchronously in the background in future versions.

### 3. Real-time Merchant Settlement
We leverage **Wagmi Event Watchers** on the Merchant Dashboard. This ensures that the moment a block is confirmed on Base, the Merchant's UI reacts instantly without a page refresh, providing a "Web2-like" responsiveness for a Web3 transaction.

---

## 🗺️ Roadmap & Future Architecture
- [x] **Account Abstraction (Smart Wallets)**: Implemented WebAuthn & Passkeys via Coinbase Smart Wallet SDK. Users can pay without installing extensions — just a thumbprint away.
- [x] **Real-time Event Notifications**: Merchant Dashboard automatically detects incoming payments via On-Chain events.
- [ ] **On-Chain KYC / AML Compliance Framework**: 
  - *Merchant KYC*: Integration with Web3 identity verifiable credentials (e.g., Coinbase Verifications or Polygon ID).
  - *Real-time User AML*: Screening payer addresses via Chainalysis API.
- [ ] **Fully Autonomous Session Keys**: AI Agent pays trusted merchants automatically up to a daily limit.
- [ ] **Native Mobile App**: Migration to Flutter for native NFC and specialized scanner support.

---

## 👥 Contributors
- **Nabiel Mada** - Lead Developer & Product Architect

---
Built for the **Four.meme AI Sprint 2025**. 🚀
