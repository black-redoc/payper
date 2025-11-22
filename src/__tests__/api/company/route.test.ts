/* eslint-disable @typescript-eslint/no-explicit-any */
import { GET, POST, PUT } from '@/app/api/company/route';
import { companyService } from '@/infrastructure/di/container';
import { CompanyEntity } from '@/domain/entities/Company';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the company service
vi.mock('@/infrastructure/di/container', () => ({
  companyService: {
    getCompany: vi.fn(),
    createCompany: vi.fn(),
    updateCompany: vi.fn(),
  },
}));

describe('/api/company', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/company', () => {
    it('should return company data when it exists', async () => {
      const mockCompany = new CompanyEntity(
        '1',
        new Date('2025-01-01'),
        new Date('2025-01-01'),
        'Test Company',
        10,
        true,
        '123 Test St',
        '555-0000',
        'test@company.com',
        'https://test.com',
        'TAX123',
        null
      );

      (companyService.getCompany as any).mockResolvedValue(mockCompany);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        data: {
          id: '1',
          name: 'Test Company',
          address: '123 Test St',
          phone: '555-0000',
          email: 'test@company.com',
          website: 'https://test.com',
          taxId: 'TAX123',
          logo: null,
          tipPercentage: 10,
          tipEnabled: true,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      });
    });

    it('should return null data when company does not exist', async () => {
      (companyService.getCompany as any).mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        data: null,
      });
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error');
      (companyService.getCompany as any).mockRejectedValue(error);

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: 'Database error',
      });

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching company:', error);
      consoleSpy.mockRestore();
    });
  });

  describe('POST /api/company', () => {
    it('should create a new company with all fields', async () => {
      const mockCompany = new CompanyEntity(
        '1',
        new Date('2025-01-01'),
        new Date('2025-01-01'),
        'New Company',
        15,
        false,
        '456 New St',
        '555-1111',
        'new@company.com',
        'https://new.com',
        'TAX456',
        'logo.png'
      );

      (companyService.createCompany as any).mockResolvedValue(mockCompany);

      const request = new Request('http://localhost:3000/api/company', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Company',
          address: '456 New St',
          phone: '555-1111',
          email: 'new@company.com',
          website: 'https://new.com',
          taxId: 'TAX456',
          tipPercentage: 15,
          tipEnabled: false,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('New Company');
      expect(data.data.tipPercentage).toBe(15);
      expect(data.data.tipEnabled).toBe(false);
    });

    it('should create company with default tip settings', async () => {
      const mockCompany = new CompanyEntity(
        '1',
        new Date('2025-01-01'),
        new Date('2025-01-01'),
        'Default Tip Company',
        10,
        true
      );

      (companyService.createCompany as any).mockResolvedValue(mockCompany);

      const request = new Request('http://localhost:3000/api/company', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Default Tip Company',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.tipPercentage).toBe(10);
      expect(data.data.tipEnabled).toBe(true);

      expect(companyService.createCompany).toHaveBeenCalledWith({
        name: 'Default Tip Company',
        address: undefined,
        phone: undefined,
        email: undefined,
        website: undefined,
        taxId: undefined,
        tipPercentage: 10,
        tipEnabled: true,
      });
    });

    it('should handle creation errors', async () => {
      const error = new Error('Creation failed');
      (companyService.createCompany as any).mockRejectedValue(error);

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const request = new Request('http://localhost:3000/api/company', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Company',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: 'Creation failed',
      });

      expect(consoleSpy).toHaveBeenCalledWith('Error creating company:', error);
      consoleSpy.mockRestore();
    });
  });

  describe('PUT /api/company', () => {
    it('should update company data', async () => {
      const mockCompany = new CompanyEntity(
        '1',
        new Date('2025-01-01'),
        new Date('2025-01-02'),
        'Updated Company',
        20,
        false,
        'Updated Address',
        '555-9999',
        'updated@company.com'
      );

      (companyService.updateCompany as any).mockResolvedValue(mockCompany);

      const request = new Request('http://localhost:3000/api/company', {
        method: 'PUT',
        body: JSON.stringify({
          id: '1',
          name: 'Updated Company',
          address: 'Updated Address',
          phone: '555-9999',
          email: 'updated@company.com',
          tipPercentage: 20,
          tipEnabled: false,
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Updated Company');
      expect(data.data.tipPercentage).toBe(20);
      expect(data.data.tipEnabled).toBe(false);
    });

    it('should return error when company ID is missing', async () => {
      const request = new Request('http://localhost:3000/api/company', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Test Company',
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        success: false,
        error: 'Company ID is required',
      });

      expect(companyService.updateCompany).not.toHaveBeenCalled();
    });

    it('should handle update errors', async () => {
      const error = new Error('Update failed');
      (companyService.updateCompany as any).mockRejectedValue(error);

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const request = new Request('http://localhost:3000/api/company', {
        method: 'PUT',
        body: JSON.stringify({
          id: '1',
          name: 'Test Company',
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: 'Update failed',
      });

      expect(consoleSpy).toHaveBeenCalledWith('Error updating company:', error);
      consoleSpy.mockRestore();
    });
  });
});
