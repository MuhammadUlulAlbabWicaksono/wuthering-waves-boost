import { NextResponse } from 'next/server';
import { getSideQuestsGrouped } from '@/app/actions/side-quests';

/**
 * GET /api/side-quests
 * API Route untuk testing dan debugging data side quests yang sudah di-grouping.
 * Memanggil server action getSideQuestsGrouped() dan mengembalikan hasilnya sebagai JSON.
 */
export async function GET() {
  try {
    const data = await getSideQuestsGrouped();

    // Summary statistics untuk debugging
    const summary = data.map((r) => ({
      region: r.region,
      singleQuestsCount: r.singleQuests.length,
      chainSeriesCount: r.chainSeries.length,
      totalQuestsInChains: r.chainSeries.reduce((sum, s) => sum + s.quests.length, 0),
    }));

    return NextResponse.json({
      success: true,
      totalRegions: data.length,
      summary,
      data,
    });
  } catch (error: any) {
    console.error('Error fetching side quests:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch side quests', stack: error?.stack },
      { status: 500 }
    );
  }
}
