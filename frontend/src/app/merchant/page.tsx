"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import MerchantQR from '@/components/MerchantQR';
import StaticMerchantQR from '@/components/StaticMerchantQR';
import { supabase } from '@/lib/supabase';
import { apiUrl } from '@/lib/api';
import { CheckCircle2, ShieldAlert, Sparkles, X } from 'lucide-react';

// Static ABI and Contract specifically for this routing scenario
const CONTRACT_ADDRESS = "0xeEe66cBe7aF484A0736e691bf94682Ef95aF50bE" as `0x${string}`;
const PayAIRouterABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "merchantId", "type": "string" },
      { "internalType": "address", "name": "wallet", "type": "address" }
    ],
    "name": "registerMerchant",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "merchantId", "type": "string" }
    ],
    "name": "getMerchantWallet",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "string", "name": "merchantId", "type": "string" },
      { "indexed": true, "internalType": "address", "name": "merchantAddress", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "sender", "type": "address" },
      { "indexed": false, "internalType": "address", "name": "token", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "PaymentReceived",
    "type": "event"
  }
];

// Helper to format Date
const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

export default function MerchantDashboard() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [merchantData, setMerchantData] = useState<any>(null);
  
  const [amount, setAmount] = useState<number>(25000);
  const [showQr, setShowQr] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dynamic' | 'static'>('static');
  
  // Realtime Data State
  const [dbTransactions, setDbTransactions] = useState<any[]>([]);
  const [totalIdr, setTotalIdr] = useState<number>(0);
  const [favoriteToken, setFavoriteToken] = useState<string>('-');
  const [aiInsight, setAiInsight] = useState<string>('Menganalisa data transaksi...');
  
  // Real-time Notification State
  const [newPayment, setNewPayment] = useState<any | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  // Smart Contract Interaction
  const { data: contractWallet, refetch: refetchContract } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PayAIRouterABI,
    functionName: 'getMerchantWallet',
    args: merchantId ? [merchantId] : undefined,
    query: {
      enabled: !!merchantId,
    }
  });

  const { writeContractAsync, isPending } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  
  const { isLoading: isSyncing, isSuccess: isSynced } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isSynced) {
      refetchContract().then(() => {
        window.location.reload();
      });
    }
  }, [isSynced, refetchContract]);

  const handleSyncBlockchain = async () => {
    if (!merchantId || !merchantData?.wallet_address) return;
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: PayAIRouterABI,
        functionName: 'registerMerchant',
        args: [merchantId, merchantData.wallet_address],
      });
      setTxHash(hash);
    } catch (e) {
      console.error("Gagal sinkronisasi blockchain:", e);
    }
  };

  // 1. Real-time On-Chain Watcher
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: PayAIRouterABI,
    eventName: 'PaymentReceived',
    onLogs(logs: any) {
      logs.forEach((log: any) => {
        if (log.args.merchantId === merchantId) {
          console.log("🔥 On-Chain Payment Detected!", log.args);
          setNewPayment({
            amount: log.args.amount,
            sender: log.args.sender,
          });
          setShowOverlay(true);
          
          // Play sound (Optional browser behavior)
          try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
            audio.play();
          } catch(e) {}
        }
      });
    },
  });

  // Reset overlay after 8 seconds
  useEffect(() => {
    if (showOverlay) {
      const timer = setTimeout(() => setShowOverlay(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [showOverlay]);

  // On Load: Verify Merchant Setup
  useEffect(() => {
    const id = localStorage.getItem('merchant_id');
    if (!id) {
      router.push('/merchant/register');
      return;
    }
    setMerchantId(id);

    // Fetch backend data
    const fetchMerchant = async () => {
      try {
        const res = await fetch(apiUrl(`/merchants/${id}`));
        const data = await res.json();
        if (data.success) {
          setMerchantData(data.merchant);
        } else {
          // invalid ID
          localStorage.removeItem('merchant_id');
          router.push('/merchant/register');
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchMerchant();
  }, [router]);

  // Calculate dynamic stats
  const calculateStats = (txs: any[]) => {
    const todayTxs = txs.filter(tx => {
      if(!tx.created_at) return true;
      const txDate = new Date(tx.created_at);
      const now = new Date();
      return txDate.getDate() === now.getDate() && txDate.getMonth() === now.getMonth();
    });
    
    const sumIdr = todayTxs.reduce((acc, curr) => acc + Number(curr.amount_idr || 0), 0);
    setTotalIdr(sumIdr);

    const tokenCounts: Record<string, number> = {};
    txs.forEach(tx => {
      const sym = tx.token_symbol || 'ETH';
      tokenCounts[sym] = (tokenCounts[sym] || 0) + 1;
    });
    const sortedTokens = Object.entries(tokenCounts).sort((a, b) => b[1] - a[1]);
    if (sortedTokens.length > 0) {
      setFavoriteToken(sortedTokens[0][0]);
    } else {
      setFavoriteToken('-');
    }

    // Generate AI Insight Text
    generateInsight(txs, sumIdr);
  };

  const generateInsight = (txs: any[], todaySumIdr: number) => {
    if (txs.length === 0) {
      setAiInsight("Belum ada data transaksi yang cukup untuk dianalisa.");
      return;
    }
    
    const sumAll = txs.reduce((acc, curr) => acc + Number(curr.amount_idr || 0), 0);
    const avg = Math.round(sumAll / txs.length);

    const hours = txs.map(t => t.created_at ? new Date(t.created_at).getHours() : -1).filter(h => h !== -1);
    
    let timeRange = "sepanjang hari";
    if (hours.length > 0) {
      const hourCounts: Record<number, number> = {};
      hours.forEach(h => hourCounts[h] = (hourCounts[h] || 0) + 1);
      const sortedHours = Object.entries(hourCounts).sort((a, b) => b[1] - a[1]);
      const peakHour = Number(sortedHours[0][0]);
      timeRange = `sekitar jam ${peakHour}:00 - ${peakHour+2}:00 WIB`;
    }

    const pairCounts: Record<string, number> = {};
    txs.forEach(t => {
       const pair = `${t.token_symbol || 'Token'} di jaringan ${t.chain || 'Base'}`;
       pairCounts[pair] = (pairCounts[pair] || 0) + 1;
    });
    const sortedPairs = Object.entries(pairCounts).sort((a,b)=>b[1]-a[1]);
    const topPair = sortedPairs.length > 0 ? sortedPairs[0][0] : 'USDC di Base';
    
    setAiInsight(`Pelanggan sering berbelanja ${timeRange}. Mayoritas dominan menggunakan ${topPair} mengingat biaya / kenyamanannya. Rata-rata ukuran keranjang belanja per struk adalah Rp ${avg.toLocaleString('id-ID')}.`);
  };

  useEffect(() => {
    if (!merchantId) return;

    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (!error && data) {
        setDbTransactions(data);
        calculateStats(data);
      }
    };
    
    fetchHistory();
    let pollInterval: NodeJS.Timeout;

    const channel = supabase.channel(`merchant-room-${merchantId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' }, (payload) => {
        if (payload.new && payload.new.merchant_id === merchantId) {
          fetchHistory();
          
          // Trigger notification for Guest Mode or if On-chain event hasn't already fired
          if (!showOverlay) {
            setNewPayment({
              amount: payload.new.amount_token,
              sender: payload.new.user_address || 'Guest User',
            });
            setShowOverlay(true);
            
            // Audio skip if already played by hook is handled by short-circuit above
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
              audio.play();
            } catch(e) {}
          }
        }
      })
      .subscribe((status) => {
        if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          pollInterval = setInterval(fetchHistory, 3000);
        }
      });

    return () => {
      supabase.removeChannel(channel);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [merchantId]);

  if (!merchantId || !merchantData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
         <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Contract wallet is registered if it is not the zero address
  const isRegisteredOnChain = contractWallet && contractWallet !== '0x0000000000000000000000000000000000000000';

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800 flex flex-col relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl w-full mx-auto space-y-6 relative z-10 flex-1">
        
        {/* Header Dashboard */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center gap-3 mb-2">
               <h1 className="text-3xl font-black text-slate-900 tracking-tight">{merchantData.name}</h1>
               {isRegisteredOnChain ? (
                 <span className="bg-emerald-100 text-emerald-700 p-1.5 rounded-full shadow-sm" title="On-Chain Sync Selesai">
                   <CheckCircle2 size={16} />
                 </span>
               ) : (
                 <span className="bg-amber-100 text-amber-700 p-1.5 rounded-full shadow-sm" title="Belum Sinkronisasi Blockchain">
                   <ShieldAlert size={16} />
                 </span>
               )}
            </div>
            <p className="text-slate-400 font-medium font-mono text-xs uppercase tracking-widest bg-slate-50 inline-block px-3 py-1 rounded-lg border border-slate-100">
              ID: {merchantId} • WALLET: {merchantData.wallet_address.substring(0,6)}...{merchantData.wallet_address.substring(merchantData.wallet_address.length-4)}
            </p>
          </div>
          
          {/* Stats Cards Dynamic */}
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex-1 md:min-w-[140px] shadow-sm">
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Total Hari Ini</p>
              <p className="text-2xl font-black text-blue-900">Rp {(totalIdr / 1000).toLocaleString('id-ID')}Rb</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex-1 md:min-w-[140px] shadow-sm">
              <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">Total TX</p>
              <p className="text-2xl font-black text-emerald-900">{dbTransactions.length}</p>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex-1 md:min-w-[140px] shadow-sm">
              <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">Top Token</p>
              <p className="text-2xl font-black text-indigo-900">{favoriteToken}</p>
            </div>
          </div>
        </div>

        {/* Sync Prompt if not synced */}
        {!isRegisteredOnChain && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm overflow-hidden relative">
             <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z"/></svg>
             </div>
             <div className="relative z-10 w-full md:w-auto flex-1">
               <h3 className="text-xl font-bold text-amber-900 mb-2 flex items-center gap-2"> Sinkronisasi Blockchain Diperlukan!</h3>
               <p className="text-amber-800 text-sm font-medium leading-relaxed max-w-2xl">
                 Toko Anda tercatat di Supabase, namun untuk dapat menerima pembayaran kripto langsung, ID Toko Anda perlu didaftarkan di dalam Smart Contract (Base Network). Ini menjamin dana akan masuk langsung ke dompet Anda tanpa perantara.
               </p>
             </div>
             <div className="relative z-10 flex border-2 border-transparent">
               {!isConnected ? (
                 <ConnectButton />
               ) : (
                 <button 
                   onClick={handleSyncBlockchain}
                   disabled={isPending || isSyncing}
                   className={`whitespace-nowrap px-8 py-4 font-bold rounded-2xl transition relative z-10 ${
                     isPending || isSyncing 
                       ? 'bg-amber-200 text-amber-600 cursor-not-allowed shadow-none' 
                       : 'bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-500/30'
                   }`}
                 >
                   {isPending ? 'Konfirmasi di Wallet...' : isSyncing ? 'Merekam di Blockchain...' : 'Sync Data Sekarang ✨'}
                 </button>
               )}
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Panel: QR GENERATOR */}
          <div className="col-span-1 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full">
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
              <button 
                onClick={() => setActiveTab('dynamic')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${activeTab === 'dynamic' ? 'bg-white text-blue-600 shadow' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Dynamic QR
              </button>
              <button 
                onClick={() => setActiveTab('static')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${activeTab === 'static' ? 'bg-white text-blue-600 shadow' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Static QR
              </button>
            </div>

            {activeTab === 'dynamic' ? (
              <div className="space-y-5 animate-fade-in flex-1">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tagihan Dinamis (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-slate-400 font-bold">Rp</span>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 pl-12 text-lg font-bold text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Preferensi Token Kasir</label>
                  <select className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none appearance-none transition">
                    <option value="ANY">Serahkan Keputusan Pada AI</option>
                    <option value="USDC">Hanya Menerima USDC</option>
                    <option value="USDT">Hanya Menerima USDT</option>
                  </select>
                </div>
                <button 
                  onClick={() => {
                    setShowQr(false);
                    setTimeout(() => setShowQr(true), 100);
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg py-4 rounded-xl transition shadow-lg mt-2 flex items-center justify-center gap-2"
                >
                  Generate Dynamic QR
                </button>
              </div>
            ) : (
              <div className="text-center py-6 animate-fade-in space-y-4 flex-1 flex flex-col justify-center">
                <StaticMerchantQR merchantId={merchantId} merchantName={merchantData.name} />
                <p className="text-sm text-slate-500">Cetak QR ini dan tempel di meja kasir. Customer akan menginput nominal sendiri dan AI akan mengkalkulasinya.</p>
                <button 
                  onClick={() => {
                    const canvas = document.querySelector('#static-qr-canvas') as HTMLCanvasElement;
                    if (canvas) {
                      const url = canvas.toDataURL("image/png");
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `Qurate-Static-${merchantId}.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                  className="bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
                >
                  Download Standee (PNG)
                </button>
              </div>
            )}

            {showQr && activeTab === 'dynamic' && (
              <div className="mt-8 pt-8 border-t border-slate-100 flex justify-center animate-fade-in relative">
                <div className="absolute top-0 transform -translate-y-1/2 bg-white px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Preview Dynamic QR</div>
                <MerchantQR 
                  merchantId={merchantId} 
                  amountIdr={amount} 
                  txId={`TX-${Math.floor(Math.random()*100000)}`}
                  expires={Math.floor(Date.now() / 1000) + 120} 
                />
              </div>
            )}
          </div>

          {/* Right Panel: TRANSACTIONS TABLE */}
          <div className="col-span-1 lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 h-full flex flex-col">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-xl font-bold text-slate-800">Riwayat Pembayaran</h2>
              <button className="text-sm font-bold text-blue-600 hover:text-blue-800 transition">Lihat Semua →</button>
            </div>
            
            <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-widest bg-slate-100/50">
                    <th className="p-4 font-bold">Waktu</th>
                    <th className="p-4 font-bold">Nominal (IDR)</th>
                    <th className="p-4 font-bold">Dana Masuk</th>
                    <th className="p-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dbTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500 font-medium">Menunggu pelanggan pertama hari ini...</td>
                    </tr>
                  ) : dbTransactions.map((tx, index) => (
                    <tr key={tx.id || index} className={`hover:bg-white transition group ${index === 0 ? 'bg-emerald-50/50' : 'bg-slate-50'}`}>
                      <td className="p-4 font-medium text-sm text-slate-500">{tx.created_at ? formatTime(tx.created_at) : '-'} WIB</td>
                      <td className="p-4 font-black text-lg text-slate-900">Rp {Number(tx.amount_idr).toLocaleString('id-ID')}</td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-blue-600 text-sm">{tx.token_symbol || 'ETH'}</span>
                          <span className="text-xs font-semibold text-slate-400 mt-0.5">on {tx.chain || 'Base'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                          Sukses
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* AI Insights Card */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-sm flex-1 flex flex-col justify-center">
              <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z"/></svg>
              </div>
              <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-3 text-lg">
                <span className="text-2xl bg-white p-2 rounded-xl shadow-sm text-blue-600">✨</span> Laporan Intelijen AI
              </h3>
              <p className="text-sm font-medium text-blue-800 leading-relaxed max-w-2xl">
                {aiInsight}
              </p>
            </div>
            
          </div>
        </div>
      </div>
      
      {/* Real-time Payment Success Overlay */}
      {showOverlay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-2xl border-4 border-emerald-400 relative overflow-hidden animate-in zoom-in slide-in-from-bottom-10 duration-500">
              <div className="absolute top-0 right-0 p-4">
                 <button onClick={() => setShowOverlay(false)} className="text-slate-300 hover:text-slate-500 transition">
                    <X size={24} />
                 </button>
              </div>
              
              <div className="flex flex-col items-center text-center space-y-6">
                 <div className="relative">
                    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                       <Sparkles size={48} />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-2 rounded-full animate-pulse shadow-lg">
                       <CheckCircle2 size={24} />
                    </div>
                 </div>

                 <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">BINGGO! 💰</h2>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Pembayaran Baru Diterima</p>
                 </div>

                 <div className="bg-slate-50 w-full p-6 rounded-3xl border-2 border-slate-100">
                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Status Blokir (Atomik)</p>
                    <p className="text-2xl font-black text-emerald-600">DIBAYAR LUNAS</p>
                    <div className="mt-4 pt-4 border-t border-slate-200">
                       <p className="text-[10px] text-slate-400 font-mono break-all">Sender: {newPayment?.sender?.substring(0,20)}...</p>
                    </div>
                 </div>

                 <button 
                  onClick={() => setShowOverlay(false)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/30 transition transform active:scale-95"
                 >
                   MANTAP! (Tutup)
                 </button>
              </div>

              {/* Success Confetti Effect (Simple CSS) */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                 {[...Array(6)].map((_, i) => (
                    <div key={i} className={`absolute w-4 h-4 rounded-sm animate-ping bg-blue-500`} style={{ top: `${Math.random()*100}%`, left: `${Math.random()*100}%`, animationDelay: `${i*0.5}s` }}></div>
                 ))}
              </div>
           </div>
        </div>
      )}

      <div className="text-center pt-8 opacity-40">
        <button onClick={() => {
            localStorage.removeItem('merchant_id'); 
            router.push('/');
        }} className="text-xs font-bold text-slate-500 hover:text-slate-800 uppercase tracking-widest border-b border-transparent hover:border-slate-800 transition">← Logout Merchant</button>
      </div>

    </div>
  );
}
