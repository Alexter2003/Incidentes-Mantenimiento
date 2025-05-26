import { NextResponse } from 'next/server';
import { equiposService } from '@/lib/firebase/services';

export async function GET() {
  try {
    const pendingEvents = await equiposService.getPendingEvents();
    return NextResponse.json(pendingEvents);
  } catch (error) {
    console.error('Error fetching pending events:', error);
    return NextResponse.json(
      { error: 'Error al obtener eventos pendientes' },
      { status: 500 }
    );
  }
} 