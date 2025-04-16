'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from "next/link";

const OTPPage: React.FC = () => {
    const [otp, setOtp] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const mobileNumber = searchParams.get('mobileNumber'); // Get mobileNumber from query parameters

    const verifyOTPAndBookCab = () => {
        // Placeholder: Verify OTP logic (e.g., check against a stored OTP)
        if (otp === "123456") { // Replace with actual OTP verification logic
            alert("OTP Verified! Booking cab...");
            // Redirect to booking confirmation page or any other relevant page
            router.push('/'); // Navigate back to the home page after OTP verification
        } else {
            alert("OTP Verification Failed: Invalid OTP. Please try again.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <main className="flex flex-col items-center justify-center w-full flex-1 px-4 md:px-20 text-center">
                <Image src="/Images/LetsGo-W-slogan.png" width={400} height={100} alt="Let'sGo Rides" />

                <Card className="w-full max-w-md mt-10">
                    <CardHeader>
                        <CardTitle>Verify OTP</CardTitle>
                        <CardDescription>
                            Enter the OTP sent to your mobile number {mobileNumber}.
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
                        <Button onClick={verifyOTPAndBookCab} disabled={!otp}>
                            Verify OTP
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

export default OTPPage;
