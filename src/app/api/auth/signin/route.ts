/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/infrastructure/di/container';

// POST /api/auth/signin - Iniciar sesión de usuario
export async function POST(request: NextRequest) {
  try {
    const body: any = await request.json();

    // Validar campos requeridos
    if (!body.email || !body.password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email y contraseña son requeridos',
        },
        { status: 400 }
      );
    }

    // Validar longitud mínima de contraseña
    if (body.password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: 'La contraseña debe tener al menos 6 caracteres',
        },
        { status: 400 }
      );
    }

    // Autenticar usuario
    const result = await authService.signIn({
      email: body.email,
      password: body.password,
    });

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: 'Inicio de sesión exitoso',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error signing in:', error);

    // Manejar errores específicos del servicio
    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Error al iniciar sesión',
      },
      { status: 500 }
    );
  }
}
