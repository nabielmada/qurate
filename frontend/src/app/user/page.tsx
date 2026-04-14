"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// Dummy Address with testnet balance behavior
const DUMMY_ADDRESS = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"; // Vitalik's address (Used for richness of multichain data)

interface TokenBalance {
  symbol: string;
  chain: string;
  balance: number;
  usdValue: number;
  color?: string;
  allocation?: string;
}

const RECENT_TX = [
  { type: 'Payment', to: 'Mie Gacoan', amount: 'Rp 50.000', status: 'Selesai', date: 'Hari ini' },
  { type: 'Receive', from: '0x882...12a', amount: '0.05 ETH', status: 'Selesai', date: 'Kemarin' },
];

export default function UserDashboard() {
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [defaultToken, setDefaultToken] = useState<string | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    async function fetchBalances() {
      try {
        setLoading(true);
        const res = await fetch(`http://127.0.0.1:3001/api/scan/${DUMMY_ADDRESS}`);
        const data = await res.json();
        
        // Map color and allocation for UI
        const enriched = data.map((t: any, i: number) => ({
          ...t,
          color: i % 2 === 0 ? 'bg-blue-600' : 'bg-emerald-500',
          allocation: `${((t.usdValue / data.reduce((a: any, b: any) => a + b.usdValue, 0)) * 100).toFixed(0)}%`
        }));
        
        setTokens(enriched);
      } catch (e) {
        console.error("Gagal mengambil saldo real:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchBalances();
  }, []);

  const totalBalanceIdr = tokens.reduce((acc, curr) => acc + (curr.usdValue * 16200), 0);

  const formatCurrency = (val: number) => {
    if (val >= 1_000_000_000_000) return `Rp ${(val / 1_000_000_000_000).toFixed(2)} T`;
    if (val >= 1_000_000_000) return `Rp ${(val / 1_000_000_000).toFixed(2)} M`;
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-4 md:p-10 flex flex-col items-center relative overflow-hidden">
      <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[30%] bg-blue-100/30 rounded-full blur-[100px]"></div>
      
      <div className="max-w-lg w-full space-y-5 relative z-10">
        
        {/* Header / Profile */}
        <div className="flex justify-between items-center px-2">
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">Dompet AI Kamu</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-slate-400 font-bold uppercase text-[8px]">{DUMMY_ADDRESS.slice(0, 6)}...{DUMMY_ADDRESS.slice(-4)}</p>
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
              <p className="text-emerald-600 font-bold uppercase text-[8px]">Real-time Connected</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
          </div>
        </div>

        {/* Total Balance Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-7 text-white shadow-2xl shadow-slate-200 relative overflow-hidden group">
          <div className="relative z-10 text-center">
            <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">Total Saldo Est.</p>
            {loading ? (
              <div className="h-10 w-48 bg-slate-700/50 animate-pulse rounded-lg mx-auto mb-6"></div>
            ) : (
              <h2 className="text-3xl font-bold mb-6">
                {formatCurrency(totalBalanceIdr)}
              </h2>
            )}
            
            <Link href="/payment">
              <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-3xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 transform active:scale-95 flex items-center justify-center gap-3 text-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                Scan untuk Bayar
              </button>
            </Link>
          </div>
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-blue-600 rounded-full blur-[60px] opacity-20 pointer-events-none"></div>
        </div>

        {/* Assets List */}
        <div className="bg-white/60 backdrop-blur-md border border-white rounded-[2rem] p-6 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-sm font-bold text-slate-900">Alokasi Aset (Live)</h3>
            <button className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">Real-time scan</button>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-200 rounded-xl"></div>
                    <div>
                      <div className="h-3 w-12 bg-slate-200 rounded mb-1"></div>
                      <div className="h-2 w-8 bg-slate-100 rounded"></div>
                    </div>
                  </div>
                  <div className="h-3 w-20 bg-slate-200 rounded"></div>
                </div>
              ))
            ) : tokens.length > 0 ? (
              tokens.map((token, i) => (
                <div key={i} className={`flex items-center justify-between group cursor-pointer border-b border-slate-100 pb-3 last:border-0 last:pb-0 transition-opacity ${defaultToken && defaultToken !== token.symbol && 'opacity-60'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 ${token.color} rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm group-hover:scale-110 transition-transform uppercase`}>
                      {token.symbol[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                         <h4 className="font-bold text-slate-900 text-xs leading-none">{token.symbol}</h4>
                         {defaultToken === token.symbol && (
                           <span className="bg-blue-600 text-white text-[7px] px-1 py-0.5 rounded font-black uppercase tracking-tighter">Default</span>
                         )}
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase leading-none">{token.chain}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="font-bold text-slate-900 text-xs leading-none">{token.balance.toFixed(4)} {token.symbol}</p>
                      <div className="flex items-center justify-end gap-1.5 mt-1">
                        <p className="text-[9px] font-bold text-slate-400">≈ {formatCurrency(token.usdValue * 16200)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">Tidak ada aset ditemukan.</div>
            )}
          </div>
        </div>

        {/* Activity Section */}
        <div className="bg-white/60 backdrop-blur-md border border-white rounded-[2rem] p-6 shadow-sm">
           <h3 className="text-sm font-bold text-slate-900 mb-5">Aktivitas Terakhir</h3>
           <div className="space-y-4">
              {RECENT_TX.map((tx, i) => (
                <div key={i} className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${tx.type === 'Payment' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'} rounded-lg flex items-center justify-center`}>
                        <svg className="w-4 h-4 uppercase" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {tx.type === 'Payment' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-4-4m0 0l4-4m-4 4h18"></path>
                          )}
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 leading-none">{tx.type === 'Payment' ? 'Bayar ke' : 'Terima dari'} {tx.to || tx.from}</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">{tx.date}</p>
                      </div>
                   </div>
                   <p className={`text-xs font-bold ${tx.type === 'Payment' ? 'text-slate-900' : 'text-emerald-600'}`}>
                      {tx.type === 'Payment' ? '-' : '+'}{tx.amount}
                   </p>
                </div>
              ))}
           </div>
        </div>

        <div className="pt-4 text-center pb-12 opacity-40">
           <Link href="/" className="text-slate-500 text-[10px] font-bold uppercase">← Kembali ke Home</Link>
        </div>
      </div>
    </div>
  );
}
