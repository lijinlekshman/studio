
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

const OTPPageClient: React.FC = () => {
    const [otp, setOtp] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [clientMobileNumber, setClientMobileNumber] = useState<string | null>(null);

    useEffect(() => {
        const mobileNumberFromParams = searchParams.get('mobileNumber');
        setClientMobileNumber(mobileNumberFromParams);
    }, [searchParams]);

    const verifyOTPAndProceed = () => {
        if (otp === "123456") { // Replace with actual OTP verification logic
            if (typeof window !== 'undefined') {
                const bookingDetailsString = localStorage.getItem('bookingDetails');
                if (bookingDetailsString) {
                    try {
                        const bookingDetails = JSON.parse(bookingDetailsString);
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
                        console.error("Error parsing bookingDetails from localStorage", error);
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
                        description: "Booking details not found. Please try booking again.",
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
            <main className="flex flex-col items-center justify-center w-full flex-1 px-4 md:px-20 text-center">
                <Link href="/">
                  <Image src="/Images/logo.png" width={400} height={100} alt="Let'sGo Rides" data-ai-hint="logo" className="max-w-[90%] sm:max-w-[350px] h-auto mb-6" />
                </Link>
                <Card className="w-full max-w-md mt-10">
                    <CardHeader>
                        <CardTitle>Verify OTP</CardTitle>
                        <CardDescription>
                            Enter the OTP sent to your mobile number {clientMobileNumber || '...'}. (Demo OTP: 123456)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <label htmlFor="otp">OTP</label>
                            <Input
                                type="text"
                                id="otp"
                                placeholder="Enter OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                            />
                        </div>
                        <Button onClick={verifyOTPAndProceed} disabled={!otp || !clientMobileNumber}>
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
