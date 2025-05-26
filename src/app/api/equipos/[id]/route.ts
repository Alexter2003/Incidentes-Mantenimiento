import { NextResponse } from 'next/server';
import { equiposService } from '@/lib/firebase/services';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const equipo = await request.json();
    await equiposService.update(params.id, equipo);
    return NextResponse.json({ message: 'Equipo actualizado exitosamente' });
  } catch (error) {
    console.error('Error updating equipo:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el equipo' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await equiposService.delete(params.id);
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }
    return NextResponse.json({ message: result.message });
  } catch (error) {
    console.error('Error deleting equipo:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el equipo' },
      { status: 500 }
    );
  }
} 