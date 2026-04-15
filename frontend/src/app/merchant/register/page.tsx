"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Store, Wallet, ArrowRight, CheckCircle2 } from 'lucide-react';
import { apiUrl } from '@/lib/api';

export default function RegisterMerchantPage() {
  const router = useRouter();
  const { address } = useAccount();
  const [storeName, setStoreName] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill wallet address if connected
  useEffect(() => {
    if (address && !walletAddress) {
      setWalletAddress(address);
    }
  }, [address, walletAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(apiUrl('/merchants'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: storeName, walletAddress }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      // Save merchant ID to localStorage so dashboard can pick it up
      localStorage.setItem('merchant_id', data.data.id);
      
      // Redirect to dashboard
      router.push('/merchant');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/40 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/40 rounded-full blur-[100px]"></div>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100 relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Store size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Mulai sebagai Merchant</h1>
          <p className="text-slate-500 font-medium text-sm mt-2">Daftarkan toko Anda dan terima pembayaran AI cross-chain secara instan.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nama Toko</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-slate-400"><Store size={18} /></span>
              <input 
                type="text" 
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                required
                placeholder="Contoh: Coffee Shop Jakarta"
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 pl-12 text-sm font-semibold text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none transition placeholder-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Alamat Dompet Penerima (Wallet)</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-slate-400"><Wallet size={18} /></span>
              <input 
                type="text" 
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                required
                placeholder="0x..."
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 pl-12 text-sm font-semibold text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none transition font-mono"
              />
            </div>
            {address && walletAddress === address && (
              <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
                <CheckCircle2 size={14} /> Terhubung dan terisi otomatis
              </p>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full py-4 rounded-2xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
              isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 active:scale-95'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                Memproses...
              </span>
            ) : (
              <>Klaim Merchant ID <ArrowRight size={18} /></>
            )}
          </button>
        </form>
      </div>

      <button onClick={() => router.push('/')} className="mt-8 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-800 transition">
        ← Kembali ke Beranda
      </button>
    </div>
  );
}
