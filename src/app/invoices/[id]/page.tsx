'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { InvoiceEntity } from '@/domain/entities/Invoice';
import { NoteEntity } from '@/domain/entities/Note';
import { serviceContainer } from '@/shared/utils/serviceContainer';
import { Button } from '@/presentation/components/ui/Button';
import { Card } from '@/presentation/components/ui/Card';
import { NotesList } from '@/presentation/components/Note/NotesList';

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<InvoiceEntity | null>(null);
  const [notes, setNotes] = useState<NoteEntity[]>([]);
  const [balance, setBalance] = useState<{
    originalAmount: number;
    creditNotesTotal: number;
    debitNotesTotal: number;
    finalBalance: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadInvoice();
    loadNotes();
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

      // Cargar balance con notas
      const invoiceBalance = await serviceContainer.noteService.getInvoiceBalance(invoiceId);
      setBalance(invoiceBalance);
    } catch (error) {
      console.error('Error loading invoice:', error);
      toast.error('Error al cargar la factura');
      router.push('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = async () => {
    try {
      const invoiceNotes = await serviceContainer.noteService.getNotesByInvoice(invoiceId);
      setNotes(invoiceNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleStatusChange = async (newStatus: 'draft' | 'pending' | 'completed') => {
    if (!invoice) return;

    setProcessing(true);
    try {
      await serviceContainer.invoiceService.updateInvoiceStatus(invoice.id, newStatus);
      await loadInvoice();
      toast.success(`Factura marcada como ${getStatusText(newStatus)}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al actualizar el estado');
    } finally {
      setProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
        <h1 className="text-2xl sm:text-3xl font-bold text-black">Cargando factura...</h1>
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-black">
              Factura {invoice.number}
            </h1>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(invoice.status)}`}
            >
              {getStatusText(invoice.status)}
            </span>
          </div>
          <p className="text-gray-600">
            Creada el {new Date(invoice.createdAt).toLocaleDateString('es-CO', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={() => router.push('/invoices')}
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            Volver
          </Button>
          <Button
            onClick={() => router.push(`/invoices/${invoice.id}/edit`)}
            variant="secondary"
            className="flex-1 sm:flex-none"
          >
            Editar
          </Button>
          <Button
            onClick={handlePrint}
            variant="secondary"
            className="flex-1 sm:flex-none"
          >
            Imprimir
          </Button>
        </div>
      </div>

      {/* Información de la Empresa */}
      <Card title="Información del Emisor">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-black">{invoice.company.name}</h3>
          {invoice.company.taxId && (
            <p className="text-gray-600">NIT: {invoice.company.taxId}</p>
          )}
          {invoice.company.address && (
            <p className="text-gray-600">Dirección: {invoice.company.address}</p>
          )}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            {invoice.company.phone && (
              <p className="text-gray-600">Tel: {invoice.company.phone}</p>
            )}
            {invoice.company.email && (
              <p className="text-gray-600">Email: {invoice.company.email}</p>
            )}
          </div>
          {invoice.company.website && (
            <p className="text-gray-600">Web: {invoice.company.website}</p>
          )}
        </div>
      </Card>

      {/* Información del Cliente */}
      <Card title="Información del Cliente">
        {invoice.client ? (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-black">
              {invoice.client.fullName || 'Sin nombre'}
            </h3>
            {invoice.client.identificationType && invoice.client.identificationNumber && (
              <p className="text-gray-600">
                {invoice.client.identificationType.toUpperCase()}: {invoice.client.identificationNumber}
              </p>
            )}
            {invoice.client.email && (
              <p className="text-gray-600">Email: {invoice.client.email}</p>
            )}
          </div>
        ) : (
          <p className="text-gray-500 italic">No se especificó cliente para esta factura</p>
        )}
      </Card>

      {/* Items de la Factura */}
      <Card title="Detalles de la Factura">
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
              {invoice.items.map((item) => (
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

        {/* Totales */}
        <div className="mt-6 border-t pt-4">
          <div className="flex flex-col items-end space-y-2">
            <div className="flex justify-between w-full sm:w-64">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-medium text-black">
                {formatCurrency(invoice.subtotal.amount)}
              </span>
            </div>

            {invoice.company.tipEnabled && invoice.tipAmount.amount > 0 && (
              <div className="flex justify-between w-full sm:w-64">
                <span className="text-gray-700">
                  Propina ({invoice.company.tipPercentage}%):
                </span>
                <span className="font-medium text-black">
                  {formatCurrency(invoice.tipAmount.amount)}
                </span>
              </div>
            )}

            <div className="flex justify-between w-full sm:w-64 border-t pt-2">
              <span className="text-xl font-bold text-black">Total:</span>
              <span className="text-xl font-bold text-black">
                {formatCurrency(invoice.total.amount)}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Notas de la factura (comentarios) */}
      {invoice.notes && (
        <Card title="Notas / Comentarios">
          <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
        </Card>
      )}

      {/* Balance con Notas Crédito/Débito */}
      {balance && (notes.length > 0 || balance.creditNotesTotal > 0 || balance.debitNotesTotal > 0) && (
        <Card title="Balance de la Factura">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-lg">
              <span className="text-gray-700">Valor Original:</span>
              <span className="font-medium">{formatCurrency(balance.originalAmount)}</span>
            </div>

            {balance.creditNotesTotal > 0 && (
              <div className="flex justify-between items-center text-lg">
                <span className="text-green-700">Notas Crédito:</span>
                <span className="font-medium text-green-700">
                  -{formatCurrency(balance.creditNotesTotal)}
                </span>
              </div>
            )}

            {balance.debitNotesTotal > 0 && (
              <div className="flex justify-between items-center text-lg">
                <span className="text-red-700">Notas Débito:</span>
                <span className="font-medium text-red-700">
                  +{formatCurrency(balance.debitNotesTotal)}
                </span>
              </div>
            )}

            <div className="border-t pt-3">
              <div className="flex justify-between items-center text-xl">
                <span className="font-bold text-black">Balance Final:</span>
                <span className="font-bold text-black">
                  {formatCurrency(balance.finalBalance)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Notas Crédito y Débito */}
      <NotesList notes={notes} loading={loadingNotes} />

      {/* Crear Nueva Nota */}
      <Card title="Gestionar Notas" className="print:hidden">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Crea notas de crédito o débito para modificar el valor de esta factura sin alterar el documento original.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => router.push(`/invoices/${invoice.id}/notes/new?type=credit`)}
              variant="secondary"
              className="flex-1"
            >
              Crear Nota Crédito
            </Button>
            <Button
              onClick={() => router.push(`/invoices/${invoice.id}/notes/new?type=debit`)}
              variant="secondary"
              className="flex-1"
            >
              Crear Nota Débito
            </Button>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p className="font-medium mb-1">¿Qué son las notas?</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li><strong>Nota Crédito:</strong> Reduce el valor (devoluciones, descuentos, ajustes a favor del cliente)</li>
              <li><strong>Nota Débito:</strong> Aumenta el valor (cargos adicionales, items faltantes, intereses)</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Acciones de Estado */}
      <Card title="Acciones" className="print:hidden">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Cambia el estado de la factura según su progreso:
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            {invoice.status !== 'draft' && (
              <Button
                onClick={() => handleStatusChange('draft')}
                variant="outline"
                disabled={processing}
                className="flex-1"
              >
                Marcar como Borrador
              </Button>
            )}
            {invoice.status !== 'pending' && (
              <Button
                onClick={() => handleStatusChange('pending')}
                variant="secondary"
                disabled={processing}
                className="flex-1 cursor-pointer"
              >
                Marcar como Pendiente
              </Button>
            )}
            {invoice.status !== 'completed' && (
              <Button
                onClick={() => handleStatusChange('completed')}
                variant="primary"
                disabled={processing || !invoice.canBeCompleted}
                className="flex-1 cursor-pointer"
              >
                Marcar como Completada
              </Button>
            )}
          </div>
          {!invoice.canBeCompleted && invoice.status !== 'completed' && (
            <p className="text-sm text-red-600">
              Esta factura no puede ser completada porque no tiene items válidos.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
