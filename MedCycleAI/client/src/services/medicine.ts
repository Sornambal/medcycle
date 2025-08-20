import { apiRequest } from '@/lib/queryClient';

export interface MedicineRequest {
  name: string;
  company: string;
  expiryDate: string;
  batchNumber: string;
  quantity: number;
  costPerUnit: number;
  isSealed: boolean;
}

export interface SearchFilters {
  name?: string;
  pinCode?: string;
  minExpiryMonths?: number;
  dosage?: string;
  minQuantity?: number;
  maxCost?: number;
}

export const medicineService = {
  async createMedicine(data: MedicineRequest, imageFile?: File) {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });
    
    if (imageFile) {
      formData.append('medicineImage', imageFile);
    }

    const response = await fetch('/api/medicines', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${response.status}: ${errorText}`);
    }

    return await response.json();
  },

  async searchMedicines(filters: SearchFilters) {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await apiRequest('GET', `/api/medicines/search?${params.toString()}`);
    return await response.json();
  },

  async getMyMedicines() {
    const response = await apiRequest('GET', '/api/medicines/my-medicines');
    return await response.json();
  }
};
