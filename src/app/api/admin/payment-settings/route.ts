import { NextRequest, NextResponse } from 'next/server';
import { getPaymentConfig, updatePaymentConfig } from '@/lib/payment-config';

export async function GET() {
  return NextResponse.json({ success: true, config: getPaymentConfig() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ownerUpiId, payeeName, proMonthlyInr, proAnnualInr, starterCoinsInr, challengerCoinsInr, godmodeCoinsInr } = body;

    const updated = updatePaymentConfig({
      ownerUpiId: ownerUpiId || getPaymentConfig().ownerUpiId,
      payeeName: payeeName || getPaymentConfig().payeeName,
      proMonthlyInr: proMonthlyInr ? Number(proMonthlyInr) : getPaymentConfig().proMonthlyInr,
      proAnnualInr: proAnnualInr ? Number(proAnnualInr) : getPaymentConfig().proAnnualInr,
      starterCoinsInr: starterCoinsInr ? Number(starterCoinsInr) : getPaymentConfig().starterCoinsInr,
      challengerCoinsInr: challengerCoinsInr ? Number(challengerCoinsInr) : getPaymentConfig().challengerCoinsInr,
      godmodeCoinsInr: godmodeCoinsInr ? Number(godmodeCoinsInr) : getPaymentConfig().godmodeCoinsInr,
    });

    return NextResponse.json({ success: true, config: updated, message: 'Payment gateway settings updated successfully!' });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
