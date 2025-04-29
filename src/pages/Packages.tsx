
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { packageService } from '@/services/api';
import { TravelPackage, SearchParams } from '@/types';
import SearchForm from '@/components/shared/SearchForm';
import PackageCard from '@/components/shared/PackageCard';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Packages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('price-asc');

  const initialSearchParams: SearchParams = {
    from: searchParams.get('from') || undefined,
    to: searchParams.get('to') || undefined,
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
  };

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        
        const params: any = {};
        if (initialSearchParams.from) params.from = initialSearchParams.from;
        if (initialSearchParams.to) params.to = initialSearchParams.to;
        if (initialSearchParams.startDate) params.startDate = initialSearchParams.startDate;
        if (initialSearchParams.endDate) params.endDate = initialSearchParams.endDate;
        
        // Add sorting
        const [sort, order] = sortBy.split('-');
        params.sortBy = sort;
        params.sortOrder = order;
        
        const response = await packageService.getAllPackages(params);
        setPackages(response.data);
      } catch (error) {
        console.error('Error fetching packages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [searchParams, sortBy]);

  const handleSearch = (params: SearchParams) => {
    const newSearchParams = new URLSearchParams();
    if (params.from) newSearchParams.append('from', params.from);
    if (params.to) newSearchParams.append('to', params.to);
    if (params.startDate) newSearchParams.append('startDate', params.startDate);
    if (params.endDate) newSearchParams.append('endDate', params.endDate);
    
    setSearchParams(newSearchParams);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="bg-travel-blue/10 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Find Your Perfect Travel Package</h1>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <SearchForm onSearch={handleSearch} initialValues={initialSearchParams} />
          </div>
        </div>
      </div>
      
      <div className="flex-grow py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
              {searchParams.toString() ? 'Search Results' : 'All Packages'}
            </h2>
            
            <div className="flex items-center">
              <span className="mr-2 text-sm text-gray-500">Sort by:</span>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="startDate-asc">Date: Soonest First</SelectItem>
                  <SelectItem value="startDate-desc">Date: Latest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {packages.length > 0 ? (
                packages.map((pkg) => (
                  <PackageCard key={pkg._id} travelPackage={pkg} />
                ))
              ) : (
                <div className="col-span-3 py-16 text-center">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No packages found</h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search filters or explore all available packages.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Packages;
