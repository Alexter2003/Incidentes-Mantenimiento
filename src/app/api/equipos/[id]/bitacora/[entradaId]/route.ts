import { NextResponse } from 'next/server';
import { equiposService } from '@/lib/firebase/services';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; entradaId: string } }
) {
  try {
    const updates = await request.json();
    await equiposService.updateBitacoraEntry(params.id, params.entradaId, updates);
    return NextResponse.json({ 
      message: 'Entrada actualizada exitosamente' 
    });
  } catch (error) {
    console.error('Error updating bitacora entry:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la entrada' },
      { status: 500 }
    );
  }
} 