import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InvoiceService } from '@/domain/services/InvoiceService';
import { InvoiceRepository } from '@/domain/repositories/InvoiceRepository';
import { CompanyRepository } from '@/domain/repositories/CompanyRepository';
import { CompanyEntity } from '@/domain/entities/Company';
import { InvoiceEntity } from '@/domain/entities/Invoice';
import { ClientEntity } from '@/domain/entities/Client';

describe('InvoiceService', () => {
  let invoiceService: InvoiceService;
  let mockInvoiceRepository: InvoiceRepository;
  let mockCompanyRepository: CompanyRepository;
  let mockCompany: CompanyEntity;

  beforeEach(() => {
    mockCompany = CompanyEntity.create({
      name: 'Test Company',
      tipPercentage: 10,
      tipEnabled: true
    });

    mockInvoiceRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findRecent: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    };

    mockCompanyRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findFirst: vi.fn().mockResolvedValue(mockCompany),
      update: vi.fn(),
      delete: vi.fn()
    };

    invoiceService = new InvoiceService(
      mockInvoiceRepository,
      mockCompanyRepository
    );
  });

  describe('createInvoice', () => {
    it('should create an invoice successfully when company exists', async () => {
      const mockInvoice = InvoiceEntity.create({ company: mockCompany });
      vi.mocked(mockInvoiceRepository.save).mockResolvedValue(mockInvoice);

      const result = await invoiceService.createInvoice();

      expect(mockCompanyRepository.findFirst).toHaveBeenCalled();
      expect(mockInvoiceRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.company).toBe(mockCompany);
    });

    it('should throw error when no company is found', async () => {
      vi.mocked(mockCompanyRepository.findFirst).mockResolvedValue(null);

      await expect(invoiceService.createInvoice()).rejects.toThrow(
        'No company found. Please set up company information first.'
      );
    });

    it('should create invoice with client when provided', async () => {
      const client = ClientEntity.create({
        firstName: 'John',
        lastName: 'Doe'
      });
      const mockInvoice = InvoiceEntity.create({ company: mockCompany, client });
      vi.mocked(mockInvoiceRepository.save).mockResolvedValue(mockInvoice);

      const result = await invoiceService.createInvoice(client);

      expect(result.client).toBe(client);
    });
  });

  describe('addItemToInvoice', () => {
    it('should add item to invoice successfully', async () => {
      const mockInvoice = InvoiceEntity.create({ company: mockCompany });
      vi.mocked(mockInvoiceRepository.findById).mockResolvedValue(mockInvoice);
      vi.mocked(mockInvoiceRepository.update).mockResolvedValue(mockInvoice);

      const result = await invoiceService.addItemToInvoice(
        'invoice-id',
        'Test Item',
        2,
        { amount: 100, currency: 'COP' }
      );

      expect(mockInvoiceRepository.findById).toHaveBeenCalledWith('invoice-id');
      expect(mockInvoiceRepository.update).toHaveBeenCalled();
      expect(result.items).toHaveLength(1);
      expect(result.items[0].description).toBe('Test Item');
    });

    it('should throw error when invoice not found', async () => {
      vi.mocked(mockInvoiceRepository.findById).mockResolvedValue(null);

      await expect(
        invoiceService.addItemToInvoice(
          'invalid-id',
          'Test Item',
          1,
          { amount: 100, currency: 'COP' }
        )
      ).rejects.toThrow('Invoice not found');
    });
  });

  describe('updateInvoiceStatus', () => {
    it('should update invoice status to completed when invoice can be completed', async () => {
      const mockInvoice = InvoiceEntity.create({ company: mockCompany });
      mockInvoice.addItem({
        id: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Test Item',
        quantity: 1,
        unitPrice: { amount: 100, currency: 'COP' },
        total: { amount: 100, currency: 'COP' },
        calculateTotal: vi.fn(),
        updateQuantity: vi.fn(),
        updateUnitPrice: vi.fn(),
        updateDescription: vi.fn(),
        get isValid() { return true; }
      });

      vi.mocked(mockInvoiceRepository.findById).mockResolvedValue(mockInvoice);
      vi.mocked(mockInvoiceRepository.update).mockResolvedValue(mockInvoice);

      const result = await invoiceService.updateInvoiceStatus('invoice-id', 'completed');

      expect(result.status).toBe('completed');
      expect(mockInvoiceRepository.update).toHaveBeenCalled();
    });

    it('should throw error when trying to complete invoice without valid items', async () => {
      const mockInvoice = InvoiceEntity.create({ company: mockCompany });
      vi.mocked(mockInvoiceRepository.findById).mockResolvedValue(mockInvoice);

      await expect(
        invoiceService.updateInvoiceStatus('invoice-id', 'completed')
      ).rejects.toThrow('Cannot complete invoice: missing required items or invalid data');
    });
  });
});