import { NextResponse } from 'next/server';
import { invoiceService } from '@/infrastructure/di/container';

// GET /api/invoices/stats - Obtener estadísticas de facturas
export async function GET() {
  try {
    const invoices = await invoiceService.getAllInvoices();

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const stats = invoices.reduce(
      (acc, invoice) => {
        acc.totalInvoices++;

        if (invoice.status === 'completed') {
          acc.completedInvoices++;
          acc.totalRevenue += invoice.total.amount;

          const invoiceDate = new Date(invoice.updatedAt);
          if (
            invoiceDate.getMonth() === currentMonth &&
            invoiceDate.getFullYear() === currentYear
          ) {
            acc.monthlyRevenue += invoice.total.amount;
          }
        }

        if (invoice.status === 'pending') {
          acc.pendingInvoices++;
        }

        return acc;
      },
      {
        totalInvoices: 0,
        completedInvoices: 0,
        pendingInvoices: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
      }
    );

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching invoice stats:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch invoice stats',
      },
      { status: 500 }
    );
  }
}
