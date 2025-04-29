
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { packageService } from '@/services/api';
import { TravelPackage } from '@/types';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatDate, getPackageStatus } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Plus, Edit, Trash2 } from 'lucide-react';

const ManagePackages = () => {
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<string | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await packageService.getAllPackages();
      setPackages(response.data);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load packages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditPackage = (id: string) => {
    navigate(`/admin/packages/edit/${id}`);
  };

  const handleAddPackage = () => {
    navigate('/admin/packages/add');
  };

  const handleDeleteClick = (id: string) => {
    setPackageToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!packageToDelete) return;
    
    try {
      setIsDeleteLoading(true);
      await packageService.deletePackage(packageToDelete);
      
      // Remove the deleted package from the list
      setPackages((prev) => prev.filter((pkg) => pkg._id !== packageToDelete));
      
      toast({
        title: 'Success',
        description: 'Package deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting package:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete package',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteLoading(false);
      setIsDeleteDialogOpen(false);
      setPackageToDelete(null);
    }
  };

  const statusColors = {
    completed: 'bg-gray-500',
    active: 'bg-green-500',
    upcoming: 'bg-travel-blue',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Travel Packages</h1>
        <Button onClick={handleAddPackage} className="gap-2">
          <Plus className="h-4 w-4" /> Add Package
        </Button>
      </div>
      
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : packages.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((pkg) => {
                const status = getPackageStatus(pkg);
                
                return (
                  <TableRow key={pkg._id}>
                    <TableCell>{pkg.from}</TableCell>
                    <TableCell>{pkg.to}</TableCell>
                    <TableCell>{formatDate(pkg.startDate)}</TableCell>
                    <TableCell>{formatDate(pkg.endDate)}</TableCell>
                    <TableCell>${pkg.basePrice}</TableCell>
                    <TableCell>
                      <Badge
                        className={`${
                          statusColors[status as keyof typeof statusColors]
                        } text-white capitalize`}
                      >
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditPackage(pkg._id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(pkg._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-16 border rounded-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No packages found</h3>
          <p className="text-gray-600 mb-6">Start by creating your first travel package</p>
          <Button onClick={handleAddPackage}>
            <Plus className="mr-2 h-4 w-4" /> Add Package
          </Button>
        </div>
      )}
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the travel package.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleteLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManagePackages;
