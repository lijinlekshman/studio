'use client';

import {useEffect, useState, useCallback} from 'react';
import {Address, Coordinate, getCurrentLocation, getAddressForCoordinate} from '@/services/map';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Map} from 'lucide-react';
import {suggestDestinations} from '@/ai/flows/suggest-destinations';
import {useToast} from "@/hooks/use-toast";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import Image from 'next/image';
import {calculateFare} from '@/ai/flows/calculate-fare';
import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue} from "@/components/ui/select";
import { useRouter } from 'next/navigation';
import { Menu } from "lucide-react";

const INR_CONVERSION_RATE = 83;

const countryCodes = [
    { label: 'India (+91)', value: '+91' },
    { label: 'USA (+1)', value: '+1' },
    { label: 'UK (+44)', value: '+44' },
    // Add more country codes as needed
];

export default function Home() {

  const {toast} = useToast();
  const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if the user is authenticated (e.g., check for a token in local storage)
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('authToken');
            setIsAuthenticated(!!token);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        router.push('/'); // Redirect to home after logout
    };



  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      {/* Landing Page Section */}
      <div
        className="relative w-full h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('/Images/taxi-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative z-10 text-center">

          <Image src="/Images/LetsGo-W-slogan.png" width={400} height={100} alt="Let'sGo Rides" />
           <div className="absolute top-4 right-4 flex items-center space-x-2">

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                       <Button variant="ghost" className="h-8 w-8 p-0">
                           <Menu className="h-4 w-4"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        {isAuthenticated ? (
                            <>
                                <DropdownMenuItem>
                                    <Link href="/user-dashboard">User Dashboard</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Link href="/admin">Admin Portal</Link>
                                </DropdownMenuItem>
                            </>
                        ) : (
                            <>
                                <DropdownMenuItem>
                                    <Link href="/login">Admin Portal</Link>
                                </DropdownMenuItem>
                                 <DropdownMenuItem>
                                    <Link href="/login">Login</Link>
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mt-4">
            Book a Ride with Let'sGo
          </h1>
          <p className="text-md md:text-lg text-white mt-2">
            Your trusted partner for safe and comfortable rides.
          </p>
          <Link href="/book-ride">
          <Button className="mt-8">
            Book a Cab <Map className="ml-2" />
          </Button>
          </Link>
        </div>
      </div>

      <main id="booking-section" className="flex flex-col items-center justify-center w-full flex-1 px-4 md:px-20 text-center relative">
        


      </main>
    </div>
  );
}

