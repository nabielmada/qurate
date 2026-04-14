"use client";

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWallet } from '@/context/WalletContext';

export default function Home() {
  const { setGuestMode, isConnected } = useWallet();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 italic">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-black text-base">Q</span>
            </div>
            <span className="text-xl font-bold text-slate-900">Qurate</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-bold text-xs text-slate-500 uppercase">
            <a href="#vision" className="hover:text-blue-600 transition-colors">Visi</a>
            <a href="#pillars" className="hover:text-blue-600 transition-colors">Pilar</a>
            <a href="#about" className="hover:text-blue-600 transition-colors">Tentang</a>
          </div>
          <div>
            <ConnectButton />
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero Section */}
        <section id="vision" className="max-w-6xl mx-auto px-6 py-16 md:py-24 text-center">
          <div className="inline-block px-3 py-1 mb-6 text-xs font-bold text-blue-600 bg-blue-50 rounded-full border border-blue-100 animate-fade-in uppercase">
            AI-Powered Web3 Payment
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-8 animate-slide-up">
            Masa Depan Pembayaran <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Terletak pada Kecerdasan.</span>
          </h1>
          <p className="text-base md:text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed mb-10 animate-slide-up animation-delay-100">
            Qurate adalah autonomous AI Agent pertama yang mengelola aset kripto Anda untuk pembayaran instan tanpa perlu paham teknis.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 animate-slide-up animation-delay-200">
            {isConnected ? (
              <Link href="/user">
                <button className="px-8 py-4 bg-blue-600 text-white font-bold text-base rounded-2xl hover:bg-blue-700 transition shadow-xl shadow-blue-200 transform hover:-translate-y-0.5">
                  Masuk ke Dashboard
                </button>
              </Link>
            ) : (
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button 
                      onClick={openConnectModal}
                      className="px-8 py-4 bg-slate-900 text-white font-bold text-base rounded-2xl hover:bg-slate-800 transition shadow-xl shadow-slate-200 transform hover:-translate-y-0.5"
                    >
                      Hubungkan Wallet
                    </button>
                  )}
                </ConnectButton.Custom>
                
                <button 
                  onClick={setGuestMode}
                  className="px-8 py-4 bg-white text-slate-900 border border-slate-200 font-bold text-base rounded-2xl hover:border-slate-300 transition transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  Coba Versi Guest (Demo)
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 3 Pillars Section */}
        <section id="pillars" className="bg-white py-20 border-y border-slate-100">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-xs font-bold text-slate-400 uppercase mb-3 text-center">3 Pilar Utama</h2>
              <p className="text-2xl font-bold text-slate-900 text-center">Mengapa Qurate Berbeda?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Zero Knowledge Required",
                  desc: "Tidak perlu paham gas fee atau bridging. Cukup scan, dan AI kami menangani semua kerumitan teknis di balik layar.",
                  icon: "✨"
                },
                {
                  title: "Autonomous Agent",
                  desc: "Agent AI kami mengevaluasi ribuan rute dalam hitungan detik untuk menemukan efisiensi biaya tertinggi bagi Anda.",
                  icon: "🤖"
                },
                {
                  title: "Human-First UX",
                  desc: "Tidak ada lagi data teknis yang membingungkan. Keputusan AI dijelaskan dalam bahasa yang mudah dimengerti orang awam.",
                  icon: "💬"
                }
              ].map((pilar, i) => (
                <div key={i} className="group p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-slate-100/50 transition-all duration-300">
                  <div className="text-3xl mb-4 transform group-hover:scale-110 transition-transform">{pilar.icon}</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">{pilar.title}</h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">{pilar.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bento Grid: The Intelligence Path */}
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <h2 className="text-[10px] font-bold text-blue-600 uppercase mb-3 tracking-widest">Protocol Flow</h2>
                <p className="text-3xl font-bold text-slate-900 leading-tight">Mekanisme Pintar Qurate</p>
              </div>
              <p className="text-slate-400 text-xs font-medium max-w-xs">
                Mengintegrasikan kapabilitas AI Agent dengan ekosistem multichain untuk pengalaman pembayaran tanpa hambatan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6">
              
              {/* Box 1: Connect & Setup (Medium) */}
              <div className="md:col-span-12 lg:col-span-5 bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 flex flex-col justify-between relative overflow-hidden group hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500">
                <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-blue-100 rounded-full blur-[80px] opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-blue-600 mb-6 shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">01. Integrasi Wallet</h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">
                    Mulai dengan menghubungkan dompet Web3 Anda. Qurate secara otomatis memetakan aset Anda di 5+ jaringan utama secara real-time.
                  </p>
                </div>
                <div className="relative z-10 bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white flex flex-col gap-2 shadow-inner">
                   <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                     <span>NETWORK SCAN</span>
                     <span className="text-emerald-500">ACTIVE</span>
                   </div>
                   <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-600 w-3/4 animate-pulse"></div>
                   </div>
                </div>
              </div>

              {/* Box 2: Scan & Analysis (Large) */}
              <div className="md:col-span-12 lg:col-span-7 bg-slate-900 rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent opacity-50"></div>
                
                {/* Abstract Pattern background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-12">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/5 rounded-xl flex items-center justify-center text-blue-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                    </div>
                    <div className="bg-blue-600/20 px-3 py-1 rounded-full border border-blue-500/20 text-[9px] font-bold text-blue-400 uppercase">
                      AI Agent v1.0
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    <h3 className="text-xl font-bold text-white mb-3">02. Autonomous Analysis</h3>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
                      Agent kami mengevaluasi biaya gas, likuiditas, dan kecepatan finalitas untuk menentukan keputusan pembayaran paling cerdas bagi Anda.
                    </p>
                  </div>

                  <div className="mt-8 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {['Ethereum', 'Base', 'Polygon', 'Arbitrum', 'BSC'].map((c, i) => (
                      <div key={i} className="flex-shrink-0 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold text-slate-500">
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Box 3: Instant Success (Full/Bottom) */}
              <div className="md:col-span-12 bg-white border border-slate-100 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-10 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500">
                <div className="flex-1">
                  <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-6 font-bold text-lg">03</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Eksekusi Tanpa Batas</h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed lg:max-w-md">
                    Pembayaran selesai dalam hitungan detik. AI mengeksekusi *atomic settlement* yang memastikan merchant menerima dana seketika di jaringan pilihan mereka.
                  </p>
                </div>
                <div className="w-full md:w-64 aspect-video bg-slate-900 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-center">
                   <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500 rounded-full blur-[50px] opacity-30"></div>
                   <div className="text-emerald-400 font-black text-2xl text-center mb-1">SUCCESS</div>
                   <div className="text-slate-500 text-[8px] font-bold text-center uppercase tracking-widest">Transaction Confirmed</div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section id="about" className="py-20 text-center">
          <div className="max-w-4xl mx-auto px-6 bg-gradient-to-br from-blue-600 to-indigo-700 p-10 md:p-16 rounded-[2rem] text-white shadow-xl shadow-blue-200 relative overflow-hidden">
             {/* Decorative element */}
             <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
             
             <h2 className="text-2xl md:text-3xl font-bold mb-4">Siap Menggunakan <br /> Uang Kripto Anda?</h2>
             <p className="text-white/80 text-base font-medium mb-8 max-w-lg mx-auto leading-relaxed">
               Gabung bersama ribuan pengguna lainnya yang telah merasakan kemudahan pembayaran Web3 dengan AI.
             </p>
             <Link href="/user">
               <button className="px-10 py-4 bg-white text-blue-600 font-bold text-lg rounded-xl hover:bg-slate-50 transition shadow-lg transform hover:-translate-y-0.5">
                 Mulai Sekarang
               </button>
             </Link>
          </div>
        </section>
      </main>

      <footer className="py-10 border-t border-slate-200 text-center">
        <p className="text-xs font-bold text-slate-400 uppercase leading-loose">
          Qurate &copy; 2025 • Four.meme AI Sprint
        </p>
      </footer>
    </div>
  );
}
