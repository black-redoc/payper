/* eslint-disable @typescript-eslint/no-explicit-any */
import { NoteRepository } from '@/domain/repositories/NoteRepository';
import { NoteEntity } from '@/domain/entities/Note';
import { InvoiceItemEntity } from '@/domain/entities/InvoiceItem';
import { NoteType } from '@/shared/types';
import prisma from '../database/prisma';

export class PrismaNoteRepository implements NoteRepository {
  async save(note: NoteEntity): Promise<NoteEntity> {
    const created = await prisma.note.create({
      data: {
        id: note.id,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        number: note.number,
        type: note.type,
        invoiceId: note.invoiceId,
        reason: note.reason,
        reasonDescription: note.reasonDescription,
        subtotalAmount: note.subtotal.amount,
        subtotalCurrency: note.subtotal.currency,
        totalAmount: note.total.amount,
        totalCurrency: note.total.currency,
        items: {
          create: note.items.map(item => ({
            id: item.id,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            description: item.description,
            quantity: item.quantity,
            unitPriceAmount: item.unitPrice.amount,
            unitPriceCurrency: item.unitPrice.currency,
            totalAmount: item.total.amount,
            totalCurrency: item.total.currency,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return this.mapToEntity(created);
  }

  async findById(id: string): Promise<NoteEntity | null> {
    const note = await prisma.note.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    return note ? this.mapToEntity(note) : null;
  }

  async findAll(): Promise<NoteEntity[]> {
    const notes = await prisma.note.findMany({
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return notes.map(note => this.mapToEntity(note));
  }

  async findByInvoiceId(invoiceId: string): Promise<NoteEntity[]> {
    const notes = await prisma.note.findMany({
      where: { invoiceId },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return notes.map(note => this.mapToEntity(note));
  }

  async findByType(type: NoteType): Promise<NoteEntity[]> {
    const notes = await prisma.note.findMany({
      where: { type },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return notes.map(note => this.mapToEntity(note));
  }

  async update(note: NoteEntity): Promise<NoteEntity> {
    // Primero eliminar los items existentes
    await prisma.invoiceItem.deleteMany({
      where: { noteId: note.id },
    });

    // Actualizar la nota con los nuevos items
    const updated = await prisma.note.update({
      where: { id: note.id },
      data: {
        updatedAt: note.updatedAt,
        number: note.number,
        type: note.type,
        invoiceId: note.invoiceId,
        reason: note.reason,
        reasonDescription: note.reasonDescription,
        subtotalAmount: note.subtotal.amount,
        subtotalCurrency: note.subtotal.currency,
        totalAmount: note.total.amount,
        totalCurrency: note.total.currency,
        items: {
          create: note.items.map(item => ({
            id: item.id,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            description: item.description,
            quantity: item.quantity,
            unitPriceAmount: item.unitPrice.amount,
            unitPriceCurrency: item.unitPrice.currency,
            totalAmount: item.total.amount,
            totalCurrency: item.total.currency,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.note.delete({
      where: { id },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapToEntity(data: any): NoteEntity {
    const items = data.items.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item: any) =>
        new InvoiceItemEntity(
          item.id,
          item.createdAt,
          item.updatedAt,
          item.description,
          item.quantity,
          { amount: item.unitPriceAmount, currency: item.unitPriceCurrency },
          { amount: item.totalAmount, currency: item.totalCurrency }
        )
    );

    return new NoteEntity(
      data.id,
      data.createdAt,
      data.updatedAt,
      data.number,
      data.type,
      data.invoiceId,
      data.reason,
      data.reasonDescription,
      items,
      { amount: data.subtotalAmount, currency: data.subtotalCurrency },
      { amount: data.totalAmount, currency: data.totalCurrency }
    );
  }
}
