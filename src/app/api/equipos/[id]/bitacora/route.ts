import { NextRequest, NextResponse } from 'next/server';
import { equiposService } from '@/lib/firebase/services';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderBy = searchParams.get('orderBy') as 'asc' | 'desc' | undefined;
    const orderField = searchParams.get('orderField') || 'fecha_inicio';

    const bitacora = await equiposService.getBitacora(params.id, { 
      orderBy, 
      orderField: orderField as string 
    });
    return NextResponse.json(bitacora);
  } catch (error) {
    console.error('Error fetching bitacora:', error);
    return NextResponse.json(
      { error: 'Error al obtener la bitácora' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const equipoId = params.id;
  if (!equipoId) {
    return NextResponse.json(
      { error: 'ID de equipo no proporcionado' },
      { status: 400 }
    );
  }

  try {
    const entrada = await request.json();
    const id = await equiposService.createBitacoraEntry(equipoId, entrada);
    return NextResponse.json({ 
      id, 
      message: 'Entrada registrada exitosamente' 
    });
  } catch (error) {
    console.error('Error creating bitacora entry:', error);
    return NextResponse.json(
      { error: 'Error al registrar la entrada' },
      { status: 500 }
    );
  }
} 