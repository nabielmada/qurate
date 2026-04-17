"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWallet } from '@/context/WalletContext';
import { useTheme } from 'next-themes';
import { Sun, Moon, ArrowRight, Activity, ShieldCheck, Zap, Coins } from 'lucide-react';

export default function Home() {
  const { setGuestMode, isConnected } = useWallet();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 selection:bg-blue-100 dark:selection:bg-blue-900/50 transition-colors duration-300 relative overflow-hidden">
      
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 dark:bg-blue-900/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] rounded-full bg-purple-400/10 dark:bg-indigo-900/20 blur-[100px] pointer-events-none"></div>
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 italic">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-black text-lg">Q</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">Qurate</span>
          </div>
          <div className="hidden md:flex items-center gap-6 lg:gap-8 font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
             <a href="#vision" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Vision</a>
             <a href="#architecture" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Architecture</a>
             <a href="#matrix" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">AI Matrix</a>
             <a href="#scenario" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Scenario</a>
             <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
             <a href="#faq" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">FAQ</a>
             <Link href="/merchant/register" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Merchant Portal</Link>
             <a href="https://four.meme" target="_blank" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 font-black bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full">Hackathon ↗</a>
          </div>
          <div className="flex items-center gap-4">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
            <ConnectButton />
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16 relative z-10">
        {/* Hero Section */}
        <section id="vision" className="max-w-7xl mx-auto px-6 pt-16 md:pt-20 pb-24 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-100 dark:border-blue-800/50 uppercase tracking-wide">
            <Zap size={14} className="text-amber-500" /> Version 2.0 AI Sprint
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white leading-[1.1] mb-8 tracking-tight">
            The Future of Payments <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Driven by AI.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed mb-12">
            Qurate is the first autonomous Web3 Payment Agent. Scan a regular QR, and our AI calculates the best multichain route for you in milliseconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            {isConnected ? (
              <Link href="/user">
                <button className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2">
                  Enter Dashboard <ArrowRight size={18} />
                </button>
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button 
                      onClick={openConnectModal}
                      className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-bold text-base rounded-2xl transition-all shadow-xl shadow-slate-900/10 active:scale-95 whitespace-nowrap"
                    >
                      Connect Wallet
                    </button>
                  )}
                </ConnectButton.Custom>
                
                <button 
                  onClick={setGuestMode}
                  className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 font-bold text-base rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3 whitespace-nowrap"
                >
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  Try Guest Mode (Demo)
                </button>
              </div>
            )}
          </div>

          {/* Floating Insight Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 border-y border-slate-200 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm divide-x divide-slate-200 dark:divide-slate-800/60 max-w-4xl mx-auto rounded-3xl p-6 shadow-sm">
            {[
               { val: "< 1.5s", lbl: "AI Routing Latency" },
               { val: "5+", lbl: "Chains Supported" },
               { val: "99.9%", lbl: "Fallback Accuracy" },
               { val: "-60%", lbl: "Gas Cost Savings" },
            ].map((stat, i) => (
               <div key={i} className="flex flex-col items-center px-4">
                 <span className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 mb-1">{stat.val}</span>
                 <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider text-center">{stat.lbl}</span>
               </div>
            ))}
          </div>
        </section>

        {/* 3 Pillars Section */}
        <section id="architecture" className="bg-slate-100/50 dark:bg-slate-900/50 py-24 mb-10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">Agent Architecture</h2>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">Why Qurate Changes the Game?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Smart Routing Matrix",
                  desc: "The agent doesn't pick at random. It calculates variables like real-time gas fees, liquidity depth, and block speed from 5 different L2 networks in milliseconds.",
                  icon: <Activity className="text-blue-500" size={32} />
                },
                {
                  title: "Comparative AI Reasoning",
                  desc: "We reject the 'Black Box' AI model. Gemini 1.5 Flash explains directly why a route was chosen and why other routes were eliminated.",
                  icon: <span className="text-3xl">🧠</span>
                },
                {
                  title: "Zero-Failure Fallback",
                  desc: "If the primary route fails due to sudden gas spikes, Qurate automatically switches to the backup candidate. You never have to restart a transaction.",
                  icon: <ShieldCheck className="text-emerald-500" size={32} />
                }
              ].map((pilar, i) => (
                <div key={i} className="group p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300">
                  <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl inline-block">{pilar.icon}</div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">{pilar.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">{pilar.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bento Grid: The Intelligence Path */}
        <section id="matrix" className="py-24 relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <h2 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3">Simulation Flow</h2>
                <p className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">AI Process Behind the Scenes</p>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-sm">
                See how the AI dissects your wallet, compares routes, and executes smart contracts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Box 1: Connect & Setup (Medium) */}
              <div className="md:col-span-12 lg:col-span-5 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 flex flex-col justify-between relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-100 dark:bg-blue-900/30 rounded-full blur-[80px] opacity-50 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative z-10 mb-10">
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 font-bold shadow-sm">
                     01
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Multichain Asset Identification</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                    Once connected, the AI pulls live balances via Alchemy API to discover your assets without needing to manually switch networks in MetaMask.
                  </p>
                </div>

                <div className="relative z-10 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-inner">
                   <div className="font-mono text-[10px] text-slate-400 mb-4 flex justify-between">
                     <span>$ alchemy.core.getTokenBalances</span>
                     <span className="text-emerald-500 font-bold">SUCCESS</span>
                   </div>
                   <div className="space-y-3">
                     {[ { t: 'USDC', c: 'Arbitrum', b: '150.00' }, { t: 'ETH', c: 'Base', b: '0.04' } ].map((item, i) => (
                       <div key={i} className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 px-3 py-2 rounded-lg text-xs font-bold dark:text-slate-300">
                         <div className="flex gap-2">
                           <Coins size={14} className="text-indigo-500" />
                           {item.t} <span className="text-slate-400 font-normal">({item.c})</span>
                         </div>
                         <span>{item.b}</span>
                       </div>
                     ))}
                   </div>
                </div>
              </div>

              {/* Box 2: Scan & Analysis (Large) */}
              <div className="md:col-span-12 lg:col-span-7 bg-slate-900 dark:bg-black rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden group border border-slate-800">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent opacity-80"></div>
                
                {/* Abstract Pattern background */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>

                <div className="relative z-10 w-full h-full flex flex-col">
                  <div className="flex justify-between items-start mb-auto">
                    <div className="w-12 h-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-white font-bold">
                      02
                    </div>
                    <div className="bg-indigo-500/20 px-4 py-1.5 rounded-full border border-indigo-500/30 text-[10px] font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></span>
                      AI Decision Matrix
                    </div>
                  </div>
                  
                  <div className="mt-12 mb-6">
                    <h3 className="text-2xl font-bold text-white mb-4">Dynamic Route Evaluation</h3>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md">
                      Executes Composite Scoring (Fees + Speed + Bonus + Liquidity). Generates a winning candidate along with fallback alternatives.
                    </p>
                  </div>

                  <div className="bg-slate-950/80 rounded-2xl border border-white/5 p-4 font-mono text-[10px] md:text-xs text-green-400 flex flex-col gap-2 shadow-2xl">
                     <div className="text-slate-500">{"// AI Router output:"}</div>
                     <div className="flex gap-4">
                       <span className="text-blue-400">Winning Route:</span>
                       <span>USDC on Polygon (Score: 98/100)</span>
                     </div>
                     <div className="flex gap-4">
                       <span className="text-yellow-400">Fallback Route 1:</span>
                       <span className="text-slate-300">USDT on BSC (Score: 85/100)</span>
                     </div>
                     <div className="flex gap-4">
                       <span className="text-red-400">Rejected:</span>
                       <span className="text-slate-500">ETH on Ethereum (Extreme Gas Fees)</span>
                     </div>
                  </div>
                </div>
              </div>

              {/* Box 3: Instant Success (Full/Bottom) */}
              <div className="md:col-span-12 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-100 dark:border-emerald-900/50 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-10 hover:shadow-xl transition-all duration-500">
                <div className="flex-1">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 font-bold text-lg">03</div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-emerald-50 mb-3">Transparency. Execution. Done.</h3>
                  <p className="text-slate-600 dark:text-emerald-100/70 text-sm md:text-base font-medium leading-relaxed lg:max-w-xl">
                    Before you hit 'Pay', Gemini 1.5 Flash logically explains the route comparison. After confirmation, the Smart Contract handles settlement to the shop instantly.
                  </p>
                </div>
                <div className="w-full md:w-auto px-10 py-8 bg-white dark:bg-emerald-950 rounded-3xl border border-emerald-100 dark:border-emerald-800 shadow-xl shadow-emerald-500/10 flex flex-col items-center justify-center">
                   <ShieldCheck size={48} className="text-emerald-500 mb-4" />
                   <div className="text-emerald-600 dark:text-emerald-400 font-extrabold text-2xl text-center mb-1">Payment Successful</div>
                   <div className="text-slate-400 dark:text-emerald-500/80 text-[10px] font-bold text-center uppercase tracking-widest mt-2">Rp 150,000 Settlement</div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Real World Scenario */}
        <section id="scenario" className="py-24 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3">Real World Scenario</h2>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">How Does It Work In Practice?</p>
              <p className="text-slate-500 dark:text-slate-400 mt-4 max-w-2xl mx-auto leading-relaxed">We designed a seamless checkout experience without the friction of technical interactions. Both buyers and sellers can transact instantly just like a digital wallet.</p>
            </div>

            <div className="flex flex-col lg:flex-row items-stretch gap-10 lg:gap-16">
              {/* Sisi Merchant */}
              <div className="flex-1 w-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-10 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-[60px] pointer-events-none"></div>
                <div className="flex items-center gap-4 mb-10 relative z-10">
                  <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center text-2xl shadow-inner">🏪</div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">On the Merchant Side</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shop Owner</p>
                  </div>
                </div>
                
                <ul className="space-y-8 relative z-10">
                  <li className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm font-bold flex-shrink-0">1</div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-lg">Single-Time Static QR</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">Merchants only need to print a static QR sticker once. Zero maintenance required.</p>
                    </div>
                  </li>
                  <li className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-sm font-bold flex-shrink-0">2</div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-lg">Instant Crypto Settlement</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">Funds are converted to stablecoins and sent directly to their wallet. No held funds, no manual withdrawals.</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Sisi User */}
              <div className="flex-1 w-full bg-slate-900 dark:bg-black rounded-[2.5rem] p-8 md:p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/40 via-transparent to-transparent opacity-80"></div>
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                
                <div className="flex items-center gap-4 mb-10 relative z-10">
                  <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-2xl shadow-inner">📱</div>
                  <div>
                    <h3 className="text-xl font-bold text-white">On the Customer Side</h3>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">User (Buyer)</p>
                  </div>
                </div>

                <ul className="space-y-8 relative z-10">
                  <li className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300 text-sm font-bold flex-shrink-0">1</div>
                    <div>
                      <p className="font-bold text-white text-lg">Scan & Enter Amount (IDR)</p>
                      <p className="text-sm text-slate-400 mt-2 leading-relaxed">Customer scans the QR via Web Browser or Wallet, then enters the bill amount in Rupiah (e.g., Rp 50,000).</p>
                    </div>
                  </li>
                  <li className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/5 flex items-center justify-center text-slate-300 text-sm font-bold flex-shrink-0">2</div>
                    <div>
                      <p className="font-bold text-emerald-400 text-lg">1-Click AI Approval</p>
                      <p className="text-sm text-slate-400 mt-2 leading-relaxed">AI takes over; scanning the wallet, choosing appropriate tokens, finding the cheapest network, and calculating exchange rates. Customer just hits approve.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
          </div>
        </section>

        {/* Full Capabilities */}
        <section id="features" className="py-24 relative overflow-hidden bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800/80">
          {/* Decorative Backgrounds */}
          <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-cyan-50 dark:bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute inset-0 opacity-[0.5] dark:opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#94a3b8 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }}></div>

          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3">Full Capabilities</h2>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">Seamless Payment Ecosystem</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
              <div className="flex gap-5">
                <div className="flex-shrink-0 w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shadow-inner"><Activity size={26} /></div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Real-Time Gas Indexing</h4>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">Pulls Gwei data live from Alchemy RPC so every AI comparison is precise down to the smallest fraction of a cent.</p>
                </div>
              </div>
              <div className="flex gap-5">
                <div className="flex-shrink-0 w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shadow-inner"><Coins size={26} /></div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Variable Static QR</h4>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">Merchants don't need to print dynamic QRs continuously. One static QR is enough—let customers input the IDR amount and let the AI handle the conversion.</p>
                </div>
              </div>
              <div className="flex gap-5">
                <div className="flex-shrink-0 w-14 h-14 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center shadow-inner"><ShieldCheck size={26} /></div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Smart Fallback System</h4>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">Anti-failure transactions. If the primary chain experiences downtime, the Agent immediately switches to the second option in the Decision Matrix.</p>
                </div>
              </div>
              <div className="flex gap-5">
                <div className="flex-shrink-0 w-14 h-14 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center shadow-inner"><span className="text-2xl">💬</span></div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Gemini Flash 1.5 Transparency</h4>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">We reject Black-Box AI. AI breaks down alternative routes and real reasons why one asset was chosen over another in a natural, conversational way.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-3">FAQ</h2>
              <p className="text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-3">
                Questions about Qurate <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 rounded-full text-xs align-middle">Updated</span>
              </p>
            </div>
            <div className="space-y-4">
               {[
                 { q: "Do I need to understand blockchain terms like Matic, Arbitrum, or Gwei?", a: "Not at all. The Qurate experience mimics digital payment apps (like PayPal or Venmo). All the complexity of tokens and gas is handled by the AI with one simple confirmation." },
                 { q: "Which assets and networks are scanned live?", a: "The AI real-time scans balances of USDC, USDT, WETH, and other tokens from 5 popular Layer-2s: Base, Arbitrum, Polygon PoS, Binance Smart Chain, plus Ethereum Mainnet." },
                 { q: "How is the settlement secured for the Merchant?", a: "Merchants do not deposit funds with Qurate. We use the 'PayAIRouter' decentralized smart contract on Base. Funds are forwarded directly to the merchant's wallet via Atomic Execution." },
               ].map((faq, i) => (
                 <div key={i} className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                   <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">{faq.q}</h3>
                   <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed">{faq.a}</p>
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section id="about" className="py-24 text-center">
          <div className="max-w-5xl mx-auto px-6">
            <div className="bg-slate-900 dark:bg-slate-800 p-12 md:p-20 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
               {/* Decorative element */}
               <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/40 via-indigo-600/40 to-purple-600/40 opacity-80 group-hover:scale-105 transition-transform duration-700"></div>
               <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
               
               <div className="relative z-10 flex flex-col items-center">
                 <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight tracking-tight">Feeling Crypto is Too Complex? <br className="hidden md:block"/> Let AI Do the Work.</h2>
                 <p className="text-slate-300 text-lg font-medium mb-10 max-w-xl text-center leading-relaxed">
                   Simply enter the bill amount and let Qurate handle conversion, choose the cheapest network, and settle the payment behind the scenes.
                 </p>
                 <Link href="/user">
                   <button className="px-12 py-5 bg-white text-slate-900 font-bold text-lg rounded-2xl hover:bg-slate-50 transition shadow-xl transform active:scale-95 flex items-center justify-center gap-3">
                     Try the Demo Now <ArrowRight size={20} />
                   </button>
                 </Link>
               </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-slate-200 dark:border-slate-800/80 text-center relative z-10 bg-slate-50 dark:bg-slate-950">
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
          Qurate &copy; 2025 • Four.meme AI Sprint
        </p>
      </footer>
    </div>
  );
}
