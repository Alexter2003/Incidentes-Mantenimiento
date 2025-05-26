import { NextRequest, NextResponse } from 'next/server';
import { equiposService } from '@/lib/firebase/services';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const estado = searchParams.get('estado') as 'activo' | 'mantenimiento' | 'no-activo' | undefined;

    const equipos = await equiposService.getAll({ estado });
    return NextResponse.json(equipos);
  } catch (error) {
    console.error('Error fetching equipos:', error);
    return NextResponse.json(
      { error: 'Error al obtener los equipos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const equipo = await request.json();
    const id = await equiposService.create(equipo);
    return NextResponse.json({ id, message: 'Equipo creado exitosamente' });
  } catch (error) {
    console.error('Error creating equipo:', error);
    return NextResponse.json(
      { error: 'Error al crear el equipo' },
      { status: 500 }
    );
  }
}
