import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { GET, POST, PUT } from '@/app/api/company/route';

// Create a proper D1Database mock with all required methods
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createMockD1Statement = (result: any) => {
  return {
    bind: vi.fn().mockReturnThis(),
    all: vi.fn().mockResolvedValue({ results: result ? [result] : [] }),
    first: vi.fn().mockResolvedValue(result),
    run: vi.fn().mockResolvedValue({ success: true }),
    raw: vi.fn().mockResolvedValue(result ? [Object.values(result)] : []),
  };
};

const mockD1Database = {
  prepare: vi.fn(() => createMockD1Statement(null)),
  exec: vi.fn().mockResolvedValue({ count: 0, duration: 0 }),
  dump: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
  batch: vi.fn().mockResolvedValue([]),
};

const mockCloudflareEnv = {
  DB: mockD1Database,
};

// Mock @opennextjs/cloudflare module
vi.mock('@opennextjs/cloudflare', () => ({
  getCloudflareContext: () => ({
    env: mockCloudflareEnv,
    cf: {},
    ctx: {
      waitUntil: vi.fn(),
      passThroughOnException: vi.fn(),
    },
  }),
  initOpenNextCloudflareForDev: vi.fn(),
}));

describe('Company API Integration Tests', () => {
  beforeAll(() => {
    // Set up environment for tests
    process.env.NODE_ENV = 'test';
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/company', () => {
    it('should return null when no company exists', async () => {
      // Mock D1 to return no company
      const mockStatement = createMockD1Statement(null);
      mockD1Database.prepare.mockReturnValueOnce(mockStatement);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        data: null,
      });
    });

    it('should return company data when it exists', async () => {
      const mockCompany = {
        id: 'test-company-id',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        name: 'Test Company',
        address: '123 Test St',
        phone: '555-0100',
        email: 'test@company.com',
        website: 'https://test.com',
        taxId: '123456789',
        logo: null,
        tipPercentage: 10,
        tipEnabled: true,
      };

      const mockStatement = createMockD1Statement(mockCompany);
      mockD1Database.prepare.mockReturnValue(mockStatement);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data?.name).toBe('Test Company');
    });

    it('should handle database errors gracefully', async () => {
      const mockStatement = {
        bind: vi.fn().mockReturnThis(),
        all: vi.fn().mockRejectedValue(new Error('Database connection failed')),
        first: vi
          .fn()
          .mockRejectedValue(new Error('Database connection failed')),
        run: vi.fn().mockRejectedValue(new Error('Database connection failed')),
        raw: vi.fn().mockRejectedValue(new Error('Database connection failed')),
      };
      mockD1Database.prepare.mockReturnValueOnce(mockStatement);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  describe('POST /api/company', () => {
    it('should create a new company', async () => {
      const newCompanyData = {
        name: 'New Test Company',
        address: '456 New St',
        phone: '555-0200',
        email: 'new@company.com',
        website: 'https://newcompany.com',
        taxId: '987654321',
        tipPercentage: 15,
        tipEnabled: true,
      };

      const mockCreatedCompany = {
        id: 'new-company-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...newCompanyData,
        logo: null,
      };

      const mockStatement = createMockD1Statement(mockCreatedCompany);
      mockD1Database.prepare.mockReturnValue(mockStatement);

      const request = new Request('http://localhost:3000/api/company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCompanyData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data?.name).toBe('New Test Company');
    });

    it('should handle creation errors', async () => {
      const newCompanyData = {
        name: 'Test Company',
      };

      const mockStatement = {
        bind: vi.fn().mockReturnThis(),
        all: vi.fn().mockRejectedValue(new Error('Failed to create company')),
        first: vi.fn().mockRejectedValue(new Error('Failed to create company')),
        run: vi.fn().mockRejectedValue(new Error('Failed to create company')),
        raw: vi.fn().mockRejectedValue(new Error('Failed to create company')),
      };
      mockD1Database.prepare.mockReturnValue(mockStatement);

      const request = new Request('http://localhost:3000/api/company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCompanyData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  describe('PUT /api/company', () => {
    it('should update an existing company', async () => {
      const updateData = {
        id: 'existing-company-id',
        name: 'Updated Company Name',
        address: '789 Updated St',
        phone: '555-0300',
        email: 'updated@company.com',
        website: 'https://updated.com',
        taxId: '111222333',
        tipPercentage: 20,
        tipEnabled: false,
      };

      const mockUpdatedCompany = {
        ...updateData,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        logo: null,
      };

      const mockStatement = createMockD1Statement(mockUpdatedCompany);
      mockD1Database.prepare.mockReturnValue(mockStatement);

      const request = new Request('http://localhost:3000/api/company', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data?.name).toBe('Updated Company Name');
    });

    it('should return error when id is missing', async () => {
      const updateData = {
        name: 'Test Company',
      };

      const request = new Request('http://localhost:3000/api/company', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Company ID is required');
    });

    it('should handle update errors', async () => {
      const updateData = {
        id: 'existing-company-id',
        name: 'Test Company',
      };

      const mockStatement = {
        bind: vi.fn().mockReturnThis(),
        all: vi.fn().mockRejectedValue(new Error('Failed to update company')),
        first: vi.fn().mockRejectedValue(new Error('Failed to update company')),
        run: vi.fn().mockRejectedValue(new Error('Failed to update company')),
        raw: vi.fn().mockRejectedValue(new Error('Failed to update company')),
      };
      mockD1Database.prepare.mockReturnValue(mockStatement);

      const request = new Request('http://localhost:3000/api/company', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  describe('Cloudflare Context Integration', () => {
    it('should successfully access D1 database through Prisma adapter', async () => {
      // This test specifically validates that getCloudflareContext() is working
      const mockStatement = createMockD1Statement(null);
      mockD1Database.prepare.mockReturnValue(mockStatement);

      const response = await GET();
      const data = await response.json();

      // If this passes, it means getCloudflareContext() was successfully called
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
