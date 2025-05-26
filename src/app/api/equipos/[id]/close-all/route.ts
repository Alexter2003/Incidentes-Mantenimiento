import { NextRequest, NextResponse } from 'next/server';
import { equiposService } from '@/lib/firebase/services';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const equipoId = params.id;
    const body = await request.json();
    const { responsable } = body;

    if (!responsable) {
      return NextResponse.json(
        { error: 'El responsable es requerido' },
        { status: 400 }
      );
    }

    const result = await equiposService.closeAllEvents(equipoId, responsable);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error closing all events:', error);
    return NextResponse.json(
      { error: 'Error al cerrar los eventos' },
      { status: 500 }
    );
  }
} 