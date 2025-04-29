
import React, { useEffect, useState } from 'react';
import { packageService, bookingService } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getPackageStatus } from '@/lib/utils';

const Dashboard = () => {
  const [packagesStats, setPackagesStats] = useState({
    total: 0,
    completed: 0,
    active: 0,
    upcoming: 0,
  });
  const [bookingsCount, setBookingsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [topPackages, setTopPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all packages
        const packagesRes = await packageService.getAllPackages();
        const packages = packagesRes.data;
        
        // Calculate package stats
        const completed = packages.filter(pkg => getPackageStatus(pkg) === 'completed').length;
        const active = packages.filter(pkg => getPackageStatus(pkg) === 'active').length;
        const upcoming = packages.filter(pkg => getPackageStatus(pkg) === 'upcoming').length;
        
        setPackagesStats({
          total: packages.length,
          completed,
          active,
          upcoming,
        });

        // Mock bookings count
        setBookingsCount(32);
        
        // Mock users count
        setUsersCount(18);
        
        // Mock top packages data
        setTopPackages([
          { name: 'Paris to London', bookings: 12 },
          { name: 'New York to Miami', bookings: 9 },
          { name: 'Tokyo to Kyoto', bookings: 7 },
          { name: 'Berlin to Prague', bookings: 5 },
          { name: 'Sydney to Melbourne', bookings: 3 },
        ]);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statusData = [
    { name: 'Completed', value: packagesStats.completed, color: '#6c757d' },
    { name: 'Active', value: packagesStats.active, color: '#28a745' },
    { name: 'Upcoming', value: packagesStats.upcoming, color: '#1A73E8' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total Packages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{packagesStats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{bookingsCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{usersCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Active Packages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{packagesStats.active}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Package Status</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Packages</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topPackages}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="bookings" fill="#1A73E8" name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
