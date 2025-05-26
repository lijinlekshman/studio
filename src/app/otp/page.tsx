
'use client';

import React, { useState, useEffect } from 'react';
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
    const [clientMobileNumber, setClientMobileNumber] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // This effect runs only on the client, after initial mount
        setIsClient(true);
        const mobileNumberFromParams = searchParams.get('mobileNumber');
        setClientMobileNumber(mobileNumberFromParams);
    }, []); // Empty dependency array ensures this runs once on mount

    const verifyOTPAndBookCab = () => {
        // Placeholder: Verify OTP logic (e.g., check against a stored OTP)
        if (otp === "123456") { // Replace with actual OTP verification logic
            alert("OTP Verified! Redirecting to user dashboard...");
            if (clientMobileNumber) {
                router.push(`/user-dashboard?mobileNumber=${clientMobileNumber}`);
            } else {
                alert("Mobile number not found. Redirecting to home.");
                router.push('/');
            }
        } else {
            alert("OTP Verification Failed: Invalid OTP. Please try again.");
        }
    };

    if (!isClient) {
        // Render a loading state or nothing during SSR/prerendering
        // and before the client-side effect has run.
        return null; // Or you can return a loading spinner <p>Loading...</p>
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <main className="flex flex-col items-center justify-center w-full flex-1 px-4 md:px-20 text-center">
                <Image src="/Images/LetsGo-W-slogan.png" width={400} height={100} alt="Let'sGo Rides" />

                <Card className="w-full max-w-md mt-10">
                    <CardHeader>
                        <CardTitle>Verify OTP</CardTitle>
                        <CardDescription>
                            Enter the OTP sent to your mobile number {clientMobileNumber || '...'}.
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
                        <Button onClick={verifyOTPAndBookCab} disabled={!otp || !clientMobileNumber}>
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
