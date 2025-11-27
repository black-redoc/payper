// Dependency Injection Container
import { PrismaInvoiceRepository } from '../repositories/PrismaInvoiceRepository';
import { PrismaNoteRepository } from '../repositories/PrismaNoteRepository';
import { PrismaCompanyRepository } from '../repositories/PrismaCompanyRepository';
import { PrismaUserRepository } from '../repositories/PrismaUserRepository';
import { InvoiceRepository } from '@/domain/repositories/InvoiceRepository';
import { NoteRepository } from '@/domain/repositories/NoteRepository';
import { CompanyRepository } from '@/domain/repositories/CompanyRepository';
import { UserRepository } from '@/domain/repositories/UserRepository';
import { InvoiceService } from '@/domain/services/InvoiceService';
import { NoteService } from '@/domain/services/NoteService';
import { CompanyService } from '@/domain/services/CompanyService';
import { AuthService } from '@/domain/services/AuthService';

// All environments use Prisma with D1 (local or remote)
export const invoiceRepository: InvoiceRepository =
  new PrismaInvoiceRepository();
export const noteRepository: NoteRepository = new PrismaNoteRepository();
export const companyRepository: CompanyRepository =
  new PrismaCompanyRepository();
export const userRepository: UserRepository = new PrismaUserRepository();

// Services
export const invoiceService = new InvoiceService(
  invoiceRepository,
  companyRepository
);
export const noteService = new NoteService(noteRepository, invoiceRepository);
export const companyService = new CompanyService(companyRepository);
export const authService = new AuthService(userRepository);
