'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { InvoiceEntity } from '@/domain/entities/Invoice';
import { InvoiceItemEntity } from '@/domain/entities/InvoiceItem';
import { serviceContainer } from '@/shared/utils/serviceContainer';
import { NoteType, NoteReason } from '@/shared/types';
import { InvoiceItemForm } from '@/presentation/components/Invoice/InvoiceItemForm';
import { Button } from '@/presentation/components/ui/Button';
import { Card } from '@/presentation/components/ui/Card';

export default function NewNotePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const invoiceId = params.id as string;
  const noteType = (searchParams.get('type') || 'credit') as NoteType;

  const [invoice, setInvoice] = useState<InvoiceEntity | null>(null);
  const [items, setItems] = useState<InvoiceItemEntity[]>([]);
  const [reason, setReason] = useState<NoteReason>('other');
  const [reasonDescription, setReasonDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      const invoiceData = await serviceContainer.invoiceService.getInvoice(invoiceId);
      if (!invoiceData) {
        toast.error('Factura no encontrada');
        router.push('/invoices');
        return;
      }
      setInvoice(invoiceData);
    } catch (error) {
      console.error('Error loading invoice:', error);
      toast.error('Error al cargar la factura');
      router.push('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleItemsChange = (newItems: InvoiceItemEntity[]) => {
    setItems(newItems);
  };

  const handleCreateNote = async () => {
    if (!invoice) {
      toast.error('No se ha cargado la información de la factura');
      return;
    }

    if (items.length === 0) {
      toast.error('Debes agregar al menos un item a la nota');
      return;
    }

    if (!reasonDescription.trim()) {
      toast.error('Debes proporcionar una descripción del motivo');
      return;
    }

    setSaving(true);
    try {
      // Crear la nota
      const note = await serviceContainer.noteService.createNote({
        type: noteType,
        invoiceId: invoice.id,
        reason,
        reasonDescription: reasonDescription.trim()
      });

      // Agregar todos los items a la nota
      for (const item of items) {
        await serviceContainer.noteService.addItemToNote(
          note.id,
          item.description,
          item.quantity,
          item.unitPrice
        );
      }

      toast.success(`Nota ${noteType === 'credit' ? 'Crédito' : 'Débito'} creada exitosamente`);
      router.push(`/invoices/${invoice.id}`);
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Error al crear la nota');
    } finally {
      setSaving(false);
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total.amount, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getNoteTypeText = (type: NoteType) => {
    return type === 'credit' ? 'Nota Crédito' : 'Nota Débito';
  };

  const getNoteTypeColor = (type: NoteType) => {
    return type === 'credit' ? 'text-green-700' : 'text-red-700';
  };

  const reasons: { value: NoteReason; label: string; applicableFor: NoteType[] }[] = [
    { value: 'product_return', label: 'Devolución de producto', applicableFor: ['credit'] },
    { value: 'defective_product', label: 'Producto defectuoso', applicableFor: ['credit'] },
    { value: 'price_adjustment', label: 'Ajuste de precio', applicableFor: ['credit', 'debit'] },
    { value: 'discount', label: 'Descuento', applicableFor: ['credit'] },
    { value: 'service_not_provided', label: 'Servicio no prestado', applicableFor: ['credit'] },
    { value: 'additional_charge', label: 'Cargo adicional', applicableFor: ['debit'] },
    { value: 'missing_items', label: 'Items faltantes en factura original', applicableFor: ['debit'] },
    { value: 'interest_charges', label: 'Cargos por intereses', applicableFor: ['debit'] },
    { value: 'shipping_adjustment', label: 'Ajuste de envío', applicableFor: ['credit', 'debit'] },
    { value: 'other', label: 'Otro', applicableFor: ['credit', 'debit'] }
  ];

  const filteredReasons = reasons.filter(r => r.applicableFor.includes(noteType));

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-black">Creando nota...</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-bold ${getNoteTypeColor(noteType)}`}>
            Nueva {getNoteTypeText(noteType)}
          </h1>
          <p className="text-gray-600">
            Para factura {invoice.number}
          </p>
        </div>
        <Button
          onClick={() => router.push(`/invoices/${invoice.id}`)}
          variant="outline"
        >
          Cancelar
        </Button>
      </div>

      <div className={`p-4 border-l-4 ${noteType === 'credit' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
        <p className={`text-sm font-medium ${getNoteTypeColor(noteType)}`}>
          {noteType === 'credit'
            ? 'Estás creando una Nota Crédito que reducirá el valor de la factura original'
            : 'Estás creando una Nota Débito que aumentará el valor de la factura original'}
        </p>
      </div>

      <Card title="Información de la Nota">
        <div className="space-y-4">
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-black mb-1">
              Motivo *
            </label>
            <select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value as NoteReason)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              {filteredReasons.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-black mb-1">
              Descripción del motivo *
            </label>
            <textarea
              id="description"
              value={reasonDescription}
              onChange={(e) => setReasonDescription(e.target.value)}
              placeholder="Describe detalladamente el motivo de esta nota..."
              rows={4}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
            />
          </div>
        </div>
      </Card>

      <InvoiceItemForm items={items} onItemsChange={handleItemsChange} />

      {items.length > 0 && (
        <Card title="Resumen de la Nota">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xl">
              <span className="font-bold text-black">Total de la Nota:</span>
              <span className={`font-bold ${getNoteTypeColor(noteType)}`}>
                {noteType === 'credit' ? '-' : '+'}
                {formatCurrency(calculateTotal())}
              </span>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Efecto en la factura:</p>
              <div className="flex justify-between items-center">
                <span className="text-sm">Valor original de la factura:</span>
                <span className="font-medium">{formatCurrency(invoice.total.amount)}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm">
                  {noteType === 'credit' ? 'Menos' : 'Más'} esta nota:
                </span>
                <span className={`font-medium ${getNoteTypeColor(noteType)}`}>
                  {noteType === 'credit' ? '-' : '+'}
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-300">
                <span className="font-bold">Nuevo balance:</span>
                <span className="font-bold">
                  {formatCurrency(
                    noteType === 'credit'
                      ? invoice.total.amount - calculateTotal()
                      : invoice.total.amount + calculateTotal()
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              onClick={handleCreateNote}
              disabled={saving || items.length === 0 || !reasonDescription.trim()}
              className="w-full sm:w-auto"
            >
              {saving ? 'Creando...' : `Crear ${getNoteTypeText(noteType)}`}
            </Button>
          </div>
        </Card>
      )}

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Agrega items a la nota para continuar</p>
        </div>
      )}
    </div>
  );
}
