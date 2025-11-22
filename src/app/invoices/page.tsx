'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { InvoiceEntity, InvoiceStatus } from '@/domain/entities/Invoice';
import { Button } from '@/presentation/components/ui/Button';
import { Card } from '@/presentation/components/ui/Card';

interface InvoicesResponse {
  success: boolean;
  data: InvoiceEntity[];
}

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | 'all'>(
    'all'
  );
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const response = await fetch('/api/invoices');
      const result = (await response.json()) as InvoicesResponse;

      if (result.success && result.data) {
        setInvoices(result.data);
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
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

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesStatus =
      filterStatus === 'all' || invoice.status === filterStatus;
    const matchesSearch =
      searchTerm === '' ||
      invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client?.fullName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      invoice.client?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const getInvoiceStats = () => {
    const total = invoices.length;
    const completed = invoices.filter((i) => i.status === 'completed').length;
    const pending = invoices.filter((i) => i.status === 'pending').length;
    const draft = invoices.filter((i) => i.status === 'draft').length;

    const totalAmount = invoices
      .filter((i) => i.status === 'completed')
      .reduce((sum, i) => sum + i.total.amount, 0);

    return { total, completed, pending, draft, totalAmount };
  };

  const stats = getInvoiceStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-black">Facturas</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black">
            Facturas
          </h1>
          <p className="text-gray-600">Gestiona todas tus facturas</p>
        </div>
        <Button
          onClick={() => router.push('/invoices/new')}
          className="w-full sm:w-auto"
        >
          Nueva Factura
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-black">{stats.total}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-700">Completadas</p>
          <p className="text-2xl font-bold text-green-800">{stats.completed}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Borradores</p>
          <p className="text-2xl font-bold text-gray-800">{stats.draft}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">Total Facturado</p>
          <p className="text-lg font-bold text-blue-800">
            {formatCurrency(stats.totalAmount)}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card title="Filtrar Facturas">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-black mb-1"
            >
              Buscar
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por número, cliente o email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-black mb-1"
            >
              Estado
            </label>
            <select
              id="status"
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as InvoiceStatus | 'all')
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="draft">Borradores</option>
              <option value="pending">Pendientes</option>
              <option value="completed">Completadas</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Lista de facturas */}
      <Card title={`Facturas (${filteredInvoices.length})`}>
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus !== 'all'
                ? 'No se encontraron facturas con los filtros aplicados'
                : 'No hay facturas creadas'}
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Button onClick={() => router.push('/invoices/new')}>
                Crear primera factura
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                    Número
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                    Cliente
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                    Fecha
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                    Estado
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                    Total
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="font-medium text-black">
                        {invoice.number}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm text-black">
                          {invoice.client?.fullName || 'Sin cliente'}
                        </p>
                        {invoice.client?.email && (
                          <p className="text-xs text-gray-500">
                            {invoice.client.email}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">
                        {new Date(invoice.updatedAt).toLocaleDateString(
                          'es-CO',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          }
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}
                      >
                        {getStatusText(invoice.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-semibold text-black">
                        {formatCurrency(invoice.total.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="text-black hover:underline text-sm font-medium"
                      >
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
