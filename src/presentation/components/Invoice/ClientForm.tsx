'use client';

import React, { useState } from 'react';
import { ClientEntity } from '@/domain/entities/Client';
import { IdentificationType } from '@/shared/types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface ClientFormProps {
  client?: ClientEntity;
  onClientChange: (client: ClientEntity | undefined) => void;
}

export function ClientForm({ client, onClientChange }: ClientFormProps) {
  const [isFormVisible, setIsFormVisible] = useState(!!client);
  const [formData, setFormData] = useState({
    firstName: client?.firstName || '',
    lastName: client?.lastName || '',
    email: client?.email || '',
    identificationType: client?.identificationType || 'cedula' as IdentificationType,
    identificationNumber: client?.identificationNumber || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName && !formData.lastName && !formData.identificationNumber) {
      onClientChange(undefined);
      setIsFormVisible(false);
      return;
    }

    const clientData = ClientEntity.create(formData);
    onClientChange(clientData);
  };

  const handleClearClient = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      identificationType: 'cedula',
      identificationNumber: ''
    });
    onClientChange(undefined);
    setIsFormVisible(false);
  };

  const identificationTypes: { value: IdentificationType; label: string }[] = [
    { value: 'cedula', label: 'Cédula de Ciudadanía' },
    { value: 'nit', label: 'NIT' },
    { value: 'passport', label: 'Pasaporte' },
    { value: 'other', label: 'Otro' }
  ];

  return (
    <Card title="Datos del Cliente (Opcional)">
      {!isFormVisible ? (
        <div className="text-center py-4">
          <p className="text-gray-600 mb-4">
            Los datos del cliente son opcionales. Puedes facturar sin especificar un cliente.
          </p>
          <Button
            onClick={() => setIsFormVisible(true)}
            variant="secondary"
          >
            Agregar Datos del Cliente
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombres"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Nombres del cliente"
            />
            <Input
              label="Apellidos"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Apellidos del cliente"
            />
          </div>

          <Input
            label="Correo electrónico"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="correo@ejemplo.com"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="identificationType" className="block text-sm font-medium text-black mb-1">
                Tipo de identificación
              </label>
              <select
                id="identificationType"
                name="identificationType"
                value={formData.identificationType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                {identificationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Número de identificación"
              name="identificationNumber"
              value={formData.identificationNumber}
              onChange={handleInputChange}
              placeholder="Número de identificación"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              type="button"
              onClick={handleClearClient}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Facturar sin Cliente
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto"
            >
              Guardar Cliente
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}