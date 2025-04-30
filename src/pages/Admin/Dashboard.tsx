import React, { useEffect, useState } from "react";
import { packageService, bookingService, userService } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "recharts";
import { getPackageStatus } from "@/lib/utils";

const Dashboard = () => {
  const [packagesStats, setPackagesStats] = useState({
    total: 0,
    completed: 0,
    active: 0,
  });
  const [bookingsCount, setBookingsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [topPackages, setTopPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const packagesRes = await packageService.getAllPackages();
        const packages = packagesRes.data;

        const completed = packages.filter(
          (pkg) => getPackageStatus(pkg) === "completed"
        ).length;
        const active = packages.filter(
          (pkg) => getPackageStatus(pkg) === "active"
        ).length;

        setPackagesStats({
          total: packages.length,
          completed,
          active,
        });
        const bookingResponse = await bookingService.getAllBookings();

        setBookingsCount(bookingResponse.data.length);

        const response = await userService.getUsers();
        setUsersCount(response.data.length);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statusData = [
    { name: "Completed", value: packagesStats.completed, color: "#6c757d" },
    { name: "Active", value: packagesStats.active, color: "#28a745" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">
              Total Packages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{packagesStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">
              Total Bookings
            </CardTitle>
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
            <CardTitle className="text-sm text-gray-500">
              Active Packages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{packagesStats.active}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-2">
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
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
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
      </div>
    </div>
  );
};

export default Dashboard;
