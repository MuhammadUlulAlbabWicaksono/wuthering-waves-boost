import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Webhook payload received:', body);

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status
    } = body;

    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';

    // Validasi signature (SHA512)
    const hash = crypto
      .createHash('sha512')
      .update(order_id + status_code + gross_amount + serverKey)
      .digest('hex');

    if (hash !== signature_key) {
      console.error('Invalid signature:', { hash, signature_key });
      return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 400 });
    }

    // Tentukan status Prisma berdasarkan transaction_status dari Midtrans
    let orderStatus = 'PENDING';
    
    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      orderStatus = 'PAID';
    } else if (['expire', 'cancel', 'deny'].includes(transaction_status)) {
      orderStatus = 'EXPIRED'; // Atau CANCELLED sesuai skema (kita pakai EXPIRED atau cancel)
      // Skema default punya status String, jadi bebas diset 'EXPIRED' atau 'CANCELLED'
    }

    if (orderStatus !== 'PENDING') {
      await prisma.order.update({ 
        where: { id: order_id }, 
        data: { status: orderStatus } 
      });
    }

    return NextResponse.json({ success: true, message: 'Webhook processed' }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
