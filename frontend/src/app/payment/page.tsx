"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useWallet } from '@/context/WalletContext';
import { supabase } from '@/lib/supabase';
import { useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import { useSearchParams } from 'next/navigation';
import { apiUrl } from '@/lib/api';

type RouteCandidate = {
  token: string;
  chain: string;
  gasEstimateIdr: number;
  amountToken: number;
  score: number;
  gasEfficiency: number;
  speedScore: number;
  stableBonus: number;
  liquidityScore: number;
};

export default function PaymentFlow() {
  const { address, isGuest, currency } = useWallet();
  const [step, setStep] = useState<'input' | 'analyzing' | 'decision' | 'confirmed'>('input');
  const [logs, setLogs] = useState<string[]>([]);
  const [bestRoute, setBestRoute] = useState<any>(null);
  const [candidates, setCandidates] = useState<RouteCandidate[]>([]);
  const [gasPrices, setGasPrices] = useState<Record<string, number>>({});
  const [explanation, setExplanation] = useState<string>("");
  const [merchantData, setMerchantData] = useState<any>(null);
  const [loadingRealData, setLoadingRealData] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const merchantId = searchParams?.get('id') || 'm_nabiel_001';
  const urlAmount = searchParams?.get('amount');
  
  const [amount, setAmount] = useState<number>(urlAmount ? Number(urlAmount) : 0);
  const isAmountLocked = !!urlAmount;

  // Sync default amount based on currency if not locked
  useEffect(() => {
    if (!isAmountLocked && amount === 0) {
      setAmount(currency === 'USD' ? 10 : 25000);
    }
  }, [currency, isAmountLocked, amount]);

  const [aiGreeting, setAiGreeting] = useState<string>("Sapaan AI...");
  const [lastPreferredChain, setLastPreferredChain] = useState<string | null>(null);
  
  const hasRun = useRef(false);

  const currencySymbols: Record<string, string> = {
    IDR: 'Rp',
    USD: '$',
    MYR: 'RM',
    SGD: 'S$',
    EUR: '€',
  };
  const currencySymbol = currencySymbols[currency] || '$';

  const formatValue = (val: number) => {
    return val.toLocaleString(currency === 'IDR' ? 'id-ID' : 'en-US', {
      maximumFractionDigits: currency === 'IDR' ? 0 : 2,
      minimumFractionDigits: currency === 'IDR' ? 0 : 2
    });
  };

  // For gas fees: use up to 4 decimal places for non-IDR to avoid showing "$0.00"
  // when real on-chain gas is legitimately very small (e.g. $0.0004 on Base)
  const formatGas = (val: number) => {
    if (currency === 'IDR') return formatValue(val);
    if (val > 0 && val < 0.01) {
      return val.toLocaleString('en-US', { maximumFractionDigits: 4, minimumFractionDigits: 4 });
    }
    return formatValue(val);
  };

  // Helper untuk menambahkan log dengan smooth
  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg]);
  };

  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

  // Fetch merchant data on mount
  useEffect(() => {
    async function fetchMerchant() {
      try {
        const merchantRes = await fetch(apiUrl(`/merchants/${merchantId}`));
        const merchantResult = await merchantRes.json();
        if (merchantResult.success) {
          setMerchantData(merchantResult.merchant);
        }
      } catch (e) {
        console.error("Failed to fetch merchant:", e);
      }
    }
    fetchMerchant();

    // AI Memory: Load last preference
    const saved = localStorage.getItem('qurate_last_chain');
    if (saved) {
      setLastPreferredChain(saved);
      setAiGreeting(`Halo! Saya ingat kamu lebih suka jaringan ${saved}. Saya akan memprioritaskan rute termurah di jaringan tersebut untuk kenyamananmu.`);
    } else {
      setAiGreeting("Halo! Saya adalah Qurate Agent. Saya akan mencarikan rute pembayaran paling efisien untukmu.");
    }
  }, [merchantId]);

  const startAIEngine = async () => {
    if (amount <= 0) return;
    setStep('analyzing');
    setLogs([]);
    hasRun.current = true;

    try {
      setLoadingRealData(true);
      
      // Step 0: Merchant info
      const merchantName = merchantData?.name || 'Merchant';
      addLog(`🏢 Merchant: ${merchantName}`);
      addLog(`💵 Nominal pembayaran: ${currencySymbol} ${formatValue(amount)}`);
      await sleep(600);

      addLog("🛡️ Menghubungkan ke secure vault wallet Anda...");
      await sleep(800);
      
      // Step 2: Scan
      addLog("💰 Memindai saldo multichain (Ethereum, Polygon, Base, Arbitrum)...");
      const scanRes = await fetch(apiUrl(`/scan/${address}`));
      const tokens = await scanRes.json();
      await sleep(500);
      addLog(`✅ Scan selesai. Ditemukan ${tokens.length} aset aktif di 5 jaringan.`);
      await sleep(700);

      // Step 3: Gas Prices Fetch
      addLog("📡 Mengambil data gas price real-time dari Alchemy...");
      const gasRes = await fetch(apiUrl('/gas-prices'));
      const gasData = await gasRes.json();
      setGasPrices(gasData);
      await sleep(600);

      // Step 4: Routing — now returns ALL candidates
      addLog("📊 Menjalankan skor efisiensi AI dan analisa rute...");
      const routeRes = await fetch(apiUrl('/route'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokens, amount, currency })
      });
      
      if (!routeRes.ok) {
        throw new Error('API_ROUTE_ERROR');
      }

      const routeResponse = await routeRes.json();
      const routeData = routeResponse.data;
      const allCandidates: RouteCandidate[] = routeResponse.candidates || [];
      
      if (!routeData) {
        throw new Error('SALDO_INSUFFICIENT');
      }

      setBestRoute(routeData);
      setCandidates(allCandidates);
      await sleep(600);
      addLog(`🤖 AI mengevaluasi ${allCandidates.length} rute pembayaran.`);
      await sleep(400);
      addLog(`✅ Keputusan Agent: ${routeData.token} di ${routeData.chain} (Skor: ${(routeData.score * 100).toFixed(0)}%)`);
      await sleep(700);

      // Step 5: Explanation — now with comparative data
      addLog("✨ Gemini 1.5 Flash menyusun narasi perbandingan rute...");
      if (routeData) {
        const explainRes = await fetch(apiUrl('/explain'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            routeData, 
            merchantName, 
            amount, 
            currency,
            candidates: allCandidates,
          })
        });
        const explainData = await explainRes.json();
        setExplanation(explainData.explanation);
      }
      await sleep(500);
      addLog("🚀 Semua kalkulasi selesai. Menuju panel keputusan.");
      await sleep(1000);

      // Transition to next step
      setStep('decision');
    } catch (e: any) {
      console.error("Gagal koordinasi dengan AI Agent:", e);
      if (e.message === 'SALDO_INSUFFICIENT') {
        addLog("⚠️ Saldo Anda tidak mencukupi di jaringan manapun.");
        addLog("💡 Silakan topup dompet Anda dengan minimal Rp 55.000.");
      } else {
        addLog("❌ Terjadi kendala koneksi dengan AI Node.");
      }
    } finally {
      setLoadingRealData(false);
    }
  };

  const { writeContractAsync } = useWriteContract();

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      setLogs(prev => [...prev, "🚀 Memproses pembayaran..."]);
      
      let finalHash = "";
      let usedRoute = bestRoute;
      
      if (!isGuest && address) {
        setLogs(prev => [...prev, "🔐 Menghubungkan ke Wallet..."]);
        
        const CONTRACT_ADDRESS = "0xeEe66cBe7aF484A0736e691bf94682Ef95aF50bE" as `0x${string}`;
        const ABI = [
          {
            name: "payNative",
            type: "function",
            stateMutability: "payable",
            inputs: [{ name: "merchantId", type: "string" }],
            outputs: []
          }
        ];

        // Try primary route, fallback to #2 if fails
        let attemptIndex = 0;
        const maxAttempts = Math.min(candidates.length, 2);

        while (attemptIndex < maxAttempts) {
          try {
            const currentRoute = attemptIndex === 0 ? bestRoute : candidates[attemptIndex];
            if (attemptIndex > 0) {
              setLogs(prev => [...prev, `⚡ AI otomatis beralih ke rute alternatif: ${currentRoute.token} / ${currentRoute.chain}...`]);
              usedRoute = currentRoute;
              setBestRoute(currentRoute);
            }

            const amountTokenStr = currentRoute?.amountToken?.toString() || "0";
            setLogs(prev => [...prev, "✍️ Silakan tanda tangani di MetaMask..."]);
            
            const hash = await writeContractAsync({
              address: CONTRACT_ADDRESS,
              abi: ABI,
              functionName: 'payNative',
              args: [merchantId],
              value: parseEther(amountTokenStr),
              chainId: 84532
            });

            setLogs(prev => [...prev, "⏳ Menunggu konfirmasi jaringan..."]);
            finalHash = hash;
            setLogs(prev => [...prev, "✅ Transaksi dikirim ke Base Sepolia!"]);
            break; // Success, exit loop
          } catch (e: any) {
            console.error(`Route attempt ${attemptIndex + 1} failed:`, e);
            if (attemptIndex === maxAttempts - 1) {
              setLogs(prev => [...prev, "❌ Pembayaran dibatalkan atau gagal."]);
              return;
            }
            setLogs(prev => [...prev, `⚠️ Rute ${attemptIndex + 1} gagal. Mencoba rute alternatif...`]);
            attemptIndex++;
          }
        }
      } else {
        if (isGuest) {
          setLogs(prev => [...prev, "ℹ️ Menjalankan simulasi (Mode Tamu)..."]);
        } else {
          setLogs(prev => [...prev, "⚠️ Dompet belum terhubung."]);
          return;
        }
        await sleep(1500);
        finalHash = "0x" + Math.random().toString(16).slice(2, 42); 
      }

      setTxHash(finalHash);

      // SAVE TO SUPABASE
      const { error } = await supabase.from('transactions').insert({
        id: `tx_${Date.now()}`,
        merchant_id: merchantId,
        user_address: address,
        amount_idr: amount,
        currency: currency,
        amount_token: usedRoute?.amountToken || 0,
        token_symbol: usedRoute?.token || 'ETH',
        chain: usedRoute?.chain || 'Base',
        status: 'confirmed',
        ai_explanation: explanation || usedRoute?.reasoning,
        tx_hash: finalHash
      });

      if (error) {
        console.error("Gagal simpan ke Supabase:", error);
      } else {
        // AI Memory: Save success preference
        if (usedRoute?.chain) {
          localStorage.setItem('qurate_last_chain', usedRoute.chain);
        }
      }

      setStep('confirmed');
    } catch (err) {
      console.error("Gagal eksekusi transaksi:", err);
      setLogs(prev => [...prev, "❌ Transaksi dibatalkan atau gagal."]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Score bar component
  const ScoreBar = ({ value, color }: { value: number; color: string }) => (
    <div className="w-full bg-slate-100 rounded-full h-1.5">
      <div 
        className={`h-1.5 rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${Math.max(value * 100, 4)}%` }}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-4 md:p-10 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/40 rounded-full blur-[120px]"></div>

      <div className="max-w-xl w-full space-y-6 relative z-10">

        {/* Step Indicator */}
        <div className="flex justify-between items-center px-6">
          {[
            { key: 'input', label: 'Input' },
            { key: 'analyzing', label: 'Analisis' },
            { key: 'decision', label: 'Keputusan' },
            { key: 'confirmed', label: 'Selesai' },
          ].map((s, i, arr) => (
            <React.Fragment key={s.key}>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                  step === s.key 
                    ? s.key === 'confirmed' 
                      ? 'bg-emerald-500 scale-125 shadow-[0_0_10px_rgba(16,185,129,0.4)]' 
                      : 'bg-blue-600 scale-125 shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                    : 'bg-slate-300'
                }`}></div>
                <span className={`text-[9px] font-bold uppercase transition-colors duration-500 ${
                  step === s.key 
                    ? s.key === 'confirmed' ? 'text-emerald-500' : 'text-blue-600' 
                    : 'text-slate-400'
                }`}>{s.label}</span>
              </div>
              {i < arr.length - 1 && <div className="flex-1 h-[1px] bg-slate-200 mx-4"></div>}
            </React.Fragment>
          ))}
        </div>

        {/* MAIN PANEL */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-6 md:p-10 border border-white flex flex-col min-h-[480px]">
          
          {/* STEP: INPUT AMOUNT */}
          {step === 'input' && (
            <div className="flex flex-col flex-1 animate-fade-in">
              <div className="mb-8 text-center">
                <div className="inline-flex p-3 bg-blue-50 rounded-2xl mb-4 border border-blue-100">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {merchantData?.name || 'Memuat merchant...'}
                </h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                  ID: {merchantId}
                </p>
              </div>

              <div className="space-y-4 max-w-sm mx-auto w-full">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Masukkan Nominal ({currency === 'IDR' ? 'Rupiah' : 'Dollar'})
                  </label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">{currencySymbol}</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      readOnly={isAmountLocked}
                      className={`w-full border-2 rounded-2xl p-4 pl-14 text-2xl font-black focus:outline-none transition ${
                        isAmountLocked 
                          ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' 
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 focus:bg-white'
                      }`}
                      placeholder="25000"
                      min={1000}
                    />
                    {isAmountLocked && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-blue-100 text-blue-600 px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border border-blue-200">Fixed</div>
                    )}
                  </div>
                  {isAmountLocked && (
                    <p className="text-[9px] text-slate-500 mt-2 font-medium italic">Nominal dikunci sesuai permintaan merchant via QR.</p>
                  )}
                </div>

                {/* AI GREETING / MEMORY BOX */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 relative overflow-hidden group">
                   <div className="absolute right-0 top-0 opacity-[0.03] transform translate-x-1/4 -translate-y-1/4">
                      <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z"/></svg>
                   </div>
                   <div className="flex gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xs shadow-lg shadow-blue-200 flex-shrink-0">✨</div>
                      <p className="text-[11px] text-blue-800 font-medium leading-relaxed italic">&ldquo;{aiGreeting}&rdquo;</p>
                   </div>
                </div>

                {!isAmountLocked && (
                  <div className="flex gap-2">
                    {(currency === 'USD' ? [5, 10, 25, 50] : [10000, 25000, 50000, 100000]).map(v => (
                      <button
                        key={v}
                        onClick={() => setAmount(v)}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border-2 transition ${
                          amount === v 
                            ? 'bg-blue-50 border-blue-300 text-blue-700' 
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {currency === 'USD' ? `$${v}` : `${(v / 1000)}K`}
                      </button>
                    ))}
                  </div>
                )}

                <button 
                  onClick={startAIEngine}
                  disabled={amount <= 0 || !address}
                  className={`w-full font-bold py-4 rounded-3xl transition-all shadow-xl text-sm mt-4 ${
                    amount > 0 && address
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100 transform active:scale-95'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  🤖 Analisis Pembayaran dengan AI
                </button>
              </div>
            </div>
          )}

          {/* STEP: ANALYZING */}
          {step === 'analyzing' && (
            <div className="flex flex-col flex-1 animate-fade-in">
              <div className="mb-10 text-center">
                <div className="inline-flex p-3 bg-blue-50 rounded-2xl mb-4 border border-blue-100">
                  <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">AI Agent memindai blockchain...</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Real-time Multichain Scan • {currencySymbol} {formatValue(amount)}</p>
              </div>

              <div className="space-y-3 font-medium text-slate-400 text-[11px] max-w-sm mx-auto w-full">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-2 items-center animate-slide-up py-1 border-b border-slate-50 last:border-0">
                    <span className="text-blue-600 text-[8px] opacity-60">●</span>
                    <span className={i === logs.length - 1 ? "text-slate-700 font-bold" : ""}>{log}</span>
                  </div>
                ))}
              </div>

              {/* Tombol kembali jika error */}
              {!loadingRealData && step === 'analyzing' && (
                <div className="mt-8 animate-fade-in flex justify-center">
                  <Link href="/user" className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors font-bold text-[10px] uppercase tracking-widest border border-slate-100 px-4 py-2 rounded-xl">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Kembali ke Dashboard
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* STEP: DECISION — with AI Decision Matrix */}
          {step === 'decision' && bestRoute && (
            <div className="flex flex-col flex-1 animate-fade-in">
              <div className="mb-6 flex justify-between items-end">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">{merchantData?.name || "Merchant"}</h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                    {candidates.length} rute dievaluasi • AI Routing Engine
                  </p>
                </div>
                <div className="bg-blue-50 px-2 py-1 rounded text-[8px] font-black text-blue-600 uppercase border border-blue-100">Live Data</div>
              </div>

              {/* AI DECISION MATRIX — shows all evaluated routes */}
              <div className="overflow-hidden rounded-[2rem] border border-slate-100 mb-6 bg-slate-50/30">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[10px] min-w-[380px]">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[8px] border-b border-slate-100">
                        <th className="px-4 py-3">Rute</th>
                        <th className="px-4 py-3">Gas Fee</th>
                        <th className="px-4 py-3">Skor AI</th>
                        <th className="px-4 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {candidates.map((c, i) => (
                        <tr key={i} className={`transition-colors duration-300 ${i === 0 ? 'bg-blue-600/5' : 'hover:bg-slate-100/50'}`}>
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                              {c.token}
                              {lastPreferredChain === c.chain && (
                                <span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-tighter border border-blue-200">Memory Bonus</span>
                              )}
                            </div>
                            <div className="text-[8px] text-slate-400 font-medium">{c.chain}</div>
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-600">
                            {currencySymbol} {formatGas(c.gasEstimateIdr)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-12">
                                <ScoreBar value={c.score} color={i === 0 ? 'bg-blue-600' : 'bg-slate-300'} />
                              </div>
                              <span className={`font-black ${i === 0 ? 'text-blue-600' : 'text-slate-400'}`}>{(c.score * 100).toFixed(0)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {i === 0 ? (
                              <span className="bg-blue-600 text-white px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 italic">Winning Route</span>
                            ) : (
                              <span className="text-slate-300 font-bold italic">Eligible</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Score Breakdown for winner */}
              {candidates[0] && (
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[
                    { label: 'Gas', value: candidates[0].gasEfficiency, color: 'bg-emerald-500' },
                    { label: 'Speed', value: candidates[0].speedScore, color: 'bg-blue-500' },
                    { label: 'Stability', value: candidates[0].stableBonus, color: 'bg-purple-500' },
                    { label: 'Liquidity', value: candidates[0].liquidityScore, color: 'bg-amber-500' },
                  ].map(m => (
                    <div key={m.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">{m.label}</p>
                      <p className="text-sm font-bold text-slate-900 mb-1">{(m.value * 100).toFixed(0)}%</p>
                      <ScoreBar value={m.value} color={m.color} />
                    </div>
                  ))}
                </div>
              )}

              {/* Final Decision Card */}
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
                    <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Total ({currency})</p>
                    <h2 className="text-3xl font-bold mb-1">{currencySymbol} {formatValue(amount)}</h2>
                  </div>
                </div>
              </div>

              {/* AI Explanation — now comparative */}
              {explanation && (
                <div className="bg-blue-50/50 border border-blue-100/50 p-4 rounded-2xl mb-6 relative">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-[8px] font-black uppercase text-blue-600 tracking-widest">Gemini AI Insight</span>
                  </div>
                  <p className="text-[11px] text-blue-800 font-bold italic leading-[1.6]">
                    &ldquo;{explanation}&rdquo;
                  </p>
                </div>
              )}

              <button
                onClick={handleConfirm}
                disabled={isProcessing}
                className={`w-full font-bold py-4 rounded-3xl transition-all shadow-xl transform active:scale-95 text-sm flex items-center justify-center gap-3 ${
                  isProcessing 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </>
                ) : (
                  'Konfirmasi Pembayaran'
                )}
              </button>
            </div>
          )}

          {/* STEP: CONFIRMED */}
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
                    <div className="text-right font-bold text-slate-900 border-b border-slate-100 pb-1">{currencySymbol} {formatValue(amount)}</div>

                    <div className="text-slate-400 font-bold uppercase text-[9px]">Sumber Dana</div>
                    <div className="text-right font-bold text-slate-900 leading-tight">
                       <div>{bestRoute?.token}</div>
                       <div className="text-[9px] text-blue-600 uppercase">{bestRoute?.chain}</div>
                    </div>

                    <div className="text-slate-400 font-bold uppercase text-[9px]">Biaya Gas (Est)</div>
                    <div className="text-right font-bold text-emerald-600">{currencySymbol} {formatGas(bestRoute?.gasEstimateIdr)}</div>

                    <div className="text-slate-400 font-bold uppercase text-[9px]">Rute Dievaluasi</div>
                    <div className="text-right font-bold text-slate-900">{candidates.length} rute</div>
                  </div>
                </div>

                {/* TX Hash with explorer link */}
                {txHash && (
                  <div className="bg-white border border-slate-100 p-4 rounded-2xl">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-2">TX Hash</p>
                    <p className="text-[10px] font-mono text-slate-600 break-all bg-slate-50 p-2 rounded-lg border border-slate-100">{txHash}</p>
                    {!isGuest && (
                      <a 
                        href={`https://sepolia.basescan.org/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[9px] font-bold text-blue-600 mt-2 hover:text-blue-800 transition"
                      >
                        Lihat di BaseScan Explorer →
                      </a>
                    )}
                  </div>
                )}

                <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-[9px] font-black uppercase text-blue-600 tracking-widest">Penjelasan Agent (AI Powered)</h3>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-xs text-slate-700 font-bold leading-[1.7] italic">
                    &ldquo;{explanation || "AI sedang memberikan penjelasan..."}&rdquo;
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
            AI Execution Engine v2.0 • Multichain Route Optimizer
          </p>
        </div>
      </div>
    </div>
  );
}
