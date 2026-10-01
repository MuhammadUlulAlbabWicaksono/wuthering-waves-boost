'use server'

import prisma from '@/lib/prisma';
import crypto from 'node:crypto';

export async function processCheckout(payload: {
  questIds: string[],
  paymentMethod: string,
  loginMethod: string,
  gameEmail: string,
  gameServer: string
}) {
  const { questIds, paymentMethod, loginMethod, gameEmail, gameServer } = payload;
  if (!questIds || questIds.length === 0) {
    return { success: false, message: 'Tidak ada quest yang dipilih.' };
  }

  // Ambil semua quest berdasarkan categoryId yang beririsan dengan questIds
  const selectedQuests = await prisma.quest.findMany({
    where: { id: { in: questIds } },
    include: { category: true }
  });

  if (selectedQuests.length !== questIds.length) {
    return { success: false, message: 'Terdapat quest yang tidak valid.' };
  }

  // Kumpulkan kategori ID yang terpengaruh
  const categoryIds = Array.from(new Set(selectedQuests.map(q => q.categoryId).filter((id): id is string => id !== null)));
  
  // Ambil semua quest dari kategori tersebut untuk mengecek "100% selected" per kategori
  const categories = await prisma.questCategory.findMany({
    where: { id: { in: categoryIds } },
    include: { quests: true }
  });

  let totalAmount = 0;
  const orderItemsData: { questId: string, priceAtTimeOfOrder: number }[] = [];

  for (const category of categories) {
    const questsInCategory = category.quests;
    const selectedInCategory = selectedQuests.filter(q => q.categoryId === category.id);
    
    let categoryTotal = 0;
    
    // Jika semua quest dalam kategori ini dipilih, diskon 10%
    const isFullCategorySelected = selectedInCategory.length === questsInCategory.length && questsInCategory.length > 0;
    const discountMultiplier = isFullCategorySelected ? 0.9 : 1;

    for (const quest of selectedInCategory) {
      let basePrice = 0;
      
      if (category.type === 'MAIN') {
        basePrice = quest.astriteReward > 0 ? quest.astriteReward * 250 : (quest.flatPrice || 0);
      } else if (category.type === 'COMPANION') {
        basePrice = quest.flatPrice || 0;
      } else if (category.type === 'EXPLORATION') {
        basePrice = quest.astriteReward * 200;
      } else if (category.type === 'MAP_EXPLORATION') {
        basePrice = quest.flatPrice || 0;
      }

      const discountedPrice = Math.round(basePrice * discountMultiplier);
      categoryTotal += discountedPrice;

      orderItemsData.push({
        questId: quest.id,
        priceAtTimeOfOrder: discountedPrice
      });
    }

    totalAmount += categoryTotal;
  }

  // Buat Order di Database
  const paymentDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000); // +24 hours
  
  const order = await prisma.order.create({
    data: {
      totalAmount,
      status: "PENDING",
      paymentMethod,
      loginMethod,
      gameEmail,
      gameServer,
      paymentDeadline,
      items: {
        create: orderItemsData
      }
    }
  });

  // ─── INTEGRASI MIDTRANS (Snap API) ───
  let finalOrderId = order.id;
  try {
    const isProd = process.env.MIDTRANS_IS_PRODUCTION === 'true';
    const apiUrl = isProd 
      ? 'https://app.midtrans.com/snap/v1/transactions' 
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
      
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const authHeader = 'Basic ' + Buffer.from(serverKey + ':').toString('base64');

    const midtransPayload = {
      transaction_details: {
        order_id: order.id,
        gross_amount: totalAmount
      },
      customer_details: {
        email: gameEmail,
        first_name: loginMethod
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(midtransPayload)
    });

    const midtransData = await response.json();

    if (response.ok && midtransData.token) {
      // Update order dengan paymentUrl (redirect_url) dan paymentRef (token)
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentUrl: midtransData.redirect_url,
          paymentRef: midtransData.token
        }
      });
    } else {
      console.error('Midtrans Create Transaction Error:', midtransData);
      throw new Error(midtransData.error_messages?.[0] || 'Failed to create Midtrans transaction');
    }
  } catch (error) {
    console.error('Failed to communicate with Midtrans:', error);
    // Kita lemparkan error agar proses checkout dibatalkan jika payment gateway bermasalah
    throw new Error('Terjadi kesalahan saat memproses pembayaran dengan Midtrans');
  }

  return { 
    success: true, 
    orderId: finalOrderId, 
    calculatedTotal: totalAmount 
  };
}
