"use client";

import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface StaticMerchantQRProps {
  merchantId: string;
  merchantName: string;
}

/**
 * Static QR Code for merchants — contains only merchant ID.
 * Users scan this and input their own amount on the payment page.
 * Format: qurate://pay?merchant=MERCHANT_ID
 */
export default function StaticMerchantQR({ merchantId, merchantName }: StaticMerchantQRProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Payment page URL that users will be directed to after scanning
  const qrString = `qurate://pay?merchant=${merchantId}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, qrString, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1e293b',
          light: '#ffffff'
        }
      }, (error: any) => {
        if (error) console.error('Error generating static QR:', error);
      });
    }
  }, [qrString]);

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm inline-block">
        <canvas ref={canvasRef} id="static-qr-canvas"></canvas>
      </div>
      <h3 className="font-bold text-slate-800 mt-4 mb-1">{merchantName}</h3>
      <p className="text-xs text-slate-400 font-medium">ID: {merchantId}</p>
    </div>
  );
}
