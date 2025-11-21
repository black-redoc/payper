/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { noteService, noteRepository } from '@/infrastructure/di/container';
import { InvoiceItemEntity } from '@/domain/entities/InvoiceItem';
import { NoteType, NoteReason } from '@/shared/types';

// GET /api/notes/[id] - Obtener una nota por ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const note = await noteService.getNote(id);

    if (!note) {
      return NextResponse.json(
        {
          success: false,
          error: 'Note not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: note,
    });
  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch note',
      },
      { status: 500 }
    );
  }
}

// PUT /api/notes/[id] - Reemplazar completamente una nota
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: any = await request.json();
    const note = await noteService.getNote(id);

    if (!note) {
      return NextResponse.json(
        {
          success: false,
          error: 'Note not found',
        },
        { status: 404 }
      );
    }

    // Actualizar campos básicos
    note.type = body.type as NoteType;
    note.invoiceId = body.invoiceId;
    note.reason = body.reason as NoteReason;
    note.reasonDescription = body.reasonDescription;

    // Reemplazar items completamente
    note.items.length = 0;
    if (body.items && Array.isArray(body.items)) {
      body.items.forEach((itemData: any) => {
        const item = InvoiceItemEntity.create({
          description: itemData.description,
          quantity: itemData.quantity,
          unitPrice: itemData.unitPrice,
        });
        note.addItem(item);
      });
    }

    note.updatedAt = new Date();
    const updated = await noteRepository.update(note);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update note',
      },
      { status: 500 }
    );
  }
}

// PATCH /api/notes/[id] - Actualización parcial de una nota
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: any = await request.json();
    const note = await noteService.getNote(id);

    if (!note) {
      return NextResponse.json(
        {
          success: false,
          error: 'Note not found',
        },
        { status: 404 }
      );
    }

    // Actualizar campos solo si se proporcionan
    if (body.type !== undefined) {
      note.type = body.type as NoteType;
    }

    if (body.invoiceId !== undefined) {
      note.invoiceId = body.invoiceId;
    }

    if (body.reason !== undefined) {
      note.reason = body.reason as NoteReason;
    }

    if (body.reasonDescription !== undefined) {
      note.reasonDescription = body.reasonDescription;
    }

    // Actualizar items solo si se proporcionan
    if (body.items && Array.isArray(body.items)) {
      note.items.length = 0;
      body.items.forEach((itemData: any) => {
        const item = InvoiceItemEntity.create({
          description: itemData.description,
          quantity: itemData.quantity,
          unitPrice: itemData.unitPrice,
        });
        note.addItem(item);
      });
    }

    note.updatedAt = new Date();
    const updated = await noteRepository.update(note);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Error patching note:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to patch note',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/notes/[id] - Eliminar una nota
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const note = await noteService.getNote(id);

    if (!note) {
      return NextResponse.json(
        {
          success: false,
          error: 'Note not found',
        },
        { status: 404 }
      );
    }

    await noteService.deleteNote(id);

    return NextResponse.json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete note',
      },
      { status: 500 }
    );
  }
}
