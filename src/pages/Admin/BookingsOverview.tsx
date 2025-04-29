
import React, { useEffect, useState } from 'react';
import { bookingService } from '@/services/api';
import { FormattedBooking } from '@/types';
import { formatDate, getBookingStatus } from '@/lib/utils';
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

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await bookingService.getAllBookings();
        
        // Add status to each booking based on package dates
        const formattedBookings = response.data.map((booking: any) => {
          return {
            ...booking,
            status: getBookingStatus(booking),
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

  const filteredBookings = activeTab === 'all'
    ? bookings
    : bookings.filter(booking => booking.status === activeTab);

  const statusColors = {
    upcoming: 'bg-travel-blue text-white',
    active: 'bg-green-500 text-white',
    completed: 'bg-gray-500 text-white',
  };

  // Get booking counts by status
  const upcomingCount = bookings.filter(booking => booking.status === 'upcoming').length;
  const activeCount = bookings.filter(booking => booking.status === 'active').length;
  const completedCount = bookings.filter(booking => booking.status === 'completed').length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bookings Overview</h1>
      
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      
      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
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
                          <TableCell>{booking.userId}</TableCell>
                          <TableCell>
                            {booking.packageDetails ? (
                              `${booking.packageDetails.from} to ${booking.packageDetails.to}`
                            ) : (
                              'Unknown Package'
                            )}
                          </TableCell>
                          <TableCell>
                            {booking.packageDetails ? (
                              <>
                                {formatDate(booking.packageDetails.startDate)} - {formatDate(booking.packageDetails.endDate)}
                              </>
                            ) : (
                              'N/A'
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {booking.selectedServices.food && <Badge variant="outline">Food</Badge>}
                              {booking.selectedServices.accommodation && <Badge variant="outline">Accommodation</Badge>}
                            </div>
                          </TableCell>
                          <TableCell>${booking.totalPrice}</TableCell>
                          <TableCell>
                            <Badge className={statusColors[booking.status as keyof typeof statusColors]}>
                              {booking.status}
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
