'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { serviceContainer } from '@/shared/utils/serviceContainer';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export function QuickActions() {
  const router = useRouter();
  const [hasCompanyData, setHasCompanyData] = useState<boolean | null>(null);

  useEffect(() => {
    checkCompanyData();
  }, []);

  const checkCompanyData = async () => {
    try {
      const hasData = await serviceContainer.companyService.hasCompanyData();
      setHasCompanyData(hasData);
    } catch (error) {
      console.error('Error checking company data:', error);
      setHasCompanyData(false);
    }
  };

  const handleNewInvoice = () => {
    if (hasCompanyData) {
      router.push('/invoices/new');
    } else {
      toast.error('Debes configurar los datos de tu empresa antes de crear facturas.');
      router.push('/settings');
    }
  };

  const actions = [
    {
      title: 'Nueva Factura',
      description: 'Crear una nueva factura',
      icon: '🧾',
      onClick: handleNewInvoice,
      variant: 'primary' as const,
      disabled: hasCompanyData === false
    },
    {
      title: 'Ver Facturas',
      description: 'Ver todas las facturas',
      icon: '📋',
      onClick: () => router.push('/invoices'),
      variant: 'secondary' as const
    },
    {
      title: 'Configuración',
      description: 'Configurar empresa y ajustes',
      icon: '⚙️',
      onClick: () => router.push('/settings'),
      variant: 'outline' as const
    }
  ];

  return (
    <Card title="Acciones Rápidas">
      {hasCompanyData === false && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            ⚠️ Configura los datos de tu empresa para empezar a crear facturas.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {actions.map((action) => (
          <div
            key={action.title}
            className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start space-x-3 mb-4">
              <span className="text-2xl flex-shrink-0">{action.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-black truncate" title={action.title}>{action.title}</h3>
                <p className="text-sm text-gray-600 break-words">{action.description}</p>
              </div>
            </div>
            <Button
              onClick={action.onClick}
              variant={action.variant}
              disabled={action.disabled}
              className="w-full cursor-pointer"
            >
              {action.disabled ? 'Configura empresa primero' : 'Abrir'}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}