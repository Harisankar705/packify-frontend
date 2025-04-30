
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { packageService, bookingService } from '@/services/api';
import { TravelPackage } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const PackageDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [travelPackage, setTravelPackage] = useState<TravelPackage | null>(null);
  const [existingBooking, setExistingBooking] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [includedServices, setIncludedServices] = useState<{
    food: boolean;
    accommodation: boolean;
  }>({ food: false, accommodation: false });
  const [totalPrice, setTotalPrice] = useState(0);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPackageDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await packageService.getPackageById(id);
        setTravelPackage(response.data);
        
        // Initialize included services based on what's available in the package
        setIncludedServices({
          food: response.data.services.food,
          accommodation: response.data.services.accommodation,
        });
        
        // Set initial total price
        setTotalPrice(response.data.basePrice);
      } catch (error) {
        console.error('Error fetching package details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load package details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPackageDetails();
  }, [id, toast]);

  useEffect(() => {
    if (!travelPackage) return;
    
    let price = travelPackage.basePrice;
    
    if (includedServices.food && travelPackage.services.food) {
      price += travelPackage.basePrice * 0.2;
    }
    
    if (includedServices.accommodation && travelPackage.services.accommodation) {
      price += travelPackage.basePrice * 0.3;
    }
    
    setTotalPrice(price);
  }, [includedServices, travelPackage]);

  useEffect(() => {
    const checkExistingBooking = async () => {
      if (!isAuthenticated || !id) return;
  
      try {
        const response = await bookingService.getUserBookings();
        const userBookings = response.data;
  
        // Check if there is already a booking for the current package by the user
        const alreadyBooked = userBookings.some(
          (booking) => booking.package === id && booking.status === 'pending'
        );
  
        setExistingBooking(alreadyBooked);
      } catch (error) {
        console.error('Error checking existing bookings:', error);
        toast({
          title: 'Error',
          description: 'Failed to check existing bookings',
          variant: 'destructive',
        });
      }
    };
  
    checkExistingBooking();
  }, [id, isAuthenticated, toast]);
  
  const handleServiceChange = (service: 'food' | 'accommodation') => {
    setIncludedServices((prev) => ({
      ...prev,
      [service]: !prev[service],
    }));
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to book this package',
      });
      navigate('/login');
      return;
    }
    
    setIsBookingDialogOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!travelPackage || !isAuthenticated) return;
    
    try {
      setIsBookingLoading(true);
      
      await bookingService.createBooking({
        package: travelPackage._id,
        services: includedServices,
        totalPrice,
      });
      
      toast({
        title: 'Booking Successful',
        description: 'Your package has been booked successfully',
      });
      
      setIsBookingDialogOpen(false);
      navigate('/bookings');
    } catch (error) {
      console.error('Error booking package:', error);
      toast({
        title: 'Booking Failed',
        description: 'There was an error booking this package',
        variant: 'destructive',
      });
    } finally {
      setIsBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );
  }

  if (!travelPackage) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Package Not Found</h2>
            <p className="mt-2 text-gray-600">The package you're looking for does not exist.</p>
            <Button asChild className="mt-4">
              <a href="/packages">Browse Packages</a>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="bg-gray-50 flex-grow">
        {/* Hero Image */}
        <div className="relative h-96">
          <img
            src={`https://source.unsplash.com/featured/?${travelPackage.to.replace(' ', '')},travel`}
            alt={travelPackage.to}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <h1 className="text-white text-4xl md:text-5xl font-bold">
                {travelPackage.from} to {travelPackage.to}
              </h1>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Package Details Column */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Package Details</h2>
                
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between pb-4 border-b">
                    <div>
                      <div className="text-sm text-gray-500">From</div>
                      <div className="font-medium">{travelPackage.from}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">To</div>
                      <div className="font-medium">{travelPackage.to}</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between pb-4 border-b">
                    <div>
                      <div className="text-sm text-gray-500">Start Date</div>
                      <div className="font-medium">{formatDate(travelPackage.startDate)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">End Date</div>
                      <div className="font-medium">{formatDate(travelPackage.endDate)}</div>
                    </div>
                  </div>
                  
                  <div className="pb-4 border-b">
                    <div className="text-sm text-gray-500 mb-2">Available Services</div>
                    <div className="flex flex-wrap gap-2">
                      {travelPackage.services.food && (
                        <Badge variant="outline">Food</Badge>
                      )}
                      {travelPackage.services.accommodation && (
                        <Badge variant="outline">Accommodation</Badge>
                      )}
                      {!travelPackage.services.food && !travelPackage.services.accommodation && (
                        <span className="text-gray-500">No additional services available</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-2">Description</div>
                    <p className="text-gray-700">
                      Experience the amazing journey from {travelPackage.from} to {travelPackage.to}. 
                      This package offers a perfect getaway for travelers looking to explore new destinations.
                      Enjoy the beautiful scenery, local cuisine, and cultural attractions.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Customize Your Package</h2>
                <div className="space-y-4">
                  {travelPackage.services.food && (
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="food" 
                        checked={includedServices.food} 
                        onCheckedChange={() => handleServiceChange('food')}
                      />
                      <label htmlFor="food" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Include Food (+20% of base price)
                      </label>
                    </div>
                  )}
                  
                  {travelPackage.services.accommodation && (
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="accommodation" 
                        checked={includedServices.accommodation} 
                        onCheckedChange={() => handleServiceChange('accommodation')}
                      />
                      <label htmlFor="accommodation" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Include Accommodation (+30% of base price)
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <Card className="sticky top-24">
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Price Summary</h3>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Base Price</span>
                      <span>₹{travelPackage.basePrice}</span>
                    </div>
                    
                    {includedServices.food && travelPackage.services.food && (
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Food</span>
                        <span>+₹{travelPackage.basePrice * 0.2}</span>
                      </div>
                    )}
                    
                    {includedServices.accommodation && travelPackage.services.accommodation && (
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Accommodation</span>
                        <span>+₹{travelPackage.basePrice * 0.3}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between pt-2">
                      <span className="font-bold">Total Price</span>
                      <span className="font-bold text-xl text-travel-blue">₹{totalPrice}</span>
                    </div>
                  </div>
                  
                 
                {existingBooking ? (
                  <Button className="w-full" size="lg" disabled>
                    Already Booked
                  </Button>
                ) : (
                  <Button className="w-full" size="lg" onClick={handleBookNow}>
                    Book Now
                  </Button>
                )}
                  
                  <p className="text-xs text-gray-500 text-center">
                    By booking, you agree to our terms and conditions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
      
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
            <DialogDescription>
              Please review your booking details before confirming.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Package:</span>
              <span>{travelPackage.from} to {travelPackage.to}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Dates:</span>
              <span>{formatDate(travelPackage.startDate)} - {formatDate(travelPackage.endDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Services:</span>
              <div className="text-right">
                {includedServices.food && <div>Food</div>}
                {includedServices.accommodation && <div>Accommodation</div>}
                {!includedServices.food && !includedServices.accommodation && <div>No additional services</div>}
              </div>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total Price:</span>
              <span className="text-travel-blue">₹{totalPrice}</span>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsBookingDialogOpen(false)} 
              disabled={isBookingLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmBooking} 
              disabled={isBookingLoading}
            >
              {isBookingLoading ? 'Processing...' : 'Confirm Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PackageDetail;
