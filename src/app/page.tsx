
'use client';

import { useEffect, useState } from 'react';
import { Map, User } from 'lucide-react';
import Link from "next/link";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";


export default function Home() {
    const router = useRouter();
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false); // Renamed for clarity

    useEffect(() => {
        // Check if the admin is authenticated
        if (typeof window !== 'undefined') {
            const adminToken = localStorage.getItem('authToken'); // Admin token
            setIsAdminAuthenticated(!!adminToken);
        }
    }, []);

    const handleAdminLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken'); // Admin token
        }
        setIsAdminAuthenticated(false);
        router.push('/'); // Redirect to home after admin logout
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <div className="absolute top-4 right-4 z-20">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="rounded-full h-10 w-10 p-0 hover:bg-accent">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src="/Images/logo.png" alt="User Profile" data-ai-hint="user avatar" />
                                <AvatarFallback>
                                    <User className="h-5 w-5" />
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 mr-2">
                        {isAdminAuthenticated ? (
                            <DropdownMenuItem onClick={handleAdminLogout}>
                                Admin Logout
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem onClick={() => router.push('/login')}>
                                Admin Login
                            </DropdownMenuItem>
                        )}
                         <DropdownMenuItem onClick={() => router.push('/user-login')}>
                                User Login
                         </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Landing Page Section */}
            <div
                className="relative w-full h-screen flex items-center justify-center bg-cover bg-center"
                // The body style from globals.css should handle the main background image
            >
                <div className="absolute inset-0 bg-black opacity-40"></div> {/* Overlay */}
                <div className="relative z-10 text-center">

                    <Image src="/Images/logo.png" width={400} height={100} alt="Let'sGo Rides" data-ai-hint="logo" />

                    <h1 className="text-3xl md:text-5xl font-bold text-white mt-4">
                        Book a Ride with Let'sGo
                    </h1>
                    <p className="text-md md:text-lg text-white mt-2">
                        Your trusted partner for safe and comfortable rides.
                    </p>

                    <Link href="/book-ride">
                        <Button className="mt-8 mx-2">
                            Book a Cab <Map className="ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
