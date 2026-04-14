"use client";

import React, { useState, useEffect } from 'react';
import MerchantQR from '@/components/MerchantQR';
import StaticMerchantQR from '@/components/StaticMerchantQR';
import { supabase } from '@/lib/supabase';

// Helper to format Date
const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

export default function MerchantDashboard() {
  const [amount, setAmount] = useState<number>(25000);
  const [showQr, setShowQr] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dynamic' | 'static'>('static');
  
  // Realtime Data State
  const [dbTransactions, setDbTransactions] = useState<any[]>([]);
  const [totalIdr, setTotalIdr] = useState<number>(0);
  const [favoriteToken, setFavoriteToken] = useState<string>('-');

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
  };

  useEffect(() => {
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('merchant_id', 'm_nabiel_001')
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (!error && data) {
        setDbTransactions(data);
        calculateStats(data);
      }
    };
    
    fetchHistory();
    let pollInterval: NodeJS.Timeout;

    const channel = supabase.channel('merchant-room')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' }, (payload) => {
        console.log("Realtime Event Diterima:", payload);
        if (payload.new && payload.new.merchant_id === 'm_nabiel_001') {
          fetchHistory(); // Always re-fetch to ensure data consistency
        }
      })
      .subscribe((status) => {
        console.log("Supabase Realtime Status:", status);
        // Fallback: If websocket fails or times out (e.g. strict firewall), start HTTP polling
        if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          console.log("⚠️ Mengaktifkan Polling Mode (3s) sebagai strategi *fallback* demo.");
          pollInterval = setInterval(fetchHistory, 3000);
        }
      });

    return () => {
      supabase.removeChannel(channel);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Dashboard */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="mb-6 md:mb-0">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Qurate Merchant</h1>
            <p className="text-slate-500 font-medium mt-1">ID: m_nabiel_001 • Warung Nabiel</p>
          </div>
          
          {/* Stats Cards Dynamic */}
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex-1 md:min-w-[140px]">
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Total Hari Ini</p>
              <p className="text-2xl font-black text-blue-900">Rp {(totalIdr / 1000).toLocaleString('id-ID')}Rb</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex-1 md:min-w-[140px]">
              <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">Total TX</p>
              <p className="text-2xl font-black text-emerald-900">{dbTransactions.length}</p>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex-1 md:min-w-[140px]">
              <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">Top Token</p>
              <p className="text-2xl font-black text-indigo-900">{favoriteToken}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Panel: QR GENERATOR (Step 11 point 1 & 2) */}
          <div className="col-span-1 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
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
              <div className="space-y-5 animate-fade-in">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tagihan (Rp)</label>
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
                  <label className="block text-sm font-bold text-slate-700 mb-2">Preferensi Token</label>
                  <select className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none appearance-none transition">
                    <option value="ANY">Serahkan ke AI (Disarankan)</option>
                    <option value="USDC">Hanya USDC</option>
                    <option value="USDT">Hanya USDT</option>
                  </select>
                </div>
                <button 
                  onClick={() => {
                    setShowQr(false);
                    setTimeout(() => setShowQr(true), 100);
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg py-4 rounded-xl transition shadow-lg mt-2"
                >
                  Generate QR
                </button>
              </div>
            ) : (
              <div className="text-center py-6 animate-fade-in space-y-4">
                <StaticMerchantQR merchantId="m_nabiel_001" merchantName="Warung Nabiel" />
                <p className="text-sm text-slate-500">Cetak QR ini dan tempel di meja kasir. Customer akan menginput nominal sendiri.</p>
                <button 
                  onClick={() => {
                    // Trigger download of the static QR canvas
                    const canvas = document.querySelector('#static-qr-canvas') as HTMLCanvasElement;
                    if (canvas) {
                      const url = canvas.toDataURL("image/png");
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `Qurate-Static-m_nabiel_001.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                  className="bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition"
                >
                  Download Standee (PNG)
                </button>
              </div>
            )}

            {showQr && activeTab === 'dynamic' && (
              <div className="mt-8 pt-8 border-t border-slate-100 flex justify-center animate-fade-in relative">
                <div className="absolute top-0 transform -translate-y-1/2 bg-white px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Preview QR</div>
                <MerchantQR 
                  merchantId="m_nabiel_001" 
                  amountIdr={amount} 
                  txId={`TX-${Math.floor(Math.random()*100000)}`}
                  // Set timer 120 seconds
                  expires={Math.floor(Date.now() / 1000) + 120} 
                />
              </div>
            )}
          </div>

          {/* Right Panel: TRANSACTIONS TABLE (Step 11 point 3) */}
          <div className="col-span-1 lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
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
                    <th className="p-4 font-bold">Token Info</th>
                    <th className="p-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dbTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500 font-medium">Menunggu transaksi hari ini...</td>
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

            {/* AI Insights Card (From Step 11 / PRD Demo) */}
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z"/></svg>
              </div>
              <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                <span className="text-xl">✨</span> AI Insight
              </h3>
              <p className="text-sm font-medium text-blue-800 leading-relaxed max-w-lg">
                Pelanggan kamu paling sering bayar antara jam 11-13 siang. Kebanyakan pakai USDC di jaringan Base karena lebih murah. Rata-rata belanja Rp 28.333.
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
