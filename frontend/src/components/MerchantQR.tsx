"use client";

import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';

interface MerchantQRProps {
  merchantId: string;
  amountIdr: number;
  txId: string;
  expires: number; // Unix timestamp in seconds
}

export default function MerchantQR({
  merchantId,
  amountIdr,
  txId,
  expires,
}: MerchantQRProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Default origin fallback for SSR
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const qrString = `${origin}/payment?merchant=${merchantId}&amount=${amountIdr}&accept=ANY&txid=${txId}&expires=${expires}`;

  // Countdown logic
  useEffect(() => {
    const updateTime = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = expires - now;
      setTimeLeft(remaining > 0 ? remaining : 0);
    };
    
    updateTime(); // Initial update
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [expires]);

  // QR Generation logic
  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, qrString, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      }, (error: any) => {
        if (error) console.error('Error generating QR code:', error);
      });
    }
  }, [qrString]);

  // Download logic
  const handleDownload = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = url;
      link.download = `Qurate-${txId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-xl max-w-sm mx-auto border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-2">Scan untuk Membayar</h2>
      <p className="text-gray-500 mb-6 text-sm text-center">Scan menggunakan aplikasi Qurate</p>
      
      <div className="bg-gray-50 p-4 rounded-xl mb-4">
        <canvas ref={canvasRef}></canvas>
      </div>
      
      <div className="flex flex-col items-center mb-6 w-full">
        <p className="text-3xl font-black text-gray-900 mb-1">
          Rp {amountIdr.toLocaleString('id-ID')}
        </p>
        
        {timeLeft > 0 ? (
          <p className="text-sm font-medium text-amber-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Kadaluarsa dalam: {formatTime(timeLeft)}
          </p>
        ) : (
          <p className="text-sm font-medium text-red-500 flex items-center gap-2">
            QR Code Kadaluarsa
          </p>
        )}
      </div>

      <button
        onClick={handleDownload}
        disabled={timeLeft === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 flex justify-center items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        Download QR
      </button>
    </div>
  );
}
