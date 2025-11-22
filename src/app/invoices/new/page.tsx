'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ClientEntity } from '@/domain/entities/Client';
import { CompanyEntity } from '@/domain/entities/Company';
import { InvoiceItemEntity } from '@/domain/entities/InvoiceItem';
import { InvoiceEntity } from '@/domain/entities/Invoice';
import { ClientForm } from '@/presentation/components/Invoice/ClientForm';
import { InvoiceItemForm } from '@/presentation/components/Invoice/InvoiceItemForm';
import { Button } from '@/presentation/components/ui/Button';
import { Card } from '@/presentation/components/ui/Card';

interface CompanyResponse {
  success: boolean;
  data: CompanyEntity | null;
}

interface InvoiceResponse {
  success: boolean;
  data?: InvoiceEntity;
  error?: string;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [client, setClient] = useState<ClientEntity | undefined>(undefined);
  const [items, setItems] = useState<InvoiceItemEntity[]>([]);
  const [company, setCompany] = useState<CompanyEntity | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCompanyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCompanyData = async () => {
    try {
      const response = await fetch('/api/company');
      const result = (await response.json()) as CompanyResponse;

      if (result.success && result.data) {
        setCompany(result.data);
      } else {
        toast.error('Debes configurar los datos de tu empresa primero');
        router.push('/settings');
        return;
      }
    } catch (error) {
      console.error('Error loading company:', error);
      toast.error('Error al cargar los datos de la empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleClientChange = (newClient: ClientEntity | undefined) => {
    setClient(newClient);
  };

  const handleItemsChange = (newItems: InvoiceItemEntity[]) => {
    setItems(newItems);
  };

  const handleSaveDraft = async () => {
    if (!company) {
      toast.error('No se ha cargado la información de la empresa');
      return;
    }

    if (items.length === 0) {
      toast.error('Debes agregar al menos un item a la factura');
      return;
    }

    setSaving(true);
    try {
      // Crear la factura con el cliente y los items
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client,
          items: items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
          status: 'draft',
        }),
      });

      const result = (await response.json()) as InvoiceResponse;

      if (result.success) {
        toast.success('Factura guardada como borrador');
        router.push('/');
      } else {
        toast.error(result.error || 'Error al guardar la factura');
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error('Error al guardar la factura');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (!company) {
      toast.error('No se ha cargado la información de la empresa');
      return;
    }

    if (items.length === 0) {
      toast.error('Debes agregar al menos un item a la factura');
      return;
    }

    setSaving(true);
    try {
      // Crear la factura con el cliente y los items
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client,
          items: items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
          status: 'completed',
        }),
      });

      const result = (await response.json()) as InvoiceResponse;

      if (result.success) {
        toast.success('Factura creada exitosamente');
        router.push('/');
      } else {
        toast.error(result.error || 'Error al crear la factura');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Error al crear la factura');
    } finally {
      setSaving(false);
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total.amount, 0);
  };

  const calculateTip = () => {
    if (!company?.tipEnabled) return 0;
    return (calculateSubtotal() * (company.tipPercentage || 0)) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTip();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-black">
          Nueva Factura
        </h1>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!company) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black">
            Nueva Factura
          </h1>
          <p className="text-gray-600">
            Crea una nueva factura para tus clientes
          </p>
        </div>
        <Button onClick={() => router.push('/')} variant="outline">
          Cancelar
        </Button>
      </div>

      <ClientForm client={client} onClientChange={handleClientChange} />

      <InvoiceItemForm items={items} onItemsChange={handleItemsChange} />

      <Card title="Notas Adicionales (Opcional)">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Agrega notas o comentarios adicionales para esta factura..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
        />
      </Card>

      {items.length > 0 && (
        <Card title="Resumen de la Factura">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-lg">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-medium">
                {formatCurrency(calculateSubtotal())}
              </span>
            </div>

            {company.tipEnabled && (
              <div className="flex justify-between items-center text-lg">
                <span className="text-gray-700">
                  Propina ({company.tipPercentage}%):
                </span>
                <span className="font-medium">
                  {formatCurrency(calculateTip())}
                </span>
              </div>
            )}

            <div className="border-t pt-3">
              <div className="flex justify-between items-center text-xl">
                <span className="font-bold text-black">Total:</span>
                <span className="font-bold text-black">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              onClick={handleSaveDraft}
              variant="outline"
              disabled={saving || items.length === 0}
              className="w-full sm:w-auto"
            >
              Guardar como Borrador
            </Button>
            <Button
              onClick={handleCreateInvoice}
              disabled={saving || items.length === 0}
              className="w-full sm:w-auto"
            >
              {saving ? 'Creando...' : 'Crear Factura'}
            </Button>
          </div>
        </Card>
      )}

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Agrega items a la factura para continuar</p>
        </div>
      )}
    </div>
  );
}
