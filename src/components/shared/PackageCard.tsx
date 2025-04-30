
import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { TravelPackage } from '@/types';
import { formatDate, getPackageStatus } from '@/lib/utils';

interface PackageCardProps {
  travelPackage: TravelPackage;
}

const PackageCard = ({ travelPackage }: PackageCardProps) => {
  const status = getPackageStatus(travelPackage);
  
  const statusColors = {
    completed: 'bg-gray-500',
    active: 'bg-green-500',
    upcoming: 'bg-travel-blue',
  };

  return (
    <Card className="overflow-hidden card-hover">
      <div className="h-48 bg-gray-200 relative">
      <img
  src={
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
  }
  alt={travelPackage.to || 'Travel Destination'}
  className="w-full h-full object-cover"
/>

        <Badge
          className={`absolute top-3 right-3 ${
            statusColors[status as keyof typeof statusColors]
          } text-white capitalize`}
        >
          {status}
        </Badge>
      </div>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{travelPackage.from} to {travelPackage.to}</h3>
          <span className="text-lg font-bold text-travel-blue">
            ${travelPackage.basePrice}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Dates</span>
            <span>
              {formatDate(travelPackage.startDate)} - {formatDate(travelPackage.endDate)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Includes</span>
            <div className="flex space-x-2">
              {travelPackage.services.food && (
                <Badge variant="outline">Food</Badge>
              )}
              {travelPackage.services.accommodation && (
                <Badge variant="outline">Accommodation</Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link to={`/packages/${travelPackage._id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PackageCard;
