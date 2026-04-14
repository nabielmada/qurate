"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

type ChainInfo = {
  name: string;
  fee: string;
  time: string;
  status: 'tersedia' | 'tidak punya' | '✓ Dipilih';
  feeRaw: number;
};

const DUMMY_ADDRESS = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";

export default function PaymentFlow() {
  const [step, setStep] = useState<'analyzing' | 'decision' | 'confirmed'>('analyzing');
  const [logs, setLogs] = useState<string[]>([]);
  const [bestRoute, setBestRoute] = useState<any>(null);
  const [explanation, setExplanation] = useState<string>("");
  const [loadingRealData, setLoadingRealData] = useState(true);
  const hasRun = useRef(false);

  // Helper untuk menambahkan log dengan smooth
  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg]);
  };

  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    async function runAIEngine() {
      try {
        setLoadingRealData(true);
        
        // Step 1: Init
        addLog("🔍 Memindai QR... Merchant: Mie Gacoan");
        await sleep(600);
        addLog("🛡️ Menghubungkan ke secure vault wallet Anda...");
        await sleep(800);
        
        // Step 2: Scan
        addLog("💰 Memindai saldo multichain (Ethereum, Polygon, Base, Arbitrum)...");
        const scanRes = await fetch(`http://127.0.0.1:3001/api/scan/${DUMMY_ADDRESS}`);
        const tokens = await scanRes.json();
        await sleep(500);
        addLog(`✅ Scan selesai. Ditemukan ${tokens.length} aset aktif di 5 jaringan.`);
        await sleep(700);

        // Step 3: Routing
        addLog("📊 Menjalankan skor efisiensi AI dan analisa rute...");
        const routeRes = await fetch(`http://127.0.0.1:3001/api/route`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tokens, amountIDR: 50000 })
        });
        const routeData = await routeRes.json();
        setBestRoute(routeData);
        await sleep(600);
        addLog(`🤖 Keputusan Agent: Menggunakan ${routeData.token} di network ${routeData.chain}.`);
        await sleep(700);

        // Step 4: Explanation
        addLog("✨ Gemini 2.5 Flash sedang menyusun narasi keputusan...");
        if (routeData) {
          const explainRes = await fetch(`http://127.0.0.1:3001/api/explain`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ routeData, merchantName: "Mie Gacoan", amountIDR: 50000 })
          });
          const explainData = await explainRes.json();
          setExplanation(explainData.explanation);
        }
        await sleep(500);
        addLog("🚀 Semua kalkulasi selesai. Menuju panel keputusan.");
        await sleep(1000);

        // Transition to next step
        setStep('decision');
      } catch (e) {
        console.error("Gagal koordinasi dengan AI Agent:", e);
        addLog("❌ Terjadi kendala koneksi dengan AI Node.");
      } finally {
        setLoadingRealData(false);
      }
    }
    
    if (step === 'analyzing') {
       runAIEngine();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const CHAINS: ChainInfo[] = [
    { name: 'Ethereum', fee: 'Rp 41.200', time: '12 dtk', status: bestRoute?.chain === 'Ethereum' ? '✓ Dipilih' : 'tersedia', feeRaw: 41200 },
    { name: 'BSC', fee: 'Rp 300', time: '3 dtk', status: bestRoute?.chain === 'BSC' ? '✓ Dipilih' : 'tersedia', feeRaw: 300 },
    { name: 'Polygon', fee: 'Rp 150', time: '2 dtk', status: bestRoute?.chain === 'Polygon' ? '✓ Dipilih' : 'tersedia', feeRaw: 150 },
    { name: 'Base', fee: 'Rp 50', time: '2 dtk', status: bestRoute?.chain === 'Base' ? '✓ Dipilih' : 'tersedia', feeRaw: 50 },
    { name: 'Arbitrum', fee: 'Rp 80', time: '2 dtk', status: bestRoute?.chain === 'Arbitrum' ? '✓ Dipilih' : 'tersedia', feeRaw: 80 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-4 md:p-10 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/40 rounded-full blur-[120px]"></div>

      <div className="max-w-xl w-full space-y-6 relative z-10">

        {/* Step Indicator */}
        <div className="flex justify-between items-center px-6">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${step === 'analyzing' ? 'bg-blue-600 scale-125 shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'bg-slate-300'}`}></div>
            <span className={`text-[9px] font-bold uppercase transition-colors duration-500 ${step === 'analyzing' ? 'text-blue-600' : 'text-slate-400'}`}>Analisis</span>
          </div>
          <div className="flex-1 h-[1px] bg-slate-200 mx-4"></div>
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${step === 'decision' ? 'bg-blue-600 scale-125 shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'bg-slate-300'}`}></div>
            <span className={`text-[9px] font-bold uppercase transition-colors duration-500 ${step === 'decision' ? 'text-blue-600' : 'text-slate-400'}`}>Keputusan</span>
          </div>
          <div className="flex-1 h-[1px] bg-slate-200 mx-4"></div>
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${step === 'confirmed' ? 'bg-emerald-500 scale-125 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`}></div>
            <span className={`text-[9px] font-bold uppercase transition-colors duration-500 ${step === 'confirmed' ? 'text-emerald-500' : 'text-slate-400'}`}>Selesai</span>
          </div>
        </div>

        {/* MAIN PANEL */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-6 md:p-10 border border-white flex flex-col min-h-[480px]">

          {step === 'analyzing' && (
            <div className="flex flex-col flex-1 animate-fade-in">
              <div className="mb-10 text-center">
                <div className="inline-flex p-3 bg-blue-50 rounded-2xl mb-4 border border-blue-100">
                  <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">AI Agent memindai blockchain...</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Real-time Multichain Scan</p>
              </div>

              <div className="space-y-3 font-medium text-slate-400 text-[11px] max-w-sm mx-auto w-full">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-2 items-center animate-slide-up py-1 border-b border-slate-50 last:border-0">
                    <span className="text-blue-600 text-[8px] opacity-60">●</span>
                    <span className={i === logs.length - 1 ? "text-slate-700 font-bold" : ""}>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'decision' && bestRoute && (
            <div className="flex flex-col flex-1 animate-fade-in">
              <div className="mb-6 flex justify-between items-end">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight text-center">Evaluasi Jaringan (Real)</h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Berdasarkan Alchemy & Route scoring</p>
                </div>
                <div className="bg-blue-50 px-2 py-1 rounded text-[8px] font-black text-blue-600 uppercase border border-blue-100">Live Snapshot</div>
              </div>

              <div className="overflow-hidden rounded-[2rem] border border-slate-100 mb-6 bg-slate-50/30">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[10px] min-w-[320px]">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[8px] border-b border-slate-100">
                        <th className="px-5 py-3">Chain</th>
                        <th className="px-5 py-3">Gas Fee</th>
                        <th className="px-5 py-3">Speed</th>
                        <th className="px-5 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {CHAINS.map((c, i) => (
                        <tr key={i} className={`transition-colors duration-300 ${c.status === '✓ Dipilih' ? 'bg-blue-600/5' : 'hover:bg-slate-100/50'}`}>
                          <td className="px-5 py-3 font-bold text-slate-800">{c.name}</td>
                          <td className="px-5 py-3 font-medium text-slate-500">{c.fee}</td>
                          <td className="px-5 py-3 font-medium text-slate-500">{c.time}</td>
                          <td className="px-5 py-3 text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase inline-block ${c.status === '✓ Dipilih' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-200 text-slate-500'}`}>
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-6 text-white mb-6 border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-blue-500 rounded-full blur-[70px] opacity-30"></div>
                <h3 className="text-[8px] font-bold uppercase text-slate-500 mb-4 flex items-center gap-2 tracking-widest">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Keputusan Final Agent
                </h3>
                <div className="flex justify-between items-end mb-4 relative z-10">
                  <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Aset & Network</p>
                    <p className="text-lg font-bold">{bestRoute.token} <span className="text-blue-400 font-medium tracking-tight">on {bestRoute.chain}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Total (IDR)</p>
                    <p className="text-xl font-bold">≈ Rp {(50000 + bestRoute.gasEstimateIdr).toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/50 border border-blue-100/50 p-4 rounded-2xl mb-8 relative">
                <p className="text-[11px] text-blue-800 font-bold italic leading-[1.6] text-center">
                  "{bestRoute.reasoning}"
                </p>
              </div>

              <button
                onClick={() => setStep('confirmed')}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-3xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 transform active:scale-95 text-sm"
              >
                Konfirmasi Pembayaran
              </button>
            </div>
          )}

          {step === 'confirmed' && (
            <div className="flex flex-col flex-1 animate-fade-in py-4">
              <div className="flex items-center gap-4 mb-8 bg-emerald-50/50 p-5 rounded-[2rem] border border-emerald-100">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-200 flex-shrink-0">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 leading-tight">Berhasil Terbayar</h2>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Atomic Settlement Confirmed</p>
                </div>
              </div>

              <div className="space-y-6 mb-10">
                <div className="bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100">
                  <div className="grid grid-cols-2 gap-y-4 text-xs font-medium">
                    <div className="text-slate-400 font-bold uppercase text-[9px]">Nominal</div>
                    <div className="text-right font-bold text-slate-900 border-b border-slate-100 pb-1">Rp 50.000</div>

                    <div className="text-slate-400 font-bold uppercase text-[9px]">Sumber Dana</div>
                    <div className="text-right font-bold text-slate-900 leading-tight">
                       <div>{bestRoute?.token}</div>
                       <div className="text-[9px] text-blue-600 uppercase">{bestRoute?.chain}</div>
                    </div>

                    <div className="text-slate-400 font-bold uppercase text-[9px]">Biaya Gas</div>
                    <div className="text-right font-bold text-emerald-600">Rp {bestRoute?.gasEstimateIdr.toLocaleString('id-ID')}</div>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-[9px] font-black uppercase text-blue-600 tracking-widest">Penjelasan Agent (Gemini 2.5)</h3>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-xs text-slate-700 font-bold leading-[1.7] italic">
                    "{explanation || "AI sedang memberikan penjelasan..."}"
                  </p>
                </div>
              </div>

              <Link href="/user" className="w-full mt-auto">
                <button className="w-full bg-slate-900 text-white font-bold py-4 rounded-3xl hover:bg-slate-800 transition-all shadow-xl text-sm transform active:scale-95">
                  Kembali ke Dashboard
                </button>
              </Link>
            </div>
          )}

        </div>

        <div className="text-center pb-8 opacity-40">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
            AI Execution Engine v1.0 • Built on Base & Polygon
          </p>
        </div>
      </div>
    </div>
  );
}
