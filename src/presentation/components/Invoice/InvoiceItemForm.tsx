'use client';

import React, { useState } from 'react';
import { InvoiceItemEntity } from '@/domain/entities/InvoiceItem';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface InvoiceItemFormProps {
  items: InvoiceItemEntity[];
  onItemsChange: (items: InvoiceItemEntity[]) => void;
}

interface ItemFormData {
  description: string;
  quantity: number;
  unitPrice: number;
}

export function InvoiceItemForm({ items, onItemsChange }: InvoiceItemFormProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<ItemFormData>({
    description: '',
    quantity: 1,
    unitPrice: 0
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'unitPrice'
        ? parseFloat(value) || 0
        : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim() || formData.quantity <= 0 || formData.unitPrice < 0) {
      return;
    }

    const newItem = InvoiceItemEntity.create({
      description: formData.description.trim(),
      quantity: formData.quantity,
      unitPrice: { amount: formData.unitPrice, currency: 'COP' }
    });

    onItemsChange([...items, newItem]);

    setFormData({
      description: '',
      quantity: 1,
      unitPrice: 0
    });
    setIsAdding(false);
  };

  const handleRemoveItem = (itemId: string) => {
    onItemsChange(items.filter(item => item.id !== itemId));
  };

  const handleUpdateItem = (itemId: string, field: string, value: string | number) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        const updatedItem = new InvoiceItemEntity(
          item.id,
          item.createdAt,
          item.updatedAt,
          item.description,
          item.quantity,
          item.unitPrice,
          item.total
        );
        if (field === 'description') {
          updatedItem.updateDescription(value as string);
        } else if (field === 'quantity') {
          updatedItem.updateQuantity(value as number);
        } else if (field === 'unitPrice') {
          updatedItem.updateUnitPrice({ amount: value as number, currency: 'COP' });
        }
        return updatedItem;
      }
      return item;
    });
    onItemsChange(updatedItems);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total.amount, 0);
  };

  return (
    <Card title="Items de la Factura">
      {items.length > 0 && (
        <div className="space-y-3 mb-6">
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="md:col-span-2">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Descripción"
                />
              </div>
              <div>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 1)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitPrice.amount}
                  onChange={(e) => handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium">{formatCurrency(item.total.amount)}</span>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}

          <div className="border-t pt-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Subtotal:</span>
              <span className="font-bold text-lg">{formatCurrency(calculateTotal())}</span>
            </div>
          </div>
        </div>
      )}

      {!isAdding ? (
        <Button
          onClick={() => setIsAdding(true)}
          variant="secondary"
          className="w-full"
        >
          + Agregar Item
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Descripción"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descripción del servicio o producto"
                required
              />
            </div>
            <div>
              <Input
                label="Cantidad"
                name="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Input
                label="Precio Unitario"
                name="unitPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.unitPrice}
                onChange={handleInputChange}
                placeholder="0.00"
                required
              />
            </div>
            <div className="flex items-end">
              <span className="text-sm font-medium pb-2">
                Total: {formatCurrency(formData.quantity * formData.unitPrice)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setFormData({ description: '', quantity: 1, unitPrice: 0 });
              }}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button type="submit">
              Agregar Item
            </Button>
          </div>
        </form>
      )}

      {items.length === 0 && !isAdding && (
        <div className="text-center py-8 text-gray-500">
          <p>No hay items agregados a la factura</p>
          <p className="text-sm">Agrega al menos un item para continuar</p>
        </div>
      )}
    </Card>
  );
}