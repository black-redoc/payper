'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthCard } from '@/presentation/components/Auth/AuthCard';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import toast from 'react-hot-toast';

export default function SignInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = (await response.json()) as {
        success: boolean;
        data?: { user: { id: string; name: string; email: string } };
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      toast.success('Inicio de sesión exitoso');
      // Guardar información del usuario en localStorage si es necesario
      if (data.data?.user) {
        localStorage.setItem('user', JSON.stringify(data.data.user));
      }
      router.push('/');
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error al iniciar sesión. Verifica tus credenciales.';
      toast.error(errorMessage);
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  return (
    <AuthCard title="Iniciar Sesión" subtitle="Accede a tu cuenta de Payper">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Correo Electrónico"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="tu@email.com"
          required
          autoComplete="email"
          disabled={isLoading}
        />

        <Input
          label="Contraseña"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="••••••••"
          required
          autoComplete="current-password"
          disabled={isLoading}
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2 h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
            />
            <span className="text-gray-700">Recordarme</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-black hover:underline font-medium"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>

        <div className="text-center text-sm text-gray-600">
          ¿No tienes una cuenta?{' '}
          <Link
            href="/signup"
            className="text-black hover:underline font-medium"
          >
            Regístrate
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
