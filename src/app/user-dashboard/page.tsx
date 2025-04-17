'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const UserDashboardPage: React.FC = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const mobileNumber = searchParams.get('mobileNumber');
    const [bookingDetails, setBookingDetails] = useState<any>(null);
    const [showMap, setShowMap] = useState(false);

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

    if (!mobileNumber || !bookingDetails) {
        return <div>Loading...</div>;
    }

    const toggleMap = () => {
        setShowMap(!showMap);
    };

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
                                <p><strong>User ID:</strong> {bookingDetails.userId}</p>
                                <p><strong>Source:</strong> {bookingDetails.source}</p>
                                <p><strong>Destination:</strong> {bookingDetails.destination}</p>
                                <p><strong>Cab Type:</strong> {bookingDetails.cabModel}</p>
                                <p><strong>Fare:</strong> ₹{bookingDetails.fare}</p>
                                <Button onClick={toggleMap}>
                                    {showMap ? 'Hide Map' : 'Track Cab'}
                                </Button>
                                {showMap && (
                                    <div style={{ width: '100%', height: '400px' }}>
                                        <ScrollArea>
                                        {/* Replace with actual Google Maps integration */}
                                        <iframe
                                            src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15764.868434407826!2d76.9127246!3d9.0344791!2m3!1f0!2f0!3f0!3m2!1sen!2sin!4v1718956825276!5m2!1sen!2sin"
                                            width="100%"
                                            height="400"
                                            style={{ border: 0 }}
                                            allowFullScreen={true}
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        />
                                        </ScrollArea>
                                        <p>Cab Location: Placeholder - Punalur, Kerala</p>
                                        <p>Vehicle Number: KL01AB1234</p>
                                        <p>Driver Name: Anoop</p>
                                    </div>
                                )}
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

