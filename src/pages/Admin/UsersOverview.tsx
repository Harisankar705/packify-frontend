
import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { User } from '@/types';
import { userService } from '@/services/api';

const mockUsers: User[] = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profilePic: '',
    address: '123 Main St, City',
    role: 'admin',
  },
  {
    _id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    profilePic: '',
    address: '456 Elm St, Town',
    role: 'user',
  },
  {
    _id: '3',
    name: 'Robert Johnson',
    email: 'robert.johnson@example.com',
    profilePic: '',
    address: '789 Oak St, Village',
    role: 'user',
  },
  {
    _id: '4',
    name: 'Sarah Williams',
    email: 'sarah.williams@example.com',
    profilePic: '',
    address: '101 Pine St, County',
    role: 'user',
  },
  {
    _id: '5',
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    profilePic: '',
    address: '202 Maple St, District',
    role: 'user',
  },
];

const UsersOverview = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response=await userService.getUsers();
        console.log("RESPONSE",response)
        setUsers(response.data);
        setLoading(false)
       
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const userCount = users.filter(user => user.role === 'user').length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
             
              <div>
                <span className="text-sm text-gray-500">Customers: </span>
                <span className="font-bold">{userCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : users.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {user.profilePic ? (
                              <AvatarImage src={user.profilePic} alt={user.name} />
                            ) : null}
                            <AvatarFallback className="bg-travel-blue text-white">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          {user.name}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={user.role === 'admin' ? 'default' : 'secondary'}
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No users found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersOverview;
