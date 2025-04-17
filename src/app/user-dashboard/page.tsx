'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from "next/link";
import { Button } from "@/components/ui/button";

const UserDashboardPage: React.FC = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const mobileNumber = searchParams.get('mobileNumber');
    const [bookingDetails, setBookingDetails] = useState<any>(null);

    useEffect(() => {
        if (!mobileNumber) {
            router.push('/');
            return;
        }

        const storedBookingDetails = localStorage.getItem('bookingDetails');
        if (storedBookingDetails) {
            try {
                setBookingDetails(JSON.parse(storedBookingDetails));
            } catch (error) {
                console.error('Error parsing booking details from localStorage:', error);
            }
        }
    }, [mobileNumber, router]);

    if (!mobileNumber) {
        return <div>Redirecting...</div>;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <main className="flex flex-col items-center justify-center w-full flex-1 px-4 md:px-20 text-center">
                <Image src="/Images/LetsGo-W-slogan.png" width={400} height={100} alt="Let'sGo Rides" />

                <Card className="w-full max-w-md mt-10">
                    <CardHeader>
                        <CardTitle>Your Booking Details</CardTitle>
                        <CardDescription>
                            Here are your booking details for mobile number {mobileNumber}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        {bookingDetails ? (
                            <>
                                <p><strong>Mobile Number:</strong> {mobileNumber}</p>
                                <p><strong>Source:</strong> {bookingDetails.source}</p>
                                <p><strong>Destination:</strong> {bookingDetails.destination}</p>
                                <p><strong>Cab Type:</strong> {bookingDetails.cabType}</p>
                                <p><strong>Fare:</strong> ₹{bookingDetails.fare}</p>
                                <Button onClick={() => alert('Tracking feature not implemented yet.')}>Track Cab</Button>
                            </>
                        ) : (
                            <p>No bookings found for this mobile number.</p>
                        )}
                        <Link href="/" className="mt-4 text-sm text-muted-foreground hover:text-foreground">
                            Back to Home
                        </Link>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default UserDashboardPage;


