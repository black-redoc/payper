import { NoteEntity } from '../entities/Note';
import { InvoiceItemEntity } from '../entities/InvoiceItem';
import { NoteRepository } from '../repositories/NoteRepository';
import { InvoiceRepository } from '../repositories/InvoiceRepository';
import { NoteType, NoteReason, Money } from '@/shared/types';

export class NoteService {
  constructor(
    private noteRepository: NoteRepository,
    private invoiceRepository: InvoiceRepository
  ) {}

  async createNote(data: {
    type: NoteType;
    invoiceId: string;
    reason: NoteReason;
    reasonDescription: string;
  }): Promise<NoteEntity> {
    // Verificar que la factura existe
    const invoice = await this.invoiceRepository.findById(data.invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const note = NoteEntity.create(data);
    return this.noteRepository.save(note);
  }

  async addItemToNote(
    noteId: string,
    description: string,
    quantity: number,
    unitPrice: Money
  ): Promise<NoteEntity> {
    const note = await this.noteRepository.findById(noteId);
    if (!note) {
      throw new Error('Note not found');
    }

    const item = InvoiceItemEntity.create({
      description,
      quantity,
      unitPrice
    });

    note.addItem(item);
    return this.noteRepository.update(note);
  }

  async removeItemFromNote(
    noteId: string,
    itemId: string
  ): Promise<NoteEntity> {
    const note = await this.noteRepository.findById(noteId);
    if (!note) {
      throw new Error('Note not found');
    }

    note.removeItem(itemId);
    return this.noteRepository.update(note);
  }

  async updateItemInNote(
    noteId: string,
    itemId: string,
    description: string,
    quantity: number,
    unitPrice: Money
  ): Promise<NoteEntity> {
    const note = await this.noteRepository.findById(noteId);
    if (!note) {
      throw new Error('Note not found');
    }

    const item = note.items.find(i => i.id === itemId);
    if (!item) {
      throw new Error('Item not found in note');
    }

    item.updateDescription(description);
    item.updateQuantity(quantity);
    item.updateUnitPrice(unitPrice);

    note.calculateTotals();
    return this.noteRepository.update(note);
  }

  async getNote(id: string): Promise<NoteEntity | null> {
    return this.noteRepository.findById(id);
  }

  async getAllNotes(): Promise<NoteEntity[]> {
    return this.noteRepository.findAll();
  }

  async getNotesByInvoice(invoiceId: string): Promise<NoteEntity[]> {
    return this.noteRepository.findByInvoiceId(invoiceId);
  }

  async getCreditNotes(): Promise<NoteEntity[]> {
    return this.noteRepository.findByType('credit');
  }

  async getDebitNotes(): Promise<NoteEntity[]> {
    return this.noteRepository.findByType('debit');
  }

  async deleteNote(id: string): Promise<void> {
    return this.noteRepository.delete(id);
  }

  async getInvoiceBalance(invoiceId: string): Promise<{
    originalAmount: number;
    creditNotesTotal: number;
    debitNotesTotal: number;
    finalBalance: number;
  }> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const notes = await this.getNotesByInvoice(invoiceId);

    const creditNotesTotal = notes
      .filter(n => n.type === 'credit')
      .reduce((sum, n) => sum + n.total.amount, 0);

    const debitNotesTotal = notes
      .filter(n => n.type === 'debit')
      .reduce((sum, n) => sum + n.total.amount, 0);

    const originalAmount = invoice.total.amount;
    const finalBalance = originalAmount - creditNotesTotal + debitNotesTotal;

    return {
      originalAmount,
      creditNotesTotal,
      debitNotesTotal,
      finalBalance
    };
  }
}
