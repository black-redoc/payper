'use client';

import React, { useState, useEffect } from 'react';
import { InvoiceEntity } from '@/domain/entities/Invoice';
import { serviceContainer } from '@/shared/utils/serviceContainer';
import { Card } from '../ui/Card';
import Link from 'next/link';

export function RecentInvoices() {
  const [invoices, setInvoices] = useState<InvoiceEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentInvoices();
  }, []);

  const loadRecentInvoices = async () => {
    try {
      const recentInvoices = await serviceContainer.invoiceService.getRecentInvoices(5);
      setInvoices(recentInvoices);
    } catch (error) {
      console.error('Error loading recent invoices:', error);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <Card title="Facturas Recientes">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card title="Facturas Recientes">
      {invoices.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No hay facturas recientes</p>
          <Link
            href="/invoices/new"
            className="text-black hover:underline font-medium"
          >
            Crear primera factura
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-black">{invoice.number}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}
                  >
                    {getStatusText(invoice.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {invoice.client?.fullName || 'Cliente no especificado'}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(invoice.updatedAt).toLocaleDateString('es-CO')}
                </p>
              </div>
              <div className="flex items-center justify-between sm:justify-end mt-2 sm:mt-0 space-x-3">
                <span className="font-semibold text-black">
                  {formatCurrency(invoice.total.amount)}
                </span>
                <Link
                  href={`/invoices/${invoice.id}`}
                  className="text-black hover:underline text-sm"
                >
                  Ver →
                </Link>
              </div>
            </div>
          ))}
          {invoices.length > 0 && (
            <div className="pt-3 border-t border-gray-100">
              <Link
                href="/invoices"
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                Ver todas las facturas →
              </Link>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}