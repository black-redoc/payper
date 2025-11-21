/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { invoiceService, invoiceRepository } from '@/infrastructure/di/container';
import { InvoiceItemEntity } from '@/domain/entities/InvoiceItem';
import { ClientEntity } from '@/domain/entities/Client';

// GET /api/invoices/[id] - Obtener una factura por ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoice = await invoiceService.getInvoice(id);

    if (!invoice) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invoice not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch invoice',
      },
      { status: 500 }
    );
  }
}

// PUT /api/invoices/[id] - Reemplazar completamente una factura
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: any = await request.json();
    const invoice = await invoiceService.getInvoice(id);

    if (!invoice) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invoice not found',
        },
        { status: 404 }
      );
    }

    // Actualizar cliente
    const client = body.client ? ClientEntity.create(body.client) : undefined;
    invoice.setClient(client);

    // Reemplazar items completamente
    invoice.items.length = 0;
    if (body.items && Array.isArray(body.items)) {
      body.items.forEach((itemData: any) => {
        const item = InvoiceItemEntity.create({
          description: itemData.description,
          quantity: itemData.quantity,
          unitPrice: itemData.unitPrice,
        });
        invoice.addItem(item);
      });
    }

    // Actualizar notas
    invoice.notes = body.notes;

    // Actualizar fecha de vencimiento
    invoice.dueDate = body.dueDate ? new Date(body.dueDate) : undefined;

    // Actualizar estado
    if (body.status === 'completed') {
      invoice.markAsCompleted();
    } else if (body.status === 'pending') {
      invoice.markAsPending();
    } else {
      invoice.status = 'draft';
    }

    const updated = await invoiceRepository.update(invoice);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update invoice',
      },
      { status: 500 }
    );
  }
}

// PATCH /api/invoices/[id] - Actualización parcial de una factura
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: any = await request.json();
    const invoice = await invoiceService.getInvoice(id);

    if (!invoice) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invoice not found',
        },
        { status: 404 }
      );
    }

    // Actualizar cliente solo si se proporciona
    if (body.client !== undefined) {
      const client = body.client ? ClientEntity.create(body.client) : undefined;
      invoice.setClient(client);
    }

    // Actualizar items solo si se proporcionan
    if (body.items && Array.isArray(body.items)) {
      invoice.items.length = 0;
      body.items.forEach((itemData: any) => {
        const item = InvoiceItemEntity.create({
          description: itemData.description,
          quantity: itemData.quantity,
          unitPrice: itemData.unitPrice,
        });
        invoice.addItem(item);
      });
    }

    // Actualizar notas solo si se proporcionan
    if (body.notes !== undefined) {
      invoice.notes = body.notes;
    }

    // Actualizar fecha de vencimiento solo si se proporciona
    if (body.dueDate !== undefined) {
      invoice.dueDate = body.dueDate ? new Date(body.dueDate) : undefined;
    }

    // Actualizar estado solo si se proporciona
    if (body.status) {
      if (body.status === 'completed') {
        invoice.markAsCompleted();
      } else if (body.status === 'pending') {
        invoice.markAsPending();
      } else if (body.status === 'draft') {
        invoice.status = 'draft';
        invoice.updatedAt = new Date();
      }
    }

    const updated = await invoiceRepository.update(invoice);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Error patching invoice:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to patch invoice',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/invoices/[id] - Eliminar una factura
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoice = await invoiceService.getInvoice(id);

    if (!invoice) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invoice not found',
        },
        { status: 404 }
      );
    }

    await invoiceRepository.delete(id);

    return NextResponse.json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete invoice',
      },
      { status: 500 }
    );
  }
}
