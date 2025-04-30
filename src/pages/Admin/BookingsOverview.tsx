import React, { useEffect, useState } from 'react';
import { bookingService } from '@/services/api';
import { FormattedBooking } from '@/types';
import { formatDate } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const BookingsOverview = () => {
  const [bookings, setBookings] = useState<FormattedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await bookingService.getAllBookings();
        
        // Debug data
        console.log('API Response:', response);
        
        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Invalid data format received from API');
        }
        
        const formattedBookings = response.data.map((booking: any) => {
          // Map schema fields to component expectations
          const formattedBooking = {
            _id: booking._id || `temp-${Math.random()}`,
            userId: booking.user?._id || booking.user || 'Unknown User',
            userName: booking.user?.name || 'Unknown User',
            packageId: booking.package?._id || booking.package || '',
            packageDetails: booking.package ? {
              from: booking.package.from || 'Unknown',
              to: booking.package.to || 'Unknown',
              startDate: booking.package.startDate || null,
              endDate: booking.package.endDate || null,
              price: booking.package.price || 0
            } : {
              from: 'Unknown',
              to: 'Unknown',
              startDate: null,
              endDate: null,
              price: 0
            },
            services: booking.services || { food: false, accommodation: false },
            totalPrice: calculateTotalPrice(booking),
            bookingDate: booking.bookingDate || new Date(),
            // Use the status directly from the database
            status: mapBookingStatus(booking.status || 'pending'),
            // Include original booking for reference
            originalBooking: booking
          };
          
          return formattedBooking;
        });
        
        console.log('Formatted Bookings:', formattedBookings);
        setBookings(formattedBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('Failed to load bookings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  function calculateTotalPrice(booking: any): number {
    if (!booking) return 0;
    
    // Base price from package
    let total = booking.package?.price || 0;
    
    if (booking.services?.food) total += 500; // Example food cost
    if (booking.services?.accommodation) total += 1000; // Example accommodation cost
    
    return total;
  }
  
  function mapBookingStatus(status: string): string {
    switch (status) {
      case 'pending': return 'upcoming';
      case 'confirmed': return 'active';
      case 'cancelled': return 'cancelled';
      default: return status;
    }
  }

  const filteredBookings = activeTab === 'all'
    ? bookings
    : bookings.filter(booking => booking.status === activeTab);

  const statusColors = {
    upcoming: 'bg-travel-blue text-white',
    active: 'bg-green-500 text-white',
    completed: 'bg-gray-500 text-white',
    cancelled: 'bg-red-500 text-white',
    pending: 'bg-yellow-500 text-white',
    confirmed: 'bg-green-500 text-white'
  };

  const upcomingCount = bookings.filter(booking => booking.status === 'upcoming' || booking.status === 'pending').length;
  const activeCount = bookings.filter(booking => booking.status === 'active' || booking.status === 'confirmed').length;
  const completedCount = bookings.filter(booking => booking.status === 'completed').length;

  // Helper function to safely format dates
  const safeFormatDate = (date: any) => {
    if (!date) return 'N/A';
    try {
      return formatDate(date);
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bookings Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Active Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{upcomingCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Completed Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedCount}</div>
          </CardContent>
        </Card>
        
        
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All Bookings</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="space-y-6">
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : filteredBookings.length > 0 ? (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Package</TableHead>
                        <TableHead>Travel Dates</TableHead>
                        <TableHead>Services</TableHead>
                        <TableHead>Total Price</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings.map((booking) => (
                        <TableRow key={booking._id}>
                          <TableCell>{booking.userName || 'Unknown'}</TableCell>
                          <TableCell>
                            {booking.packageDetails ? (
                              `${booking.packageDetails.from || 'Unknown'} to ${booking.packageDetails.to || 'Unknown'}`
                            ) : (
                              'Unknown Package'
                            )}
                          </TableCell>
                          <TableCell>
                            {booking.packageDetails?.startDate || booking.packageDetails?.endDate ? (
                              <>
                                {safeFormatDate(booking.packageDetails.startDate)} - {safeFormatDate(booking.packageDetails.endDate)}
                              </>
                            ) : (
                              'N/A'
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {booking.services?.food && <Badge variant="outline">Food</Badge>}
                              {booking.services?.accommodation && <Badge variant="outline">Accommodation</Badge>}
                              {(!booking.services || (!booking.services.food && !booking.services.accommodation)) && 
                                <span className="text-gray-500">None</span>
                              }
                            </div>
                          </TableCell>
                          <TableCell>
                            {typeof booking.totalPrice === 'number' ? `₹${booking.totalPrice}` : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[booking.status as keyof typeof statusColors] || 'bg-gray-300'}>
                              {booking.status || 'Unknown'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No bookings found.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingsOverview;