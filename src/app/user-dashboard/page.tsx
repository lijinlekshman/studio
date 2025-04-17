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

    // Dummy booking data for demonstration
    const [bookings, setBookings] = useState([
        {
            id: '1',
            source: 'Punalur',
            destination: 'Kollam',
            cabType: 'Sedan',
            fare: '₹600',
            driverName: 'Anoop',
            driverContact: '+919876543210',
            cabNumber: 'KL 01 AB 1234'
        }
    ]);

    useEffect(() => {
        // Check for mobileNumber, redirect if not present (optional)
        if (!mobileNumber) {
            router.push('/'); // Redirect to home page or another appropriate route
        }
    }, [mobileNumber, router]);

    if (!mobileNumber) {
        return <div>Redirecting...</div>; // Or a loading indicator
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <main className="flex flex-col items-center justify-center w-full flex-1 px-4 md:px-20 text-center">
                <Image src="/Images/LetsGo-W-slogan.png" width={400} height={100} alt="Let'sGo Rides" />

                <Card className="w-full max-w-md mt-10">
                    <CardHeader>
                        <CardTitle>Your Bookings</CardTitle>
                        <CardDescription>
                            Here are your booking details for mobile number {mobileNumber}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        {bookings.length > 0 ? (
                            bookings.map((booking) => (
                                <div key={booking.id} className="border rounded-md p-4">
                                    <p><strong>Source:</strong> {booking.source}</p>
                                    <p><strong>Destination:</strong> {booking.destination}</p>
                                    <p><strong>Cab Type:</strong> {booking.cabType}</p>
                                    <p><strong>Fare:</strong> {booking.fare}</p>
                                    <p><strong>Driver Name:</strong> {booking.driverName}</p>
                                    <p><strong>Driver Contact:</strong> {booking.driverContact}</p>
                                    <p><strong>Cab Number:</strong> {booking.cabNumber}</p>
                                    {/* Add a tracking feature button that redirects to a map with the cab's location. */}
                                    <Button onClick={() => alert('Tracking feature not implemented yet.')}>Track Cab</Button>
                                </div>
                            ))
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
