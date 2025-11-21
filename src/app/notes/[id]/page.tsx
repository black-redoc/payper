'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { NoteEntity } from '@/domain/entities/Note';
import { InvoiceEntity } from '@/domain/entities/Invoice';
import { serviceContainer } from '@/shared/utils/serviceContainer';
import { Button } from '@/presentation/components/ui/Button';
import { Card } from '@/presentation/components/ui/Card';
import { NoteReason } from '@/shared/types';

export default function NoteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;

  const [note, setNote] = useState<NoteEntity | null>(null);
  const [invoice, setInvoice] = useState<InvoiceEntity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  const loadNote = async () => {
    try {
      const noteData = await serviceContainer.noteService.getNote(noteId);
      if (!noteData) {
        toast.error('Nota no encontrada');
        router.push('/invoices');
        return;
      }
      setNote(noteData);

      // Cargar la factura asociada
      const invoiceData = await serviceContainer.invoiceService.getInvoice(noteData.invoiceId);
      setInvoice(invoiceData);
    } catch (error) {
      console.error('Error loading note:', error);
      toast.error('Error al cargar la nota');
      router.push('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case 'credit':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'debit':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getNoteTypeText = (type: string) => {
    switch (type) {
      case 'credit':
        return 'Nota Crédito';
      case 'debit':
        return 'Nota Débito';
      default:
        return type;
    }
  };

  const getReasonText = (reason: NoteReason): string => {
    const reasons: Record<NoteReason, string> = {
      product_return: 'Devolución de producto',
      defective_product: 'Producto defectuoso',
      price_adjustment: 'Ajuste de precio',
      discount: 'Descuento',
      service_not_provided: 'Servicio no prestado',
      additional_charge: 'Cargo adicional',
      missing_items: 'Items faltantes',
      interest_charges: 'Cargos por intereses',
      shipping_adjustment: 'Ajuste de envío',
      other: 'Otro'
    };
    return reasons[reason] || reason;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-black">Cargando nota...</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!note) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-black">
              {note.number}
            </h1>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getNoteTypeColor(note.type)}`}
            >
              {getNoteTypeText(note.type)}
            </span>
          </div>
          <p className="text-gray-600">
            Creada el {new Date(note.createdAt).toLocaleDateString('es-CO', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={() => router.push(invoice ? `/invoices/${invoice.id}` : '/invoices')}
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            {invoice ? 'Ver Factura' : 'Volver'}
          </Button>
        </div>
      </div>

      {/* Factura Asociada */}
      {invoice && (
        <Card title="Factura Original">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Número de factura:</span>
              <Link
                href={`/invoices/${invoice.id}`}
                className="font-medium text-black hover:underline"
              >
                {invoice.number} →
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Valor original:</span>
              <span className="font-medium">{formatCurrency(invoice.total.amount)}</span>
            </div>
            {invoice.client && (
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Cliente:</span>
                <span className="font-medium">{invoice.client.fullName}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Información de la Nota */}
      <Card title="Motivo de la Nota">
        <div className="space-y-3">
          <div>
            <span className="text-sm text-gray-600">Motivo:</span>
            <p className="font-medium text-black">{getReasonText(note.reason)}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Descripción:</span>
            <p className="text-black whitespace-pre-wrap">{note.reasonDescription}</p>
          </div>
        </div>
      </Card>

      {/* Items de la Nota */}
      <Card title="Detalle de Items">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">
                  Descripción
                </th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">
                  Cantidad
                </th>
                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                  Precio Unit.
                </th>
                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {note.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-3 px-2 text-black">{item.description}</td>
                  <td className="py-3 px-2 text-center text-gray-600">{item.quantity}</td>
                  <td className="py-3 px-2 text-right text-gray-600">
                    {formatCurrency(item.unitPrice.amount)}
                  </td>
                  <td className="py-3 px-2 text-right font-medium text-black">
                    {formatCurrency(item.total.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="mt-6 border-t pt-4">
          <div className="flex flex-col items-end">
            <div className="flex justify-between w-full sm:w-64 border-t pt-2">
              <span className="text-xl font-bold text-black">
                Total de la Nota:
              </span>
              <span className={`text-xl font-bold ${note.type === 'credit' ? 'text-green-700' : 'text-red-700'}`}>
                {note.type === 'credit' ? '-' : '+'}
                {formatCurrency(note.total.amount)}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Efecto en la Factura */}
      {invoice && (
        <Card title="Impacto en la Factura">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-lg">
              <span className="text-gray-700">Valor Original:</span>
              <span className="font-medium">{formatCurrency(invoice.total.amount)}</span>
            </div>

            <div className="flex justify-between items-center text-lg">
              <span className={note.type === 'credit' ? 'text-green-700' : 'text-red-700'}>
                {getNoteTypeText(note.type)}:
              </span>
              <span className={`font-medium ${note.type === 'credit' ? 'text-green-700' : 'text-red-700'}`}>
                {note.type === 'credit' ? '-' : '+'}
                {formatCurrency(note.total.amount)}
              </span>
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between items-center text-xl">
                <span className="font-bold text-black">Nuevo Valor:</span>
                <span className="font-bold text-black">
                  {formatCurrency(
                    note.type === 'credit'
                      ? invoice.total.amount - note.total.amount
                      : invoice.total.amount + note.total.amount
                  )}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
