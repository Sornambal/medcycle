
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NavigationHeader } from '@/components/NavigationHeader';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/services/admin';
import { Users, Clock, Pill, TrendingUp, UserCheck, ClipboardList, BarChart3, Check, X, AlertTriangle, Search, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get system stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: adminService.getSystemStats,
  });

  // Get pending users
  const { data: pendingUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/pending-users'],
    queryFn: adminService.getPendingUsers,
  });

  // Get pending medicines
  const { data: pendingMedicines = [], isLoading: medicinesLoading } = useQuery({
    queryKey: ['/api/admin/pending-medicines'],
    queryFn: adminService.getPendingMedicines,
  });

  // Get all users
  const { data: allUsers = [], isLoading: allUsersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: adminService.getAllUsers,
  });

  // Get all medicines
  const { data: allMedicines = [], isLoading: allMedicinesLoading } = useQuery({
    queryKey: ['/api/admin/medicines'],
    queryFn: adminService.getAllMedicines,
  });

  // User approval mutations
  const approveUserMutation = useMutation({
    mutationFn: adminService.approveUser,
    onSuccess: () => {
      toast({
        title: 'User Approved',
        description: 'User has been approved successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Approval Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const rejectUserMutation = useMutation({
    mutationFn: adminService.rejectUser,
    onSuccess: () => {
      toast({
        title: 'User Rejected',
        description: 'User has been rejected.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Rejection Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Medicine approval mutations
  const approveMedicineMutation = useMutation({
    mutationFn: adminService.approveMedicine,
    onSuccess: () => {
      toast({
        title: 'Medicine Approved',
        description: 'Medicine has been approved successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-medicines'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Approval Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const rejectMedicineMutation = useMutation({
    mutationFn: adminService.rejectMedicine,
    onSuccess: () => {
      toast({
        title: 'Medicine Rejected',
        description: 'Medicine has been rejected.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-medicines'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Rejection Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleApproveUser = (userId: string) => {
    approveUserMutation.mutate(userId);
  };

  const handleRejectUser = (userId: string) => {
    rejectUserMutation.mutate(userId);
  };

  const handleApproveMedicine = (medicineId: string) => {
    approveMedicineMutation.mutate(medicineId);
  };

  const handleRejectMedicine = (medicineId: string) => {
    rejectMedicineMutation.mutate(medicineId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getUserTypeDisplay = (userType: string) => {
    const types: { [key: string]: string } = {
      hospital: 'Hospital',
      pharmacy: 'Pharmacy',
      medical_shop: 'Medical Shop',
    };
    return types[userType] || userType;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage registrations, medicine approvals, and system oversight</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-full p-3">
                  <Users className="text-blue-600 w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '...' : stats?.totalUsers || 0}
                  </p>
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
                  <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '...' : stats?.pendingApprovals || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-green-100 rounded-full p-3">
                  <Pill className="text-green-600 w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Medicines</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '...' : stats?.totalMedicines || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 rounded-full p-3">
                  <TrendingUp className="text-purple-600 w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '...' : stats?.totalOrders || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="users" className="flex items-center">
              <UserCheck className="w-4 h-4 mr-2" />
              Pending Registrations
              {pendingUsers.length > 0 && (
                <Badge className="bg-red-500 text-white text-xs ml-2">
                  {pendingUsers.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="medicines" className="flex items-center">
              <ClipboardList className="w-4 h-4 mr-2" />
              Pending Medicines
              {pendingMedicines.length > 0 && (
                <Badge className="bg-red-500 text-white text-xs ml-2">
                  {pendingMedicines.length}
                </Badge>
              )}
            </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            System Overview
          </TabsTrigger>
          <TabsTrigger value="all-users" className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            All Users
          </TabsTrigger>
          <TabsTrigger value="all-medicines" className="flex items-center">
            <Pill className="w-4 h-4 mr-2" />
            All Medicines
          </TabsTrigger>
        </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Pending User Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
                  </div>
                ) : pendingUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No pending user registrations.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Organization</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Gov ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingUsers.map((user: any) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.organizationName}</TableCell>
                            <TableCell>{getUserTypeDisplay(user.userType)}</TableCell>
                            <TableCell>{user.ownerName}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{user.email}</div>
                                <div className="text-gray-500">{user.mobile}</div>
                              </div>
                            </TableCell>
                            <TableCell>{user.govIdNumber}</TableCell>
                            <TableCell>{formatDate(user.createdAt)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveUser(user.id)}
                                  disabled={approveUserMutation.isPending}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejectUser(user.id)}
                                  disabled={rejectUserMutation.isPending}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
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

          <TabsContent value="medicines">
            <Card>
              <CardHeader>
                <CardTitle>Pending Medicine Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                {medicinesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
                  </div>
                ) : pendingMedicines.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No pending medicine approvals.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {pendingMedicines.map((medicine: any) => (
                      <Card key={medicine.id} className="bg-gray-50">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold">{medicine.name}</h3>
                              <p className="text-gray-600">{medicine.company}</p>
                              <p className="text-sm text-gray-500">Listed by: {medicine.senderName}</p>
                            </div>
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Review Required
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600">Expiry Date:</p>
                              <p className="font-medium">{formatDate(medicine.expiryDate)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Quantity:</p>
                              <p className="font-medium">{medicine.quantity} units</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Batch Number:</p>
                              <p className="font-medium">{medicine.batchNumber}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Price per Unit:</p>
                              <p className="font-medium">₹{medicine.costPerUnit}</p>
                            </div>
                          </div>

                          {medicine.imageUrl && (
                            <div className="mb-4">
                              <img
                                src={medicine.imageUrl}
                                alt="Medicine package"
                                className="w-full h-32 object-cover rounded-lg"
                              />
                            </div>
                          )}

                          {medicine.aiVerificationData && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                              <p className="text-sm text-yellow-800">
                                <AlertTriangle className="w-4 h-4 inline mr-2" />
                                AI flagged: Manual review required due to verification concerns.
                              </p>
                            </div>
                          )}

                          <div className="flex space-x-3">
                            <Button
                              onClick={() => handleApproveMedicine(medicine.id)}
                              disabled={approveMedicineMutation.isPending}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleRejectMedicine(medicine.id)}
                              disabled={rejectMedicineMutation.isPending}
                              variant="destructive"
                              className="flex-1"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">AI Verification System</span>
                      <Badge className="bg-green-100 text-green-800">
                        <Check className="w-3 h-3 mr-1" />
                        Online
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Payment Gateway</span>
                      <Badge className="bg-green-100 text-green-800">
                        <Check className="w-3 h-3 mr-1" />
                        Online
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">OCR Service</span>
                      <Badge className="bg-green-100 text-green-800">
                        <Check className="w-3 h-3 mr-1" />
                        Online
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Database</span>
                      <Badge className="bg-green-100 text-green-800">
                        <Check className="w-3 h-3 mr-1" />
                        Online
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Platform Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Platform Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Verification Success Rate</span>
                      <span className="font-semibold">94.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Order Value</span>
                      <span className="font-semibold">₹125.50</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Waste Reduction</span>
                      <span className="font-semibold">2.3 Tons</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Partnerships</span>
                      <span className="font-semibold">{stats?.totalUsers || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="all-users">
            <Card>
              <CardHeader>
                <CardTitle>All Users Details</CardTitle>
              </CardHeader>
              <CardContent>
                {allUsersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
                  </div>
                ) : allUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No users found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Organization</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Gov ID</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allUsers.map((user: any) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.organizationName}</TableCell>
                            <TableCell>{getUserTypeDisplay(user.userType)}</TableCell>
                            <TableCell>{user.ownerName}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{user.email}</div>
                                <div className="text-gray-500">{user.mobile}</div>
                              </div>
                            </TableCell>
                            <TableCell>{user.govIdNumber}</TableCell>
                            <TableCell>
                              <Badge className={
                                user.isVerified ? 'bg-green-100 text-green-800' :
                                user.role === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {user.isVerified ? 'Verified' : user.role === 'pending' ? 'Pending' : 'Rejected'}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(user.createdAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all-medicines">
            <Card>
              <CardHeader>
                <CardTitle>All Medicines Details</CardTitle>
              </CardHeader>
              <CardContent>
                {allMedicinesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
                  </div>
                ) : allMedicines.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No medicines found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Medicine</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Batch</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Expiry</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Listed By</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allMedicines.map((medicine: any) => (
                          <TableRow key={medicine.id}>
                            <TableCell className="font-medium">{medicine.name}</TableCell>
                            <TableCell>{medicine.company}</TableCell>
                            <TableCell>{medicine.batchNumber}</TableCell>
                            <TableCell>{medicine.quantity}</TableCell>
                            <TableCell>₹{medicine.costPerUnit}</TableCell>
                            <TableCell>{formatDate(medicine.expiryDate)}</TableCell>
                            <TableCell>
                              <Badge className={
                                medicine.isApproved ? 'bg-green-100 text-green-800' :
                                'bg-yellow-100 text-yellow-800'
                              }>
                                {medicine.isApproved ? 'Approved' : 'Pending'}
                              </Badge>
                            </TableCell>
                            <TableCell>{medicine.senderName || 'Unknown'}</TableCell>
                            <TableCell>{formatDate(medicine.createdAt)}</TableCell>
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
