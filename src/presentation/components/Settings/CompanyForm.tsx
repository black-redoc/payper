'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface CompanyFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  taxId: string;
  tipPercentage: number;
  tipEnabled: boolean;
}

export function CompanyForm() {
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    taxId: '',
    tipPercentage: 10,
    tipEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    try {
      const response = await fetch('/api/company');
      const result = (await response.json()) as {
        success: boolean;
        data?: {
          id: string;
          name: string;
          address?: string;
          phone?: string;
          email?: string;
          website?: string;
          taxId?: string;
          tipPercentage: number;
          tipEnabled: boolean;
        };
      };

      if (result.success && result.data) {
        const company = result.data;
        setFormData({
          name: company.name || '',
          address: company.address || '',
          phone: company.phone || '',
          email: company.email || '',
          website: company.website || '',
          taxId: company.taxId || '',
          tipPercentage: company.tipPercentage || 10,
          tipEnabled: company.tipEnabled ?? true,
        });
        setCompanyId(company.id);
      }
    } catch (error) {
      console.error('Error loading company data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const method = companyId ? 'PUT' : 'POST';
      const body = companyId ? { id: companyId, ...formData } : formData;

      const response = await fetch('/api/company', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = (await response.json()) as {
        success: boolean;
        data?: { id: string };
        error?: string;
      };

      if (!result.success) {
        throw new Error(result.error || 'Failed to save company');
      }

      if (!companyId && result.data) {
        setCompanyId(result.data.id);
      }

      toast.success('Datos de la empresa guardados exitosamente');
    } catch (error) {
      console.error('Error saving company data:', error);
      toast.error('Error al guardar los datos de la empresa');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'number'
            ? parseFloat(value) || 0
            : value,
    }));
  };

  if (loading) {
    return (
      <Card title="Información de la Empresa">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card title="Información de la Empresa">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-black mb-1"
            >
              Nombre de la empresa *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="taxId"
              className="block text-sm font-medium text-black mb-1"
            >
              NIT / RUT
            </label>
            <input
              type="text"
              id="taxId"
              name="taxId"
              value={formData.taxId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-black mb-1"
            >
              Dirección
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-black mb-1"
            >
              Teléfono
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-black mb-1"
            >
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="website"
              className="block text-sm font-medium text-black mb-1"
            >
              Sitio web
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-black mb-4">
            Configuración de Propina
          </h3>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="tipEnabled"
                name="tipEnabled"
                checked={formData.tipEnabled}
                onChange={handleInputChange}
                className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
              />
              <label
                htmlFor="tipEnabled"
                className="ml-2 block text-sm text-black"
              >
                Habilitar propina en las facturas
              </label>
            </div>

            {formData.tipEnabled && (
              <div>
                <label
                  htmlFor="tipPercentage"
                  className="block text-sm font-medium text-black mb-1"
                >
                  Porcentaje de propina (%)
                </label>
                <input
                  type="number"
                  id="tipPercentage"
                  name="tipPercentage"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.tipPercentage}
                  onChange={handleInputChange}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving || !formData.name.trim()}
            className="w-full sm:w-auto cursor-pointer"
          >
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
