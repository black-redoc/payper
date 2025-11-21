'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { ClientEntity } from '@/domain/entities/Client';
import { CompanyEntity } from '@/domain/entities/Company';
import { InvoiceEntity } from '@/domain/entities/Invoice';
import { InvoiceItemEntity } from '@/domain/entities/InvoiceItem';
import { serviceContainer } from '@/shared/utils/serviceContainer';
import { ClientForm } from '@/presentation/components/Invoice/ClientForm';
import { InvoiceItemForm } from '@/presentation/components/Invoice/InvoiceItemForm';
import { Button } from '@/presentation/components/ui/Button';
import { Card } from '@/presentation/components/ui/Card';

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<InvoiceEntity | null>(null);
  const [client, setClient] = useState<ClientEntity | undefined>(undefined);
  const [items, setItems] = useState<InvoiceItemEntity[]>([]);
  const [company, setCompany] = useState<CompanyEntity | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadInvoiceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId]);

  const loadInvoiceData = async () => {
    try {
      const invoiceData = await serviceContainer.invoiceService.getInvoice(invoiceId);
      if (!invoiceData) {
        toast.error('Factura no encontrada');
        router.push('/invoices');
        return;
      }

      const companyData = await serviceContainer.companyService.getCompany();
      if (!companyData) {
        toast.error('No se encontró información de la empresa');
        router.push('/settings');
        return;
      }

      setInvoice(invoiceData);
      setClient(invoiceData.client);
      setItems(invoiceData.items);
      setCompany(companyData);
      setNotes(invoiceData.notes || '');
    } catch (error) {
      console.error('Error loading invoice:', error);
      toast.error('Error al cargar la factura');
      router.push('/invoices');
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

  const handleSaveChanges = async () => {
    if (!invoice || !company) {
      toast.error('No se ha cargado la información necesaria');
      return;
    }

    if (items.length === 0) {
      toast.error('Debes agregar al menos un item a la factura');
      return;
    }

    setSaving(true);
    try {
      // Actualizar cliente si cambió
      if (client !== invoice.client) {
        await serviceContainer.invoiceService.setInvoiceClient(invoice.id, client);
      }

      const currentItemIds = items.map(item => item.id);
      const originalItemIds = invoice.items.map(item => item.id);

      // 1. Remover items que ya no existen
      for (const originalId of originalItemIds) {
        if (!currentItemIds.includes(originalId)) {
          await serviceContainer.invoiceService.removeItemFromInvoice(invoice.id, originalId);
        }
      }

      // 2. Actualizar items existentes o agregar nuevos
      for (const item of items) {
        if (originalItemIds.includes(item.id)) {
          // Item existente - actualizar
          const originalItem = invoice.items.find(i => i.id === item.id);
          if (originalItem) {
            // Solo actualizar si hubo cambios
            const hasChanges =
              originalItem.description !== item.description ||
              originalItem.quantity !== item.quantity ||
              originalItem.unitPrice.amount !== item.unitPrice.amount;

            if (hasChanges) {
              await serviceContainer.invoiceService.updateItemInInvoice(
                invoice.id,
                item.id,
                item.description,
                item.quantity,
                item.unitPrice
              );
            }
          }
        } else {
          // Item nuevo - agregar
          await serviceContainer.invoiceService.addItemToInvoice(
            invoice.id,
            item.description,
            item.quantity,
            item.unitPrice
          );
        }
      }

      toast.success('Factura actualizada exitosamente');
      router.push(`/invoices/${invoice.id}`);
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error('Error al actualizar la factura');
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
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'pending':
        return 'Pendiente';
      case 'draft':
        return 'Borrador';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-black">Editando factura...</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!invoice || !company) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black">
            Editar Factura {invoice.number}
          </h1>
          <p className="text-gray-600">
            Estado actual: {getStatusText(invoice.status)}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={() => router.push(`/invoices/${invoice.id}`)}
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            Cancelar
          </Button>
        </div>
      </div>

      {invoice.status === 'completed' && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Esta factura está marcada como completada. Los cambios que realices podrían afectar los registros.
          </p>
        </div>
      )}

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
        <p className="text-xs text-gray-500 mt-2">
          Nota: Las notas adicionales aún no se guardan en el sistema. Esta funcionalidad estará disponible próximamente.
        </p>
      </Card>

      {items.length > 0 && (
        <Card title="Resumen de la Factura">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-lg">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
            </div>

            {company.tipEnabled && (
              <div className="flex justify-between items-center text-lg">
                <span className="text-gray-700">
                  Propina ({company.tipPercentage}%):
                </span>
                <span className="font-medium">{formatCurrency(calculateTip())}</span>
              </div>
            )}

            <div className="border-t pt-3">
              <div className="flex justify-between items-center text-xl">
                <span className="font-bold text-black">Total:</span>
                <span className="font-bold text-black">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              onClick={handleSaveChanges}
              disabled={saving || items.length === 0}
              className="w-full sm:w-auto"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
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
