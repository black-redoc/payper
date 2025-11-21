'use client';

import React from 'react';
import Link from 'next/link';
import { NoteEntity } from '@/domain/entities/Note';
import { Card } from '../ui/Card';
import { NoteReason } from '@/shared/types';

interface NotesListProps {
  notes: NoteEntity[];
  loading?: boolean;
}

export function NotesList({ notes, loading = false }: NotesListProps) {
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

  const getNoteTypeIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return '↩️';
      case 'debit':
        return '➕';
      default:
        return '📝';
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
      <Card title="Notas Asociadas">
        <div className="animate-pulse space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (notes.length === 0) {
    return (
      <Card title="Notas Asociadas">
        <div className="text-center py-8">
          <p className="text-gray-500">No hay notas asociadas a esta factura</p>
          <p className="text-sm text-gray-400 mt-2">
            Las notas te permiten modificar valores sin alterar la factura original
          </p>
        </div>
      </Card>
    );
  }

  const creditNotes = notes.filter(n => n.type === 'credit');
  const debitNotes = notes.filter(n => n.type === 'debit');

  const creditTotal = creditNotes.reduce((sum, n) => sum + n.total.amount, 0);
  const debitTotal = debitNotes.reduce((sum, n) => sum + n.total.amount, 0);

  return (
    <Card title="Notas Asociadas">
      <div className="space-y-4">
        {/* Resumen */}
        <div className="grid grid-cols-2 gap-4 pb-4 border-b">
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="text-sm text-green-700">Notas Crédito</p>
            <p className="text-lg font-bold text-green-800">
              -{formatCurrency(creditTotal)}
            </p>
            <p className="text-xs text-green-600">{creditNotes.length} nota(s)</p>
          </div>
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <p className="text-sm text-red-700">Notas Débito</p>
            <p className="text-lg font-bold text-red-800">
              +{formatCurrency(debitTotal)}
            </p>
            <p className="text-xs text-red-600">{debitNotes.length} nota(s)</p>
          </div>
        </div>

        {/* Lista de notas */}
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-lg">{getNoteTypeIcon(note.type)}</span>
                  <span className="font-medium text-black">{note.number}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getNoteTypeColor(note.type)}`}
                  >
                    {getNoteTypeText(note.type)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {getReasonText(note.reason)}
                </p>
                {note.reasonDescription && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                    {note.reasonDescription}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {new Date(note.createdAt).toLocaleDateString('es-CO')} • {note.items.length} item(s)
                </p>
              </div>
              <div className="flex items-center justify-between sm:justify-end mt-2 sm:mt-0 space-x-3">
                <span className={`font-semibold ${note.type === 'credit' ? 'text-green-700' : 'text-red-700'}`}>
                  {note.type === 'credit' ? '-' : '+'}
                  {formatCurrency(note.total.amount)}
                </span>
                <Link
                  href={`/notes/${note.id}`}
                  className="text-black hover:underline text-sm"
                >
                  Ver →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
