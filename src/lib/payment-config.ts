/**
 * Direct Owner Payment Gateway & UPI Routing Helper
 * Routes all student purchases directly into the owner's personal UPI / Bank account.
 */

export interface PaymentConfig {
  ownerUpiId: string;
  payeeName: string;
  currencySymbol: string;
  usdToInrRate: number;
  proMonthlyInr: number;
  proAnnualInr: number;
  starterCoinsInr: number;
  challengerCoinsInr: number;
  godmodeCoinsInr: number;
  manualUpiEnabled: boolean;
  autoVerificationWebhookSecret?: string;
}

export const DEFAULT_PAYMENT_CONFIG: PaymentConfig = {
  ownerUpiId: 'courtmate.admin@oksbi', // Owner's Personal UPI ID (configurable in /admin)
  payeeName: 'CourtMate Collegiate Sports',
  currencySymbol: '₹',
  usdToInrRate: 85,
  proMonthlyInr: 99,
  proAnnualInr: 799,
  starterCoinsInr: 49,
  challengerCoinsInr: 199,
  godmodeCoinsInr: 699,
  manualUpiEnabled: true,
};

let _memoryPaymentConfig: PaymentConfig = { ...DEFAULT_PAYMENT_CONFIG };

export function getPaymentConfig(): PaymentConfig {
  return _memoryPaymentConfig;
}

export function updatePaymentConfig(updates: Partial<PaymentConfig>): PaymentConfig {
  _memoryPaymentConfig = { ..._memoryPaymentConfig, ...updates };
  return _memoryPaymentConfig;
}

/**
 * Generates dynamic UPI intent deep-link & QR data string for Google Pay, PhonePe, Paytm, CRED
 */
export function generateUpiUri(options: {
  upiId: string;
  payeeName: string;
  amount: number;
  transactionNote: string;
  transactionRef: string;
}): string {
  const { upiId, payeeName, amount, transactionNote, transactionRef } = options;
  const encodedName = encodeURIComponent(payeeName);
  const encodedNote = encodeURIComponent(transactionNote);
  
  return `upi://pay?pa=${upiId}&pn=${encodedName}&am=${amount.toFixed(2)}&cu=INR&tn=${encodedNote}&tr=${transactionRef}`;
}
