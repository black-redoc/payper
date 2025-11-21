'use client';

import React, { useState, useEffect } from 'react';
import { InvoiceEntity } from '@/domain/entities/Invoice';
import { serviceContainer } from '@/shared/utils/serviceContainer';
import { Card } from '../ui/Card';

interface DashboardStatsProps {}

interface Stats {
  totalInvoices: number;
  completedInvoices: number;
  pendingInvoices: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalInvoices: 0,
    completedInvoices: 0,
    pendingInvoices: 0,
    totalRevenue: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const invoices = await serviceContainer.invoiceService.getAllInvoices();

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const calculations = invoices.reduce((acc, invoice) => {
        acc.totalInvoices++;

        if (invoice.status === 'completed') {
          acc.completedInvoices++;
          acc.totalRevenue += invoice.total.amount;

          const invoiceDate = new Date(invoice.updatedAt);
          if (invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear) {
            acc.monthlyRevenue += invoice.total.amount;
          }
        }

        if (invoice.status === 'pending') {
          acc.pendingInvoices++;
        }

        return acc;
      }, {
        totalInvoices: 0,
        completedInvoices: 0,
        pendingInvoices: 0,
        totalRevenue: 0,
        monthlyRevenue: 0
      });

      setStats(calculations);
    } catch (error) {
      console.error('Error loading stats:', error);
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

  const statItems = [
    {
      title: 'Total Facturas',
      value: stats.totalInvoices.toString(),
      icon: '🧾',
      color: 'text-black'
    },
    {
      title: 'Completadas',
      value: stats.completedInvoices.toString(),
      icon: '✅',
      color: 'text-green-600'
    },
    {
      title: 'Pendientes',
      value: stats.pendingInvoices.toString(),
      icon: '⏳',
      color: 'text-yellow-600'
    },
    {
      title: 'Ingresos Totales',
      value: formatCurrency(stats.totalRevenue),
      icon: '💰',
      color: 'text-green-600'
    },
    {
      title: 'Este Mes',
      value: formatCurrency(stats.monthlyRevenue),
      icon: '📈',
      color: 'text-blue-600'
    }
  ];

  if (loading) {
    return (
      <Card title="Estadísticas">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card title="Estadísticas">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statItems.map((item) => (
          <div key={item.title} className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-2 mb-1">
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm text-gray-600 hidden lg:inline">{item.title}</span>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold" style={{ color: item.color.includes('text-') ? undefined : item.color }}>
              {item.value}
            </p>
            <p className="text-xs text-gray-600 lg:hidden">{item.title}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}