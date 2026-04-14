"use client";

import React, { useState } from 'react';

// Mock types
interface PaymentData {
  merchantName: string;
  amountIdr: number;
}

export default function PaymentScreen() {
  const [step, setStep] = useState<'scan' | 'loading' | 'decision' | 'success'>('scan');
  
  // Simulated data from QR
  const [paymentData] = useState<PaymentData>({
    merchantName: "Warung Bu Sri",
    amountIdr: 25000,
  });

  const [aiDecision, setAiDecision] = useState<any>(null);
  const [txHash, setTxHash] = useState<string>('');

  const handleSimulateScan = () => {
    setStep('loading');
    
    // Simulate AI scanning and deciding (takes 2 seconds)
    setTimeout(() => {
      setAiDecision({
        token: 'USDC',
        chain: 'Base',
        gasEstimate: 87, // Rp 87
        explanation: 'Saya memakai USDC kamu di jaringan Base karena paling hemat. Biayanya cuma Rp 87 - jauh lebih murah dari rute lain.',
      });
      setStep('decision');
    }, 2000);
  };

  const handlePay = () => {
    // Simulate payment transaction execution
    setTimeout(() => {
      setTxHash('0xabc123def456ghi789jkl012mno345pqr678stu901vwx234yz567');
      setStep('success');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans text-gray-800">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-300">
        
        {/* Header Block (Hidden on Success) */}
        {step !== 'success' && (
          <div className="bg-blue-600 p-8 text-center text-white">
            <p className="text-sm opacity-80 mb-1 font-medium tracking-wide uppercase">Membayar Ke</p>
            <h2 className="text-2xl font-bold">{paymentData.merchantName}</h2>
            <p className="text-4xl font-black mt-3">Rp {paymentData.amountIdr.toLocaleString('id-ID')}</p>
          </div>
        )}

        <div className="p-6">
          {/* STEP 1: SCAN */}
          {step === 'scan' && (
            <div className="flex flex-col items-center text-center animate-fade-in">
              <div className="w-56 h-56 bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center mb-6 text-gray-400">
                <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                 <p className="font-semibold text-sm">Simulasi Kamera QR</p>
              </div>
              <button 
                onClick={handleSimulateScan}
                className="w-full bg-gray-900 text-white text-lg font-bold py-4 rounded-xl hover:bg-gray-800 transition-colors shadow-lg"
              >
                Scan QR Merchant
              </button>
            </div>
          )}

          {/* STEP 2: LOADING AI */}
          {step === 'loading' && (
            <div className="flex flex-col items-center py-12 animate-fade-in">
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-800">AI Sedang Bekerja...</h3>
              <p className="text-sm text-gray-500 text-center mt-2 max-w-xs leading-relaxed">
                Wallet Scanner membedah aset Anda & Ai Router mengkalkulasi skor gas fee termurah.
              </p>
            </div>
          )}

          {/* STEP 3: AI DECISION */}
          {step === 'decision' && aiDecision && (
            <div className="flex flex-col animate-fade-in">
              <h3 className="font-bold text-lg mb-4 text-center text-gray-800">Rute Optimal Ditemukan ✨</h3>
              
              <div className="flex justify-between items-center bg-gray-50 p-5 rounded-2xl mb-5 border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black text-xl shadow-sm">
                    {aiDecision.token.substring(0,1)}
                  </div>
                  <div>
                    <p className="font-black text-gray-900 text-lg leading-tight">{aiDecision.token}</p>
                    <p className="text-xs font-bold text-gray-500 bg-gray-200 inline-block px-2 py-0.5 rounded-md mt-1">on {aiDecision.chain}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Fee</p>
                  <p className="font-black text-green-600 text-xl">Rp {aiDecision.gasEstimate}</p>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-8 relative">
                <span className="absolute -top-3 -left-3 text-3xl bg-white rounded-full shadow-sm p-1">💬</span>
                <p className="text-emerald-800 text-sm italic font-medium leading-relaxed pl-2">
                  "{aiDecision.explanation}"
                </p>
              </div>

              <button 
                onClick={handlePay}
                className="w-full bg-blue-600 text-white text-xl font-black py-4 rounded-xl hover:bg-blue-700 transition shadow-xl shadow-blue-200/50 transform hover:-translate-y-0.5"
              >
                Bayar Sekarang
              </button>
            </div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 'success' && (
            <div className="flex flex-col items-center py-8 animate-fade-in text-center">
              <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-200">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Berhasil!</h2>
              <p className="text-gray-500 mb-8 font-medium">Dana telah dikirim ke {paymentData.merchantName}.</p>
              
              <div className="w-full bg-slate-50 rounded-2xl p-5 border border-slate-200 mb-8 text-left">
                <div className="flex justify-between mb-4 pb-4 border-b border-slate-200">
                  <p className="text-sm font-bold text-slate-500">Nominal</p>
                  <p className="font-black text-slate-800 text-lg">Rp {paymentData.amountIdr.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">TX Hash (Base Sepolia)</p>
                  <p className="text-xs font-mono text-slate-600 break-all bg-white p-2 border border-slate-200 rounded-lg">{txHash}</p>
                </div>
              </div>

              <button 
                onClick={() => setStep('scan')}
                className="w-full bg-gray-100 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-200 transition"
              >
                Scan Pembayaran Lain
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
