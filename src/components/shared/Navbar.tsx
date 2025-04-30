import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
        <div className="flex-shrink-0 flex items-center">
  {!isAdmin ? (
    <Link to="/" className="flex items-center">
      <span className="text-[#2D2942] font-bold text-xl">Packify</span>
    </Link>
  ) : (
    <span className="text-[#2D2942] font-bold text-xl">Packify</span>
  )}
</div>


          <div className="flex items-center">
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              {!isAdmin && (
                <>
                  <Link
                    to="/"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === '/'
                        ? 'text-[#F83A26]'
                        : 'text-gray-600 hover:text-[#F83A26]'
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    to="/packages"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === '/packages'
                        ? 'text-[#F83A26]'
                        : 'text-gray-600 hover:text-[#F83A26]'
                    }`}
                  >
                    Packages
                  </Link>
                </>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname.startsWith('/admin')
                      ? 'text-[#F83A26]'
                      : 'text-gray-600 hover:text-[#F83A26]'
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>

            <div className="ml-6">
              {isAuthenticated ? (
                <>
                  {!isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                          <Avatar className="h-10 w-10">
                            {user?.profilePic ? (
                              <AvatarImage src={user.profilePic} alt={user.name} />
                            ) : null}
                            <AvatarFallback className="bg-[#2D2942] text-white">
                              {user?.name ? getInitials(user.name) : <User className="h-4 w-4" />}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end">
                        <div className="p-2 font-medium">{user?.name}</div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/profile" className="cursor-pointer w-full">
                            My Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/bookings" className="cursor-pointer w-full">
                            My Bookings
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout} className="cursor-pointer">
                          Logout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  {isAdmin && (
                    <Button variant="outline" size="sm" onClick={logout}>
                      Logout
                    </Button>
                  )}
                </>
              ) : (
                <div className="flex space-x-2">
                  <Button variant="outline" asChild>
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button className="bg-[#F83A26] hover:bg-[#F83A26]/90" asChild>
                    <Link to="/register">Register</Link>
                  </Button>
                  <Button variant="outline" size="sm" className="ml-1" asChild>
                    <Link to="/admin/login">Admin</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
