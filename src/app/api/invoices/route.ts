/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { invoiceService, companyService } from '@/infrastructure/di/container';
import { InvoiceEntity } from '@/domain/entities/Invoice';
import { ClientEntity } from '@/domain/entities/Client';

// GET /api/invoices - Obtener todas las facturas o las recientes
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit');

    let invoices: InvoiceEntity[];

    if (limit) {
      invoices = await invoiceService.getRecentInvoices(parseInt(limit));
    } else {
      invoices = await invoiceService.getAllInvoices();
    }

    return NextResponse.json({
      success: true,
      data: invoices,
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch invoices',
      },
      { status: 500 }
    );
  }
}

// POST /api/invoices - Crear una nueva factura
export async function POST(request: NextRequest) {
  try {
    const body: any = await request.json();

    // Verificar si hay datos de compañía
    const hasCompanyData = await companyService.hasCompanyData();
    if (!hasCompanyData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Company information is required to create invoices. Please set up company data first.',
        },
        { status: 400 }
      );
    }

    // Crear cliente si se proporciona
    let client: ClientEntity | undefined;
    if (body.client) {
      client = ClientEntity.create(body.client);
    }

    // Crear la factura
    const invoice = await invoiceService.createInvoice(client);

    return NextResponse.json(
      {
        success: true,
        data: invoice,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create invoice',
      },
      { status: 500 }
    );
  }
}
