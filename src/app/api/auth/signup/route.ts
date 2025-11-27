/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/infrastructure/di/container';

// POST /api/auth/signup - Registrar un nuevo usuario
export async function POST(request: NextRequest) {
  try {
    const body: any = await request.json();

    // Validar campos requeridos
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Todos los campos son requeridos',
        },
        { status: 400 }
      );
    }

    // Validar longitud del nombre
    if (body.name.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'El nombre debe tener al menos 2 caracteres',
        },
        { status: 400 }
      );
    }

    // Registrar usuario
    const result = await authService.signUp({
      name: body.name,
      email: body.email,
      password: body.password,
    });

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: 'Usuario registrado exitosamente',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error signing up:', error);

    // Manejar errores específicos del servicio
    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Error al registrar usuario',
      },
      { status: 500 }
    );
  }
}
