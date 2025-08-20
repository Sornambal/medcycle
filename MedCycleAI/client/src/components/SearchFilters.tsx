import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const searchSchema = z.object({
  name: z.string().optional(),
  pinCode: z.string().optional(),
  minExpiryMonths: z.number().min(0).optional(),
  dosage: z.string().optional(),
  minQuantity: z.number().min(0).optional(),
  maxCost: z.number().min(0).optional(),
});

type SearchForm = z.infer<typeof searchSchema>;

interface SearchFiltersProps {
  onSearch: (filters: SearchForm) => void;
  isLoading?: boolean;
}

export function SearchFilters({ onSearch, isLoading }: SearchFiltersProps) {
  const form = useForm<SearchForm>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      name: '',
      pinCode: '',
      minExpiryMonths: undefined,
      dosage: '',
      minQuantity: undefined,
      maxCost: undefined,
    },
  });

  const onSubmit = (data: SearchForm) => {
    // Filter out empty values
    const filters = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== '' && value !== undefined && value !== null) {
        acc[key as keyof SearchForm] = value;
      }
      return acc;
    }, {} as SearchForm);
    
    onSearch(filters);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Available Medicines</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medicine Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter medicine name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pinCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PIN Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your PIN code" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Advanced Filters */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Advanced Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="minExpiryMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Expiry (Months)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="3"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dosage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dosage</FormLabel>
                      <FormControl>
                        <Input placeholder="500mg" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="10"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Cost (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="100"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Search Medicines
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
