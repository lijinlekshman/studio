'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Save, ArrowLeft } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const UserDashboardPage: React.FC = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const mobileNumber = searchParams.get('mobileNumber');
    const [bookingDetails, setBookingDetails] = useState<any>(null);
    const [showMap, setShowMap] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [userDetails, setUserDetails] = useState({
        name: 'Anoop G',
        email: 'anoopg@example.com',
        address: 'Punalur, Kerala',
    });
    const [tempDetails, setTempDetails] = useState({ ...userDetails });
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [newProfileImage, setNewProfileImage] = useState<File | null>(null);
    const { toast } = useToast();

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
        // Load stored profile image from localStorage
        const storedProfileImage = localStorage.getItem('profileImage');
        if (storedProfileImage) {
            setProfileImage(storedProfileImage);
        }
    }, [mobileNumber, router]);

    useEffect(() => {
        setTempDetails({ ...userDetails });
    }, [userDetails]);

    if (!mobileNumber || !bookingDetails) {
        return <div>Loading...</div>;
    }

    const toggleMap = () => {
        setShowMap(!showMap);
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        setTempDetails({ ...userDetails });
    };

    const handleSaveClick = () => {
        setUserDetails({ ...tempDetails });
        setIsEditing(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTempDetails(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadImage = () => {
        if (newProfileImage) {
            // Save the new profile image to localStorage
            localStorage.setItem('profileImage', profileImage || '');
            toast({
                title: "Profile Image Updated",
                description: "Your profile image has been updated successfully.",
            });
        }
        setIsEditing(false);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Left Menu */}
            <div className="w-64 bg-gray-200 p-4">
                <nav>
                    <Link href="/" className="block py-2 text-blue-600 hover:text-blue-800">
                        <ArrowLeft className="mr-2 inline-block" /> Back to Home
                    </Link>
                    <hr className="my-4" />
                    <ul className="space-y-2">
                        <li>
                            <a href="#" className="block py-2 hover:bg-gray-300 rounded">
                                My Profile
                            </a>
                        </li>
                        <li>
                            <a href="#" className="block py-2 hover:bg-gray-300 rounded">
                                Booking History
                            </a>
                        </li>
                        <li>
                            <a href="#" className="block py-2 hover:bg-gray-300 rounded">
                                Payment Methods
                            </a>
                        </li>
                        <li>
                            <a href="#" className="block py-2 hover:bg-gray-300 rounded">
                                Settings
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-4">
                <div className="max-w-4xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Profile</CardTitle>
                            <CardDescription>
                                Manage your profile details.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <Avatar className="w-24 h-24">
                                    {profileImage ? (
                                        <AvatarImage src={profileImage} alt="User Avatar" />
                                    ) : (
                                        <AvatarFallback>UG</AvatarFallback>
                                    )}
                                </Avatar>
                            </div>

                            {isEditing ? (
                                <div className="grid gap-4">
                                    <div>
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={tempDetails.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={tempDetails.email}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="address">Address</Label>
                                        <Input
                                            type="text"
                                            id="address"
                                            name="address"
                                            value={tempDetails.address}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="image">Upload Image</Label>
                                        <Input
                                            type="file"
                                            id="image"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="secondary" onClick={handleCancelClick}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleUploadImage}>
                                            <Save className="mr-2 h-4 w-4" /> Save
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    <div>
                                        <Label>Name</Label>
                                        <p>{userDetails.name}</p>
                                    </div>
                                    <div>
                                        <Label>Email</Label>
                                        <p>{userDetails.email}</p>
                                    </div>
                                    <div>
                                        <Label>Address</Label>
                                        <p>{userDetails.address}</p>
                                    </div>
                                    <Button onClick={handleEditClick}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit Profile
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="mt-6">
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
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default UserDashboardPage;
