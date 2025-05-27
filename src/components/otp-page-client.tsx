
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label"; // Added import for Label

const OTPPageClient: React.FC = () => {
    const [otp, setOtp] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [clientMobileNumber, setClientMobileNumber] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const mobileNumberFromParams = searchParams.get('mobileNumber');
            setClientMobileNumber(mobileNumberFromParams);
        }
    }, [searchParams]);

    // Placeholder for Twilio OTP verification
    const simulateVerifyOtp = async (phoneNumber: string | null, otpCode: string) => {
        console.log(`Simulating OTP verification for: ${phoneNumber} with OTP: ${otpCode} using Twilio Verify Service ID: VA4e5f3c5b9f308ba482baa879f38b4bba`);
        // In a real app, this would involve a backend call to Twilio:
        // const response = await fetch('/api/verify-otp', { method: 'POST', body: JSON.stringify({ phoneNumber, otpCode }) });
        // if (!response.ok) throw new Error('Failed to verify OTP');
        // const data = await response.json(); return data.success;
        
        if (otpCode === "123456") { // Demo OTP
            toast({
                title: "OTP Verification Simulated",
                description: "OTP successfully verified (Demo).",
            });
            return true;
        }
        return false;
    };

    const verifyOTPAndProceed = async () => {
        if (!clientMobileNumber) {
            toast({
                title: "Error",
                description: "Mobile number not found. Please try booking again.",
                variant: "destructive",
            });
            router.push('/book-ride');
            return;
        }

        const isVerified = await simulateVerifyOtp(clientMobileNumber, otp);

        if (isVerified) {
            if (typeof window !== 'undefined') {
                const bookingDetailsString = localStorage.getItem('bookingDetails');
                if (bookingDetailsString) {
                    try {
                        const bookingDetails = JSON.parse(bookingDetailsString);
                        // Update booking status to Confirmed
                        let allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
                        allBookings = allBookings.map((b: any) => 
                            b.id === bookingDetails.id ? { ...b, status: 'Confirmed' } : b
                        );
                        localStorage.setItem('bookings', JSON.stringify(allBookings));
                        
                        // Log in the user
                        const userToLogin = {
                            email: bookingDetails.email,
                            name: bookingDetails.userName,
                            mobile: bookingDetails.mobileNumber,
                        };
                        localStorage.setItem('loggedInUser', JSON.stringify(userToLogin));
                        
                        toast({
                            title: "OTP Verified!",
                            description: "Booking confirmed. Redirecting to your dashboard...",
                        });
                        router.push(`/user-dashboard`);
                    } catch (error) {
                        console.error("Error processing bookingDetails from localStorage", error);
                        toast({
                            title: "Error",
                            description: "Could not retrieve booking information. Please try again.",
                            variant: "destructive",
                        });
                        router.push('/');
                    }
                } else {
                    toast({
                        title: "Error",
                        description: "Booking details not found after OTP. Please try booking again.",
                        variant: "destructive",
                    });
                    router.push('/');
                }
            }
        } else {
            toast({
                title: "OTP Verification Failed",
                description: "Invalid OTP. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-cover bg-center">
            {/* Background image is now applied via globals.css to the body */}
            <main className="flex flex-col items-center justify-center w-full flex-1 px-4 text-center">
                <Link href="/">
                  <Image 
                    src="/Images/logo.png" 
                    width={400} 
                    height={100} 
                    alt="Let'sGo Rides" 
                    data-ai-hint="logo" 
                    className="mx-auto max-w-[200px] h-auto sm:max-w-[250px] md:max-w-[300px] mb-6" />
                </Link>
                <Card className="w-full max-w-sm mt-8 sm:mt-10">
                    <CardHeader>
                        <CardTitle className="text-xl sm:text-2xl">Verify OTP</CardTitle>
                        <CardDescription>
                            Enter the OTP sent to your mobile number {clientMobileNumber || '...'}. (Demo OTP: 123456)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2 text-left">
                            <Label htmlFor="otp">OTP</Label>
                            <Input
                                type="text"
                                id="otp"
                                placeholder="Enter OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                className="text-sm"
                            />
                        </div>
                        <Button onClick={verifyOTPAndProceed} disabled={!otp || !clientMobileNumber} className="w-full">
                            Verify OTP & Proceed
                        </Button>
                         <Link href="/" className="mt-4 text-sm text-muted-foreground hover:text-foreground">
                            Back to Home
                         </Link>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default OTPPageClient;

