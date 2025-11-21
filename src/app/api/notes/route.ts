/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { noteService, noteRepository } from '@/infrastructure/di/container';
import { NoteEntity } from '@/domain/entities/Note';
import { InvoiceItemEntity } from '@/domain/entities/InvoiceItem';
import { NoteType, NoteReason } from '@/shared/types';

// GET /api/notes - Obtener todas las notas
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const invoiceId = searchParams.get('invoiceId');
    const type = searchParams.get('type') as NoteType | null;

    let notes: NoteEntity[];

    if (invoiceId) {
      notes = await noteService.getNotesByInvoice(invoiceId);
    } else if (type && (type === 'credit' || type === 'debit')) {
      notes = await noteRepository.findByType(type);
    } else {
      notes = await noteService.getAllNotes();
    }

    return NextResponse.json({
      success: true,
      data: notes,
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch notes',
      },
      { status: 500 }
    );
  }
}

// POST /api/notes - Crear una nueva nota
export async function POST(request: NextRequest) {
  try {
    const body: any = await request.json();

    // Validar campos requeridos
    if (!body.type || !body.invoiceId || !body.reason || !body.reasonDescription) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: type, invoiceId, reason, reasonDescription',
        },
        { status: 400 }
      );
    }

    // Crear la nota usando el servicio que valida la factura
    const note = await noteService.createNote({
      type: body.type as NoteType,
      invoiceId: body.invoiceId,
      reason: body.reason as NoteReason,
      reasonDescription: body.reasonDescription,
    });

    // Agregar items si se proporcionan
    if (body.items && Array.isArray(body.items)) {
      body.items.forEach((itemData: any) => {
        const item = InvoiceItemEntity.create({
          description: itemData.description,
          quantity: itemData.quantity,
          unitPrice: itemData.unitPrice,
        });
        note.addItem(item);
      });

      // Actualizar la nota con los items
      await noteRepository.update(note);
    }

    return NextResponse.json(
      {
        success: true,
        data: note,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create note',
      },
      { status: 500 }
    );
  }
}
