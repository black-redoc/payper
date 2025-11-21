/* eslint-disable @typescript-eslint/no-explicit-any */
import { NoteRepository } from '@/domain/repositories/NoteRepository';
import { NoteEntity } from '@/domain/entities/Note';
import { InvoiceItemEntity } from '@/domain/entities/InvoiceItem';
import { LocalStorageService } from '../storage/LocalStorage';
import { NoteType } from '@/shared/types';

const STORAGE_KEY = 'invoice_app_notes';

export class LocalStorageNoteRepository implements NoteRepository {
  async save(note: NoteEntity): Promise<NoteEntity> {
    const notes = await this.getAll();
    const serializedNote = this.serializeNote(note);

    const existingIndex = notes.findIndex(n => n.id === note.id);
    if (existingIndex >= 0) {
      notes[existingIndex] = serializedNote;
    } else {
      notes.push(serializedNote);
    }

    LocalStorageService.set(STORAGE_KEY, notes);
    return note;
  }

  async findById(id: string): Promise<NoteEntity | null> {
    const notes = await this.getAll();
    const noteData = notes.find(n => n.id === id);
    return noteData ? this.deserializeNote(noteData) : null;
  }

  async findAll(): Promise<NoteEntity[]> {
    const notes = await this.getAll();
    return notes.map(data => this.deserializeNote(data));
  }

  async findByInvoiceId(invoiceId: string): Promise<NoteEntity[]> {
    const notes = await this.findAll();
    return notes.filter(note => note.invoiceId === invoiceId);
  }

  async findByType(type: NoteType): Promise<NoteEntity[]> {
    const notes = await this.findAll();
    return notes.filter(note => note.type === type);
  }

  async update(note: NoteEntity): Promise<NoteEntity> {
    note.updatedAt = new Date();
    return this.save(note);
  }

  async delete(id: string): Promise<void> {
    const notes = await this.getAll();
    const filteredNotes = notes.filter(n => n.id !== id);
    LocalStorageService.set(STORAGE_KEY, filteredNotes);
  }

  private async getAll(): Promise<any[]> {
    return LocalStorageService.get<any[]>(STORAGE_KEY) || [];
  }

  private serializeNote(note: NoteEntity): any {
    return {
      id: note.id,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
      number: note.number,
      type: note.type,
      invoiceId: note.invoiceId,
      reason: note.reason,
      reasonDescription: note.reasonDescription,
      items: note.items.map(item => this.serializeItem(item)),
      subtotal: note.subtotal,
      total: note.total
    };
  }

  private deserializeNote(data: any): NoteEntity {
    const items = data.items.map((item: any) => this.deserializeItem(item));

    return new NoteEntity(
      data.id,
      new Date(data.createdAt),
      new Date(data.updatedAt),
      data.number,
      data.type,
      data.invoiceId,
      data.reason,
      data.reasonDescription,
      items,
      data.subtotal,
      data.total
    );
  }

  private serializeItem(item: InvoiceItemEntity): any {
    return {
      id: item.id,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total
    };
  }

  private deserializeItem(data: any): InvoiceItemEntity {
    return new InvoiceItemEntity(
      data.id,
      new Date(data.createdAt),
      new Date(data.updatedAt),
      data.description,
      data.quantity,
      data.unitPrice,
      data.total
    );
  }
}
