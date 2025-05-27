
'use client';

import { useEffect, useState } from 'react';
import { Map, User, Bot } from 'lucide-react';
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
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { parseBookingRequest, type ParseBookingRequestOutput } from '@/ai/flows/parse-booking-request';


export default function Home() {
    const router = useRouter();
    const { toast } = useToast();
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [aiRequestText, setAiRequestText] = useState('');
    const [isParsingAi, setIsParsingAi] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const adminToken = localStorage.getItem('authToken');
            setIsAdminAuthenticated(!!adminToken);
            const userToken = localStorage.getItem('loggedInUser');
            setIsUserLoggedIn(!!userToken);
        }
    }, []);

    const handleAdminLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
        }
        setIsAdminAuthenticated(false);
        toast({ title: "Admin Logged Out" });
        router.push('/');
    };

    const handleUserLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('loggedInUser');
            const recentBooking = localStorage.getItem('bookingDetails');
            if (recentBooking) {
                try {
                    const parsedRecentBooking = JSON.parse(recentBooking);
                    if (parsedRecentBooking.email) {
                        localStorage.removeItem(`profileImage_${parsedRecentBooking.email}`);
                        localStorage.removeItem(`userAddress_${parsedRecentBooking.email}`);
                    }
                } catch (e) {
                    console.error("Error parsing bookingDetails for logout cleanup", e);
                }
            }
            localStorage.removeItem('bookingDetails');
        }
        setIsUserLoggedIn(false);
        toast({ title: "User Logged Out" });
        router.push('/');
    };

    const handleProcessAiRequest = async () => {
        if (!aiRequestText.trim()) {
            toast({ title: "AI Assistant", description: "Please enter your booking request." });
            return;
        }
        setIsParsingAi(true);
        try {
            const parsedData: ParseBookingRequestOutput = await parseBookingRequest({ requestText: aiRequestText });
            if (typeof window !== 'undefined') {
                localStorage.setItem('chatbotBookingRequest', JSON.stringify(parsedData));
            }
            toast({ title: "AI Assistant", description: "Request processed. Redirecting to booking page..." });
            setIsSheetOpen(false); 
            setAiRequestText(''); 
            router.push('/book-ride');
        } catch (error: any) {
            toast({ title: "AI Processing Error", description: error.message || "Could not process the request.", variant: "destructive" });
        } finally {
            setIsParsingAi(false);
        }
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
                        {isUserLoggedIn ? (
                             <DropdownMenuItem onClick={handleUserLogout}>
                                User Logout
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem onClick={() => router.push('/user-login')}>
                                User Login
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div
                className="relative w-full h-screen flex items-center justify-center bg-cover bg-center"
                // style={{ backgroundImage: "url('/Images/taxi-bg.jpg')" }} // Background applied via globals.css
            >
                <div className="absolute inset-0 bg-black opacity-40"></div>
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

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="fixed bottom-6 right-6 z-30 rounded-full w-14 h-14 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
                        aria-label="Open Chatbot"
                    >
                        <Bot className="h-7 w-7" />
                    </Button>
                </SheetTrigger>
                <SheetContent className="flex flex-col"> {/* Make sheet content a flex column */}
                    <SheetHeader>
                        <SheetTitle>AI Booking Assistant</SheetTitle>
                        <SheetDescription>
                            Tell me your booking details, and I'll help you get started!
                            For example: "Book a cab from Punalur to Kollam for Anoop, email@example.com, 9876543210, SUV preferred"
                        </SheetDescription>
                    </SheetHeader>
                    <div className="flex-grow py-4"> {/* This div will expand */}
                        <div className="grid w-full gap-1.5 h-full">
                            <Label htmlFor="ai-request-text" className="sr-only">Your Request</Label> {/* sr-only as placeholder is descriptive */}
                            <Textarea
                                placeholder="Type your booking request here..."
                                id="ai-request-text"
                                value={aiRequestText}
                                onChange={(e) => setAiRequestText(e.target.value)}
                                className="h-full resize-none" // Make textarea take full height of its container and non-resizable
                            />
                        </div>
                    </div>
                    <SheetFooter>
                        <SheetClose asChild>
                             <Button type="button" variant="outline" onClick={() => { setAiRequestText(''); setIsSheetOpen(false); }}>Cancel</Button>
                        </SheetClose>
                        <Button type="button" onClick={handleProcessAiRequest} disabled={isParsingAi}>
                            {isParsingAi ? "Processing..." : "Process Request"}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}
