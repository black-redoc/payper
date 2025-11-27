'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthCard } from '@/presentation/components/Auth/AuthCard';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import toast from 'react-hot-toast';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        'La contraseña debe contener mayúsculas, minúsculas y números';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
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
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
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
        throw new Error(data.error || 'Error al crear la cuenta');
      }

      toast.success('Cuenta creada exitosamente');
      router.push('/signin');
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error al crear la cuenta. Intenta nuevamente.';
      toast.error(errorMessage);
      console.error('Sign up error:', error);
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
    <AuthCard
      title="Crear Cuenta"
      subtitle="Regístrate en Payper para gestionar tus facturas"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Nombre Completo"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Juan Pérez"
          required
          autoComplete="name"
          disabled={isLoading}
        />

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
          autoComplete="new-password"
          disabled={isLoading}
        />

        <Input
          label="Confirmar Contraseña"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          placeholder="••••••••"
          required
          autoComplete="new-password"
          disabled={isLoading}
        />

        <div className="flex items-start">
          <input
            type="checkbox"
            id="terms"
            required
            className="mt-1 mr-2 h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
          />
          <label htmlFor="terms" className="text-sm text-gray-700">
            Acepto los{' '}
            <Link
              href="/terms"
              className="text-black hover:underline font-medium"
            >
              términos y condiciones
            </Link>{' '}
            y la{' '}
            <Link
              href="/privacy"
              className="text-black hover:underline font-medium"
            >
              política de privacidad
            </Link>
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
        </Button>

        <div className="text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <Link
            href="/signin"
            className="text-black hover:underline font-medium"
          >
            Iniciar Sesión
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
