
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Packages from "@/pages/Packages";
import PackageDetail from "@/pages/PackageDetail";
import Profile from "@/pages/Profile";
import Bookings from "@/pages/Bookings";
import NotFound from "@/pages/NotFound";

import AdminLayout from "@/pages/Admin/AdminLayout";
import Dashboard from "@/pages/Admin/Dashboard";
import ManagePackages from "@/pages/Admin/ManagePackages";
import PackageForm from "@/pages/Admin/PackageForm";
import BookingsOverview from "@/pages/Admin/BookingsOverview";
import UsersOverview from "@/pages/Admin/UsersOverview";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/packages/:id" element={<PackageDetail />} />
            
            <Route path="/profile" element={<Profile />} />
            <Route path="/bookings" element={<Bookings />} />
            
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="packages" element={<ManagePackages />} />
              <Route path="packages/add" element={<PackageForm />} />
              <Route path="packages/edit/:id" element={<PackageForm />} />
              <Route path="bookings" element={<BookingsOverview />} />
              <Route path="users" element={<UsersOverview />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
