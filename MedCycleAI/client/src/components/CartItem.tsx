import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface CartItemProps {
  item: {
    id: string;
    medicineId: string;
    quantity: number;
    medicineName: string;
    medicineCompany: string;
    medicinePrice: string;
    senderName: string;
  };
  onUpdateQuantity: (cartId: string, quantity: number) => void;
  onRemove: (cartId: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  const total = parseFloat(item.medicinePrice) * quantity;

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{item.medicineName}</h4>
        <p className="text-sm text-gray-600">{item.medicineCompany}</p>
        <p className="text-sm text-gray-600">From: {item.senderName}</p>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="w-8 h-8 p-0"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
          >
            <Minus className="w-4 h-4" />
          </Button>
          
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
            className="w-16 text-center"
          />
          
          <Button
            variant="outline"
            size="sm"
            className="w-8 h-8 p-0"
            onClick={() => handleQuantityChange(quantity + 1)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="text-right">
          <p className="font-semibold">₹{total.toFixed(2)}</p>
          <p className="text-sm text-gray-600">₹{item.medicinePrice}/unit</p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(item.id)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
