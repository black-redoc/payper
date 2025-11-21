import { NoteEntity } from '../entities/Note';
import { NoteType } from '@/shared/types';

export interface NoteRepository {
  save(note: NoteEntity): Promise<NoteEntity>;
  findById(id: string): Promise<NoteEntity | null>;
  findAll(): Promise<NoteEntity[]>;
  findByInvoiceId(invoiceId: string): Promise<NoteEntity[]>;
  findByType(type: NoteType): Promise<NoteEntity[]>;
  update(note: NoteEntity): Promise<NoteEntity>;
  delete(id: string): Promise<void>;
}
