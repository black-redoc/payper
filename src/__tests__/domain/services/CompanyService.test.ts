import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CompanyService } from '@/domain/services/CompanyService';
import { CompanyRepository } from '@/domain/repositories/CompanyRepository';
import { CompanyEntity } from '@/domain/entities/Company';

describe('CompanyService', () => {
  let companyService: CompanyService;
  let mockCompanyRepository: CompanyRepository;

  beforeEach(() => {
    mockCompanyRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    };

    companyService = new CompanyService(mockCompanyRepository);
  });

  describe('getCompany', () => {
    it('should return company when it exists', async () => {
      const mockCompany = CompanyEntity.create({ name: 'Test Company' });
      vi.mocked(mockCompanyRepository.findFirst).mockResolvedValue(mockCompany);

      const result = await companyService.getCompany();

      expect(result).toBe(mockCompany);
      expect(mockCompanyRepository.findFirst).toHaveBeenCalled();
    });

    it('should return null when no company exists', async () => {
      vi.mocked(mockCompanyRepository.findFirst).mockResolvedValue(null);

      const result = await companyService.getCompany();

      expect(result).toBeNull();
    });
  });

  describe('createCompany', () => {
    it('should create company successfully', async () => {
      const companyData = {
        name: 'Test Company',
        address: '123 Test St',
        email: 'test@company.com'
      };

      const mockCompany = CompanyEntity.create(companyData);
      vi.mocked(mockCompanyRepository.save).mockResolvedValue(mockCompany);

      const result = await companyService.createCompany(companyData);

      expect(mockCompanyRepository.save).toHaveBeenCalled();
      expect(result.name).toBe('Test Company');
    });
  });

  describe('updateTipSettings', () => {
    it('should update tip settings successfully', async () => {
      const mockCompany = CompanyEntity.create({
        name: 'Test Company',
        tipPercentage: 10,
        tipEnabled: true
      });

      vi.mocked(mockCompanyRepository.findById).mockResolvedValue(mockCompany);
      vi.mocked(mockCompanyRepository.update).mockResolvedValue(mockCompany);

      const result = await companyService.updateTipSettings('company-id', 15, false);

      expect(mockCompanyRepository.findById).toHaveBeenCalledWith('company-id');
      expect(mockCompanyRepository.update).toHaveBeenCalled();
      expect(result.tipPercentage).toBe(15);
      expect(result.tipEnabled).toBe(false);
    });

    it('should throw error when company not found', async () => {
      vi.mocked(mockCompanyRepository.findById).mockResolvedValue(null);

      await expect(
        companyService.updateTipSettings('invalid-id', 15, false)
      ).rejects.toThrow('Company not found');
    });
  });

  describe('hasCompanyData', () => {
    it('should return true when company exists and is complete', async () => {
      const mockCompany = CompanyEntity.create({ name: 'Test Company' });
      vi.mocked(mockCompanyRepository.findFirst).mockResolvedValue(mockCompany);

      const result = await companyService.hasCompanyData();

      expect(result).toBe(true);
    });

    it('should return false when no company exists', async () => {
      vi.mocked(mockCompanyRepository.findFirst).mockResolvedValue(null);

      const result = await companyService.hasCompanyData();

      expect(result).toBe(false);
    });
  });
});