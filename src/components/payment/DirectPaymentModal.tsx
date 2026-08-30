'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, Copy, Check, Shield, Crown, Sparkles, X,
  ArrowRight, Smartphone, AlertCircle, Loader2, CheckCircle2,
  ExternalLink, CreditCard
} from 'lucide-react';
import { playClick, playCoin, playSuccess } from '@/lib/sound';
import { useUIStore } from '@/store/uiStore';
import { getPaymentConfig, generateUpiUri } from '@/lib/payment-config';

interface DirectPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageDetails: {
    id: string;
    title: string;
    amountInr: number;
    coinsAmount: number;
    isPro: boolean;
  };
}

export function DirectPaymentModal({
  isOpen,
  onClose,
  packageDetails,
}: DirectPaymentModalProps) {
  const { currentUser, addCoins } = useUIStore();
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  
  const paymentConfig = getPaymentConfig();
  const orderRef = `CM-${Date.now().toString().slice(-6)}`;
  
  const upiDeepLink = generateUpiUri({
    upiId: paymentConfig.ownerUpiId,
    payeeName: paymentConfig.payeeName,
    amount: packageDetails.amountInr,
    transactionNote: `CourtMate ${packageDetails.title} ${orderRef}`,
    transactionRef: orderRef,
  });

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiDeepLink)}&bgcolor=0A0C10&color=CCFF00&margin=10`;

  const handleCopyUpi = () => {
    playClick();
    navigator.clipboard.writeText(paymentConfig.ownerUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!utrNumber || utrNumber.length < 6) {
      setError('Please enter the valid 12-digit UTR / UPI Reference Number from your payment app receipt.');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const res = await fetch('/api/checkout/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: packageDetails.id,
          orderRef,
          utrNumber,
          amountInr: packageDetails.amountInr,
          coinsAmount: packageDetails.coinsAmount,
          isPro: packageDetails.isPro,
        }),
      });

      const data = await res.json();
      if (data.success) {
        playSuccess();
        playCoin();
        addCoins(packageDetails.coinsAmount, `Purchased ${packageDetails.title}`);

        try {
          const { emitCoinEarn } = await import('@/hooks/useCoinEarn');
          emitCoinEarn({
            amount: packageDetails.coinsAmount,
            reason: `Unlocked ${packageDetails.title}!`,
            icon: packageDetails.isPro ? '👑' : '🪙',
          });
        } catch {}

        setVerified(true);
        setTimeout(() => {
          setVerified(false);
          setUtrNumber('');
          onClose();
        }, 2200);
      } else {
        setError(data.error || 'Verification failed. Please check UTR number.');
      }
    } catch {
      setError('Network error verifying transaction.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            className="w-full max-w-md rounded-3xl border border-[#CCFF00]/40 bg-[#0A0C10] p-6 shadow-2xl relative overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#CCFF00] text-[#040507] font-black flex items-center justify-center text-xs">
                  ₹
                </div>
                <div>
                  <h3 className="font-outfit font-black text-lg text-white">Direct UPI Checkout</h3>
                  <p className="text-[11px] text-[#6b6b80]">Instant deposit to {paymentConfig.payeeName}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  playClick();
                  onClose();
                }}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-[#a0a0b8] hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {verified ? (
              <div className="text-center py-10 space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
                  ✓
                </div>
                <h4 className="text-xl font-black text-white font-outfit">Payment Verified!</h4>
                <p className="text-xs text-[#a0a0b8]">
                  {packageDetails.title} activated. +{packageDetails.coinsAmount} 🪙 added to your athlete wallet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Price Pill */}
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">{packageDetails.title}</span>
                    <span className="text-[10px] text-[#6b6b80] font-mono">Order Ref: {orderRef}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-[#CCFF00] font-mono">
                      ₹{packageDetails.amountInr}
                    </span>
                    <span className="text-[10px] text-emerald-400 block font-bold">
                      +{packageDetails.coinsAmount} 🪙
                    </span>
                  </div>
                </div>

                {/* Dynamic QR Code */}
                <div className="p-4 rounded-2xl border border-white/10 bg-[#08090C] flex flex-col items-center justify-center text-center">
                  <div className="p-2 rounded-xl bg-[#0A0C10] border border-[#CCFF00]/30 shadow-lg mb-2">
                    <img
                      src={qrCodeUrl}
                      alt="UPI QR Code"
                      className="w-44 h-44 object-contain rounded-lg"
                    />
                  </div>
                  <p className="text-[11px] text-[#a0a0b8] font-semibold">
                    Scan with <span className="text-white font-bold">GPay, PhonePe, Paytm, CRED</span> or any UPI app
                  </p>
                </div>

                {/* Direct 1-Tap UPI Apps (Mobile) */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={upiDeepLink}
                    onClick={() => playClick()}
                    className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-[#00F0FF]" /> Pay via UPI App
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-[#CCFF00] flex items-center justify-center gap-1.5 transition-all font-mono"
                  >
                    <Copy className="w-3.5 h-3.5" /> {copiedUpi ? 'Copied!' : 'Copy UPI ID'}
                  </button>
                </div>

                {/* UTR Number Form */}
                <form onSubmit={handleVerify} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#a0a0b8] uppercase tracking-wider mb-1.5">
                      Enter UPI Ref / UTR / Transaction ID
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 423589123456 or PhonePe Ref ID"
                      value={utrNumber}
                      onChange={e => setUtrNumber(e.target.value)}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#CCFF00] font-mono"
                    />
                  </div>

                  {error && (
                    <div className="p-2.5 rounded-xl bg-[#FF2A55]/10 border border-[#FF2A55]/30 text-[#FF2A55] text-[11px] flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={verifying}
                    className="btn-volt w-full py-3 text-xs font-black flex items-center justify-center gap-2 shadow-xl"
                  >
                    {verifying ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <><CheckCircle2 className="w-4 h-4" /> Confirm Payment & Claim Package</>
                    )}
                  </button>
                </form>

              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
