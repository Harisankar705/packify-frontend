
import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import ProtectedRoute from '@/components/shared/ProtectedRoute';

const AdminLayout = () => {
  const navLinks = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Travel Packages', path: '/admin/packages' },
    { name: 'Users', path: '/admin/users' },
    { name: 'Bookings', path: '/admin/bookings' },
  ];

  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <div className="flex-grow bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white shadow rounded-lg p-4 sticky top-24">
                  <h2 className="text-xl font-bold mb-4 px-3 text-[#2D2942]">Admin</h2>
                  <nav className="space-y-1">
                    {navLinks.map((link) => (
                      <NavLink
                        key={link.path}
                        to={link.path}
                        end={link.path === '/admin'}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center px-3 py-2 rounded-md text-sm font-medium",
                            isActive
                              ? "bg-[#2D2942] text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          )
                        }
                      >
                        {link.name}
                      </NavLink>
                    ))}
                  </nav>
                </div>
              </div>
              
              {/* Main Content */}
              <div className="lg:col-span-4">
                <div className="bg-white shadow rounded-lg p-6">
                  <Outlet />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default AdminLayout;
