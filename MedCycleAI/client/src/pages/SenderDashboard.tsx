import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { NavigationHeader } from '@/components/NavigationHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { medicineService } from '@/services/medicine';
import { Pill, Clock, CheckCircle, DollarSign, Plus, List, Camera, Upload } from 'lucide-react';

const medicineSchema = z.object({
  name: z.string().min(1, 'Medicine name is required'),
  company: z.string().min(1, 'Company name is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  batchNumber: z.string().min(1, 'Batch number is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  costPerUnit: z.number().min(0.01, 'Cost per unit must be greater than 0'),
  isSealed: z.boolean().default(true),
});

type MedicineForm = z.infer<typeof medicineSchema>;

export default function SenderDashboard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<MedicineForm>({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      name: '',
      company: '',
      expiryDate: '',
      batchNumber: '',
      quantity: 1,
      costPerUnit: 0,
      isSealed: true,
    },
  });

  const { data: medicines = [], isLoading: medicinesLoading } = useQuery({
    queryKey: ['/api/medicines/my-medicines'],
  });

  const createMedicineMutation = useMutation({
    mutationFn: (data: { formData: MedicineForm; file?: File }) =>
      medicineService.createMedicine(data.formData, data.file),
    onSuccess: (data) => {
      toast({
        title: data.medicine.isApproved ? 'Medicine Approved' : 'Medicine Submitted',
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/medicines/my-medicines'] });
      form.reset();
      setSelectedFile(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Submit Medicine',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: MedicineForm) => {
    createMedicineMutation.mutate({
      formData: data,
      file: selectedFile || undefined,
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Please select an image smaller than 5MB',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  // Calculate stats
  const stats = {
    totalListed: medicines.length,
    pendingApproval: medicines.filter((m: any) => !m.isApproved).length,
    sold: 0, // This would be calculated from orders
    revenue: 0, // This would be calculated from orders
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sender Dashboard</h1>
          <p className="text-gray-600">Manage your medicine listings and track sent medicines</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-full p-3">
                  <Pill className="text-blue-600 w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Listed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalListed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-yellow-100 rounded-full p-3">
                  <Clock className="text-yellow-600 w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingApproval}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-green-100 rounded-full p-3">
                  <CheckCircle className="text-green-600 w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sold</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.sold}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 rounded-full p-3">
                  <DollarSign className="text-purple-600 w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₹{stats.revenue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="send" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="send" className="flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Send Medicine
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center">
              <List className="w-4 h-4 mr-2" />
              My Sent Medicines
            </TabsTrigger>
          </TabsList>

          <TabsContent value="send">
            <Card>
              <CardHeader>
                <CardTitle>List New Medicine</CardTitle>
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter company name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="expiryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiry Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="batchNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Batch Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter batch number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter quantity"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="costPerUnit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cost per Unit (₹)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Enter cost per unit"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* File Upload */}
                    <div>
                      <FormLabel>Medicine Package Photo</FormLabel>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-600 transition-colors">
                        <Camera className="text-gray-400 w-12 h-12 mx-auto mb-2" />
                        <p className="text-gray-600 mb-2">Upload medicine package image for AI verification</p>
                        {selectedFile ? (
                          <p className="text-sm text-green-600 mb-2">Selected: {selectedFile.name}</p>
                        ) : null}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="medicine-image"
                        />
                        <label htmlFor="medicine-image">
                          <Button type="button" className="bg-blue-600 hover:bg-blue-700" asChild>
                            <span>
                              <Upload className="w-4 h-4 mr-2" />
                              Select Image
                            </span>
                          </Button>
                        </label>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="isSealed"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I confirm that the medicine package is sealed and safe
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={createMedicineMutation.isPending}
                    >
                      {createMedicineMutation.isPending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Submit for AI Verification
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>My Listed Medicines</CardTitle>
              </CardHeader>
              <CardContent>
                {medicinesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
                  </div>
                ) : medicines.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No medicines listed yet. Start by adding your first medicine above.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Medicine</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Expiry</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {medicines.map((medicine: any) => (
                          <TableRow key={medicine.id}>
                            <TableCell className="font-medium">{medicine.name}</TableCell>
                            <TableCell>{medicine.company}</TableCell>
                            <TableCell>
                              {new Date(medicine.expiryDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{medicine.quantity}</TableCell>
                            <TableCell>₹{medicine.costPerUnit}</TableCell>
                            <TableCell>
                              <Badge
                                variant={medicine.isApproved ? "default" : "secondary"}
                                className={
                                  medicine.isApproved
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }
                              >
                                {medicine.isApproved ? "Approved" : "Pending"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
