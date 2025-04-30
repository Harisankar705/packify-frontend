
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { packageService } from '@/services/api';
import { TravelPackage, SearchParams } from '@/types';
import SearchForm from '@/components/shared/SearchForm';
import PackageCard from '@/components/shared/PackageCard';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const Index = () => {
  const [featuredPackages, setFeaturedPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedPackages = async () => {
      try {
        setLoading(true);
        const response = await packageService.getAllPackages({ limit: 3 });
        setFeaturedPackages(response.data);
      } catch (error) {
        console.error('Error fetching packages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPackages();
  }, []);

  const handleSearch = (params: SearchParams) => {
    const queryParams = new URLSearchParams();
    if (params.from) queryParams.append('from', params.from);
    if (params.to) queryParams.append('to', params.to);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    
    navigate(`/packages?${queryParams.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="relative">
        <div className="absolute inset-0 bg-black opacity-60 z-10"></div>
        <div 
          className="h-[600px] bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80')" }}
        ></div>
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="text-center max-w-4xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl">
              Discover Amazing Places
            </h1>
            <p className="mt-6 text-xl text-white">
              Find and book travel packages to the most beautiful destinations around the world.
            </p>
            <div className="mt-10 max-w-3xl mx-auto bg-white rounded-lg shadow-xl p-6">
              <SearchForm onSearch={handleSearch} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2D2942]">Featured Travel Packages</h2>
            <p className="mt-4 text-xl text-gray-600">
              Explore our most popular destinations
            </p>
          </div>
          
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPackages.length > 0 ? (
                featuredPackages.map((pkg) => (
                  <PackageCard key={pkg._id} travelPackage={pkg} />
                ))
              ) : (
                <div className="col-span-3 text-center py-8">
                  <p className="text-gray-500 text-lg">No packages available at the moment.</p>
                </div>
              )}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Button className="bg-[#F83A26] hover:bg-[#F83A26]/90" asChild size="lg">
              <a href="/packages">View All Packages</a>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="bg-[#2D2942] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Ready for your next adventure?</h2>
          <p className="mt-4 text-xl text-white/90 max-w-2xl mx-auto">
            Sign up now to receive exclusive offers and updates on new travel packages.
          </p>
          <div className="mt-8">
            
            <Button asChild variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
              <a href="/packages">Explore Packages</a>
            </Button>
          </div>
        </div>
      </div>
      
      
      
      <Footer />
    </div>
  );
};

export default Index;
