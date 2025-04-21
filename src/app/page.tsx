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
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

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

    const toggleMenu = () => {
        setShowMenu(!showMenu);
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

                    <h1 className="text-3xl md:text-5xl font-bold text-white mt-4">
                        Book a Ride with Let'sGo
                    </h1>
                    <p className="text-md md:text-lg text-white mt-2">
                        Your trusted partner for safe and comfortable rides.
                    </p>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="rounded-full h-9 w-9 p-0 hover:bg-accent" aria-label="Toggle menu">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 mr-2">
                            {isAuthenticated ? (
                                <DropdownMenuItem onClick={handleLogout}>
                                    Logout
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem onClick={() => router.push('/login')}>
                                    Login
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => router.push('/admin')}>
                                Admin Portal
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

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
