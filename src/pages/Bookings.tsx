import React, { useEffect, useState } from 'react';
import { bookingService, packageService } from '@/services/api';
import { Booking, FormattedBooking, TravelPackage } from '@/types';
import { formatDate, getBookingStatus } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ProtectedRoute from '@/components/shared/ProtectedRoute';

const Bookings = () => {
  const [bookings, setBookings] = useState<FormattedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const bookingsResponse = await bookingService.getUserBookings();
        console.log('Bookings response:', bookingsResponse);
        
        const packageIds = [...new Set(bookingsResponse.data.map((booking: Booking) => booking.package))];
        const packageDetails: Record<string, TravelPackage> = {};
        
        await Promise.all(
          packageIds.map(async (packageId) => {
            try {
              const packageResponse = await packageService.getPackageById(packageId);
              packageDetails[packageId] = packageResponse.data;
            } catch (error) {
              console.error(`Error fetching package details for ${packageId}:`, error);
            }
          })
        );
        
        const formattedBookings = bookingsResponse.data.map((booking: Booking) => {
          return {
            ...booking,
            status: getBookingStatus(booking),
            packageDetails: packageDetails[booking.package],
            totalPrice: calculateTotalPrice(packageDetails[booking.package], booking.services)
          };
        });
        
        setBookings(formattedBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);
  
  const calculateTotalPrice = (packageDetails: TravelPackage, services: { food: boolean, accommodation: boolean }) => {
    if (!packageDetails) return 0;
    
    let price = packageDetails.basePrice;
    
    if (services.food && packageDetails.services.food) {
      price += packageDetails.basePrice * 0.2;
    }
    
    if (services.accommodation && packageDetails.services.accommodation) {
      price += packageDetails.basePrice * 0.3;
    }
    
    return price;
  };

  const filteredBookings = activeTab === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === activeTab);

  const statusColors = {
    upcoming: 'bg-travel-blue text-white',
    active: 'bg-green-500 text-white',
    completed: 'bg-gray-500 text-white',
    pending: 'bg-yellow-500 text-white',
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <div className="flex-grow bg-gray-50 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
            
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList>
                <TabsTrigger value="all">All Bookings</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="space-y-6">
                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <LoadingSpinner />
                  </div>
                ) : filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <Card key={booking._id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {booking.packageDetails ? (
                              `${booking.packageDetails.from} to ${booking.packageDetails.to}`
                            ) : (
                              `Booking ID: ${booking._id}`
                            )}
                          </CardTitle>
                          <Badge className={statusColors[booking.status as keyof typeof statusColors] || 'bg-gray-400 text-white'}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="text-sm text-gray-500">Travel Dates</div>
                            <div>
                              {booking.packageDetails ? (
                                <>
                                  {formatDate(booking.packageDetails.startDate)} - {formatDate(booking.packageDetails.endDate)}
                                </>
                              ) : (
                                <span className="text-gray-500">Details not available</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Selected Services</div>
                            <div className="flex gap-2 flex-wrap">
                              {booking.services.food && <Badge variant="outline">Food</Badge>}
                              {booking.services.accommodation && <Badge variant="outline">Accommodation</Badge>}
                              {!booking.services.food && !booking.services.accommodation && (
                                <span className="text-gray-500">No additional services</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Booking Date</div>
                            <div>{formatDate(booking.bookingDate)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Total Price</div>
                            <div className="font-bold text-travel-blue">
                              ${booking.totalPrice || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No bookings found</h3>
                    <p className="text-gray-600">
                      {activeTab === 'all'
                        ? "You don't have any bookings yet."
                        : `You don't have any ${activeTab} bookings.`}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default Bookings;