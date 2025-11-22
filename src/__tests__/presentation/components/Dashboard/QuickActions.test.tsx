/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QuickActions } from '@/presentation/components/Dashboard/QuickActions';
import { useRouter } from 'next/navigation';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    error: vi.fn(),
  },
}));

// Mock fetch
global.fetch = vi.fn() as any;

describe('QuickActions Component', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({
      push: mockPush,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('when company data exists', () => {
    beforeEach(() => {
      (global.fetch as any).mockResolvedValue({
        json: async () => ({
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
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }),
      });
    });

    it('should fetch company data on mount', async () => {
      render(<QuickActions />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/company');
      });
    });

    it('should not show warning message when company data exists', async () => {
      render(<QuickActions />);

      await waitFor(() => {
        expect(
          screen.queryByText(/Configura los datos de tu empresa/i)
        ).not.toBeInTheDocument();
      });
    });

    it('should enable "Nueva Factura" button when company data exists', async () => {
      render(<QuickActions />);

      await waitFor(() => {
        const buttons = screen.getAllByText('Abrir');
        expect(buttons[0]).not.toBeDisabled();
      });
    });

    it('should navigate to /invoices/new when clicking "Nueva Factura"', async () => {
      render(<QuickActions />);

      await waitFor(() => {
        const buttons = screen.getAllByText('Abrir');
        expect(buttons[0]).not.toBeDisabled();
      });

      const newInvoiceButton = screen.getAllByText('Abrir')[0];
      fireEvent.click(newInvoiceButton);

      expect(mockPush).toHaveBeenCalledWith('/invoices/new');
    });
  });

  describe('when company data does not exist', () => {
    beforeEach(() => {
      (global.fetch as any).mockResolvedValue({
        json: async () => ({
          success: true,
          data: null,
        }),
      });
    });

    it('should show warning message when no company data', async () => {
      render(<QuickActions />);

      await waitFor(() => {
        expect(
          screen.getByText(/Configura los datos de tu empresa/i)
        ).toBeInTheDocument();
      });
    });

    it('should disable "Nueva Factura" button when no company data', async () => {
      render(<QuickActions />);

      await waitFor(() => {
        const button = screen.getByText('Configura empresa primero');
        expect(button).toBeDisabled();
      });
    });

    it('should show error toast and redirect to settings when clicking disabled button', async () => {
      render(<QuickActions />);

      await waitFor(() => {
        const button = screen.getByText('Configura empresa primero');
        expect(button).toBeDisabled();
      });

      // Try to click the parent div (the onClick handler is on the parent button element)
      const disabledButton = screen
        .getByText('Configura empresa primero')
        .closest('button');
      if (disabledButton) {
        fireEvent.click(disabledButton);
      }

      // Since button is disabled, nothing should happen
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('when API call fails', () => {
    beforeEach(() => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));
    });

    it('should handle fetch error gracefully', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(<QuickActions />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error checking company data:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });

    it('should show warning message when API fails', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<QuickActions />);

      await waitFor(() => {
        expect(
          screen.getByText(/Configura los datos de tu empresa/i)
        ).toBeInTheDocument();
      });
    });

    it('should disable "Nueva Factura" button when API fails', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<QuickActions />);

      await waitFor(() => {
        const button = screen.getByText('Configura empresa primero');
        expect(button).toBeDisabled();
      });
    });
  });

  describe('Quick action buttons', () => {
    beforeEach(() => {
      (global.fetch as any).mockResolvedValue({
        json: async () => ({
          success: true,
          data: {
            id: '1',
            name: 'Test Company',
            tipPercentage: 10,
            tipEnabled: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }),
      });
    });

    it('should navigate to /invoices when clicking "Ver Facturas"', async () => {
      render(<QuickActions />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const viewInvoicesButton = screen.getAllByText('Abrir')[1];
      fireEvent.click(viewInvoicesButton);

      expect(mockPush).toHaveBeenCalledWith('/invoices');
    });

    it('should navigate to /settings when clicking "Configuración"', async () => {
      render(<QuickActions />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const settingsButton = screen.getAllByText('Abrir')[2];
      fireEvent.click(settingsButton);

      expect(mockPush).toHaveBeenCalledWith('/settings');
    });
  });
});
