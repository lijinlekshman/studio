
'use client';

import { useEffect, useState } from 'react';
import { Map, User, Bot } from 'lucide-react'; // Added Bot
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";


export default function Home() {
    const router = useRouter();
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const adminToken = localStorage.getItem('authToken');
            setIsAdminAuthenticated(!!adminToken);
        }
    }, []);

    const handleAdminLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
        }
        setIsAdminAuthenticated(false);
        router.push('/');
    };

    const handleChatbotClick = () => {
        alert("Chatbot clicked! Chat interface coming soon.");
        // Here you would typically open a chat dialog or interface
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <div className="absolute top-4 right-4 z-20">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="rounded-full h-10 w-10 p-0 hover:bg-accent">
                            <Avatar className="h-9 w-9">
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

            <div
                className="relative w-full h-screen flex items-center justify-center bg-cover bg-center"
                // Background image is handled by globals.css
            >
                <div className="absolute inset-0 bg-black opacity-40"></div> {/* Overlay */}
                <div className="relative z-10 text-center p-6 bg-white/20 rounded-lg shadow-md max-w-xl mx-auto">
                    <Link href="/">
                        <Image src="/Images/logo.png" width={400} height={100} alt="Let'sGo Rides" data-ai-hint="logo" className="mx-auto max-w-[90%] sm:max-w-[300px] h-auto mb-4" />
                    </Link>
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

            {/* Floating Chatbot Head */}
            <div className="fixed bottom-6 right-6 z-30">
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-14 h-14 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleChatbotClick}
                    aria-label="Open Chatbot"
                >
                    <Bot className="h-7 w-7" />
                </Button>
            </div>
        </div>
    );
}
