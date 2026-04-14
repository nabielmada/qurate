"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useWallet } from '@/context/WalletContext';
import { supabase } from '@/lib/supabase';

export default function UserDashboard() {
  const { address, isGuest, logout } = useWallet();
  const [tokens, setTokens] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [currency, setCurrency] = useState<'IDR' | 'USD' | 'MYR' | 'SGD' | 'EUR'>('IDR');
  const [rates, setRates] = useState<Record<string, number>>({ IDR: 16000, USD: 1, MYR: 4.7, SGD: 1.35, EUR: 0.94 });
  const hasRun = useRef(false);

  const defaultRates: Record<string, number> = {
    USD: 1,
    IDR: 16000,
    MYR: 4.7,
    SGD: 1.35,
    EUR: 0.94,
  };

  const currencySymbols: Record<string, string> = {
    IDR: 'Rp',
    USD: '$',
    MYR: 'RM',
    SGD: 'S$',
    EUR: '€',
  };

  useEffect(() => {
    if (!address) return;
    // We allow re-fetch if address changes, but guard against double-render in dev
    if (hasRun.current && address === hasRun.current as any) return;

    async function fetchData() {
      try {
        setLoading(true);

        // 1. Fetch Balances from Backend
        const res = await fetch(`http://127.0.0.1:3001/api/scan/${address}`);
        const balanceData = await res.json();
        
        if (!Array.isArray(balanceData)) {
          console.error("Data dari backend bukan array:", balanceData);
          setLoading(false);
          return;
        }

        const enriched = balanceData.map((t: any, i: number) => ({
          ...t,
          color: i % 2 === 0 ? 'bg-blue-600' : 'bg-emerald-500',
          allocation: `${((t.usdValue / balanceData.reduce((a: any, b: any) => a + b.usdValue, 0)) * 100).toFixed(0)}%`
        }));
        setTokens(enriched);

        // 2. Fetch Transactions from Supabase
        const { data: txData, error } = await supabase
          .from('transactions')
          .select('*, merchants(name)')
          .eq('user_address', address)
          .order('created_at', { ascending: false })
          .limit(5);

        if (!error && txData) {
          setTransactions(txData);
        }

        // 3. Fetch Rates
        const ratesRes = await fetch(`http://127.0.0.1:3001/api/rates`);
        const ratesData = await ratesRes.json();
        if (ratesData) setRates(ratesData);
      } catch (err) {
        console.error("Gagal sinkronisasi data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    // hasRun.current = address as any;
  }, [address]);

  const totalBalanceLocal = tokens.reduce((acc, curr) => {
    const rate = rates[currency] || (currency === 'IDR' ? 16000 : 1);
    return acc + (curr.usdValue * rate);
  }, 0);

  const formatCurrency = (val: number) => {
    const symbol = currencySymbols[currency];
    const isIdr = currency === 'IDR';
    return `${symbol} ${val.toLocaleString(isIdr ? 'id-ID' : 'en-US', {
      maximumFractionDigits: isIdr ? 0 : 2,
      minimumFractionDigits: isIdr ? 0 : 2
    })}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-6 md:p-12 flex flex-col items-center relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[120px]"></div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">Qurate Wallet</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-slate-400 font-bold uppercase text-[8px]">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
              <div className={`w-1 h-1 ${isGuest ? 'bg-amber-500' : 'bg-emerald-500'} rounded-full animate-pulse`}></div>
              <p className={`${isGuest ? 'text-amber-600' : 'text-emerald-600'} font-bold uppercase text-[8px]`}>
                {isGuest ? 'Guest Demo Mode' : 'Real-time Connected'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm hover:bg-slate-50 transition-colors group"
              title="Logout"
            >
              <svg className="w-5 h-5 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </button>
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            </div>
          </div>
        </div>

        {/* Currency Selector */}
        <div className="flex justify-center relative z-20">
          <div className="bg-white/80 backdrop-blur-md p-1 rounded-2xl flex gap-1 border border-white shadow-sm">
            {(['IDR', 'MYR', 'SGD', 'USD'] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => setCurrency(curr)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${currency === curr
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                {curr}
              </button>
            ))}
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
                {formatCurrency(totalBalanceLocal)}
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
            <button className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">{loading ? 'Scanning...' : 'Real-time scan'}</button>
          </div>

          <div className="space-y-4">
            {!loading && tokens.length > 0 ? (
              tokens.map((token, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${token.color} rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-lg group-hover:scale-110 transition-transform`}>
                      {token.symbol[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-none mb-1">{token.symbol}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{token.chain}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900 leading-none mb-1">{token.balance.toFixed(4)}</p>
                    <p className="text-[9px] font-bold text-slate-400 leading-none">
                      {formatCurrency(token.usdValue * (rates[currency] || 1))}
                    </p>
                  </div>
                </div>
              ))
            ) : loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-10 w-full bg-slate-100 animate-pulse rounded-xl"></div>
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
            {!loading && transactions.length > 0 ? (
              transactions.map((tx, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center`}>
                      <svg className="w-4 h-4 uppercase" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-none">Bayar ke {tx.merchants?.name || 'Merchant'}</p>
                      <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">
                        {new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <p className={`text-xs font-bold text-slate-900`}>
                    -{currencySymbols[currency]} {(Number(tx.amount_idr) / (rates['IDR'] || 16000) * (rates[currency] || 1)).toLocaleString(undefined, {
                      maximumFractionDigits: currency === 'IDR' ? 0 : 2,
                      minimumFractionDigits: currency === 'IDR' ? 0 : 2
                    })}
                  </p>
                </div>
              ))
            ) : loading ? (
              <div className="h-20 w-full bg-slate-50 animate-pulse rounded-xl"></div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">Belum ada transaksi.</div>
            )}
          </div>
        </div>

        <div className="pt-4 text-center pb-12 opacity-40">
          <Link href="/" className="text-slate-500 text-[10px] font-bold uppercase">← Kembali ke Home</Link>
        </div>

      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in"
            onClick={() => setShowLogoutModal(false)}
          ></div>
          <div className="bg-white rounded-[2rem] p-6 max-w-[280px] w-full relative z-10 shadow-2xl border border-white animate-scale-up">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mb-4 mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">Yakin keluar?</h3>
            <p className="text-[10px] text-slate-500 text-center mb-6 font-medium">Anda perlu menghubungkan wallet kembali nanti.</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={logout}
                className="w-full bg-red-600 text-white font-bold py-3 rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 text-xs"
              >
                Ya, Keluar
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="w-full bg-slate-50 text-slate-500 font-bold py-3 rounded-2xl hover:bg-slate-100 transition-all text-xs"
              >
                Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
