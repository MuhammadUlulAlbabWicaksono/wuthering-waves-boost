import { NextResponse } from 'next/server';

// In-memory store (simulasi database — data hilang saat server restart)
const invoiceStore = new Map<string, any>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const orderId = `INV-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const deadline = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 menit dari sekarang

    const invoiceData = {
      orderId,
      createdAt,
      deadline,
      status: "PENDING_PAYMENT",
      customerInfo: body.customerInfo,
      mode: body.mode,
      teams: body.teams,
      bosses: body.bosses,
      paymentMethod: body.paymentMethod,
      totalAmount: body.totalAmount,
    };

    // Simpan ke store
    invoiceStore.set(orderId, invoiceData);

    console.log("Invoice baru dibuat:", JSON.stringify(invoiceData, null, 2));

    return NextResponse.json(
      { 
        message: "Invoice berhasil dibuat", 
        orderId,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

// GET endpoint untuk mengambil data invoice berdasarkan ID (via query param)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "ID invoice diperlukan" }, { status: 400 });
  }

  const invoice = invoiceStore.get(id);

  if (!invoice) {
    // Jika tidak ditemukan di store, kembalikan data mock agar halaman tetap berfungsi
    return NextResponse.json({
      orderId: id,
      createdAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      status: "PENDING_PAYMENT",
      customerInfo: { loginMethod: "Kuro Games", accountEmail: "user@example.com", server: "SEA" },
      mode: "ToA",
      teams: [["Jinhsi", "Verina", "Changli"]],
      bosses: [],
      paymentMethod: "QRIS",
      totalAmount: 75000,
    });
  }

  return NextResponse.json(invoice);
}
