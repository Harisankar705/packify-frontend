import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { packageService } from '@/services/api';
import { TravelPackage } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format, addDays, isBefore, isAfter } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

// Get today's date at the start of the day for consistent comparison
const today = new Date();
today.setHours(0, 0, 0, 0);

const packageFormSchema = z.object({
  from: z.string().min(2, { message: 'From location must be at least 2 characters' }).trim(),
  to: z.string().min(2, { message: 'To location must be at least 2 characters' }).trim(),
  startDate: z.date({ required_error: 'Start date is required' })
    .refine((date) => isAfter(date, today) || date.getTime() === today.getTime(), {
      message: 'Start date must be today or a future date',
    }),
  endDate: z.date({ required_error: 'End date is required' }),
  basePrice: z.coerce.number()
    .positive({ message: 'Base price must be positive' })
    .min(1, { message: 'Base price must be at least 1' }),
  services: z.object({
    food: z.boolean().default(false),
    accommodation: z.boolean().default(false),
  }),
}).refine((data) => isAfter(data.endDate, data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'], // This shows the error on the endDate field
});

type PackageFormValues = z.infer<typeof packageFormSchema>;

const PackageForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(id ? true : false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!id;

  const form = useForm<PackageFormValues>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: {
      from: '',
      to: '',
      basePrice: undefined, // Changed from 0 to undefined for better validation UX
      services: {
        food: false,
        accommodation: false,
      },
    },
    mode: 'onBlur', // Validate on blur for better user experience
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchPackage = async () => {
        try {
          const response = await packageService.getPackageById(id);
          const packageData = response.data;
          
          form.reset({
            from: packageData.from,
            to: packageData.to,
            startDate: new Date(packageData.startDate),
            endDate: new Date(packageData.endDate),
            basePrice: packageData.basePrice,
            services: {
              food: packageData.services.food,
              accommodation: packageData.services.accommodation,
            },
          });
        } catch (error) {
          console.error('Error fetching package:', error);
          toast({
            title: 'Error',
            description: 'Failed to load package details',
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      };

      fetchPackage();
    }
  }, [id, isEditMode, form, toast]);

  const onSubmit = async (data: PackageFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (isEditMode) {
        await packageService.updatePackage(id, data);
        toast({
          title: 'Success',
          description: 'Package updated successfully',
        });
      } else {
        await packageService.createPackage(data);
        toast({
          title: 'Success',
          description: 'Package created successfully',
        });
      }
      
      navigate('/admin/packages');
    } catch (error) {
      console.error('Error submitting package:', error);
      toast({
        title: 'Error',
        description: isEditMode
          ? 'Failed to update package'
          : 'Failed to create package',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Show end date error if both dates are selected but end date is before or equal to start date
  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");
  const hasDateError = startDate && endDate && !isAfter(endDate, startDate);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Package' : 'Add New Package'}</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Package Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Locations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="from"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Origin city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="to"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Destination city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date <span className="text-red-500">*</span></FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => isBefore(date, today)}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Must be today or a future date
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date <span className="text-red-500">*</span></FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                                hasDateError && "border-red-500"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => {
                              // Disable dates before today
                              if (isBefore(date, today)) return true;
                              
                              // If start date is selected, disable dates before or equal to start date
                              const startDate = form.getValues("startDate");
                              if (startDate) {
                                return isBefore(date, addDays(startDate, 1));
                              }
                              
                              return false;
                            }}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Must be after the start date
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Price */}
              <FormField
                control={form.control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Price (USD) <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        step="0.01" 
                        {...field} 
                        onChange={(e) => {
                          // Only accept numbers and convert empty string to undefined
                          const value = e.target.value;
                          field.onChange(value === "" ? undefined : parseFloat(value));
                        }}
                        value={field.value === undefined ? "" : field.value}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the base price for the package in USD (minimum 1.00)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Services */}
              <div className="space-y-4">
                <FormLabel>Available Services</FormLabel>
                
                <FormField
                  control={form.control}
                  name="services.food"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Food</FormLabel>
                        <FormDescription>
                          Include food service option
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="services.accommodation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Accommodation</FormLabel>
                        <FormDescription>
                          Include accommodation option
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              <CardFooter className="flex justify-between px-0">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/admin/packages')} 
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : isEditMode ? 'Update Package' : 'Create Package'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PackageForm;