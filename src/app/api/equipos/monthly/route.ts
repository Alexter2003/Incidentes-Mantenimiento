import { NextRequest, NextResponse } from 'next/server';
import { equiposService } from '@/lib/firebase/services';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = parseInt(searchParams.get('month') || '');
    const year = parseInt(searchParams.get('year') || '');

    if (isNaN(month) || isNaN(year)) {
      return NextResponse.json(
        { error: 'Mes y año son requeridos' },
        { status: 400 }
      );
    }

    const events = await equiposService.getEventsByMonth(month, year);
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching monthly events:', error);
    return NextResponse.json(
      { error: 'Error al obtener eventos mensuales' },
      { status: 500 }
    );
  }
} 