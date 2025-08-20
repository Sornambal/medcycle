import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';

interface MedicineCardProps {
  medicine: {
    id: string;
    name: string;
    company: string;
    expiryDate: string;
    quantity: number;
    costPerUnit: string;
    senderName: string;
    distance?: number;
  };
  onAddToCart: (medicineId: string, quantity: number) => void;
}

export function MedicineCard({ medicine, onAddToCart }: MedicineCardProps) {
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      year: 'numeric'
    });
  };

  const handleAddToCart = () => {
    onAddToCart(medicine.id, selectedQuantity);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="font-semibold text-gray-900">{medicine.name}</h4>
            <p className="text-sm text-gray-600">{medicine.company}</p>
          </div>
          <Badge className="bg-green-100 text-green-800">Available</Badge>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Expiry:</span>
            <span>{formatDate(medicine.expiryDate)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Quantity:</span>
            <span>{medicine.quantity} units</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Price:</span>
            <span className="font-semibold text-green-600">₹{medicine.costPerUnit}/unit</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Provider:</span>
            <span>{medicine.senderName}</span>
          </div>
          {medicine.distance && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Distance:</span>
              <span>{medicine.distance} km</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 mb-4">
          <label className="text-sm text-gray-600">Quantity:</label>
          <Input
            type="number"
            min="1"
            max={medicine.quantity}
            value={selectedQuantity}
            onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)}
            className="w-20 text-sm"
          />
        </div>
        
        <Button
          onClick={handleAddToCart}
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={selectedQuantity < 1 || selectedQuantity > medicine.quantity}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
}
