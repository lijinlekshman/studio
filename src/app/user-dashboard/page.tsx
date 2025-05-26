
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
import { Edit, Save, ArrowLeft, Calendar, Menu, LogOut } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";

interface LoggedInUser {
    email: string;
    name: string;
    mobile?: string; // mobile might be optional if not always present
    address?: string; // address might be set by user
}

const UserDashboardPage: React.FC = () => {
    const router = useRouter();
    const { toast } = useToast();
    
    const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null);
    const [bookingDetails, setBookingDetails] = useState<any>(null); // For the most recent booking after OTP
    const [showMap, setShowMap] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [userDetails, setUserDetails] = useState<LoggedInUser>({
        name: '',
        email: '',
        address: '',
        mobile: '',
    });
    const [tempDetails, setTempDetails] = useState<LoggedInUser>({ ...userDetails });
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [newProfileImageFile, setNewProfileImageFile] = useState<File | null>(null);
    const [activeMenu, setActiveMenu] = useState('my-profile');
    const [bookingHistory, setBookingHistory] = useState<any[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('loggedInUser');
            if (storedUser) {
                const parsedUser: LoggedInUser = JSON.parse(storedUser);
                setLoggedInUser(parsedUser);
                setUserDetails({
                    name: parsedUser.name || '',
                    email: parsedUser.email || '',
                    mobile: parsedUser.mobile || '',
                    address: localStorage.getItem(`userAddress_${parsedUser.email}`) || parsedUser.address || '',
                });
                setTempDetails({
                    name: parsedUser.name || '',
                    email: parsedUser.email || '',
                    mobile: parsedUser.mobile || '',
                    address: localStorage.getItem(`userAddress_${parsedUser.email}`) || parsedUser.address || '',
                });

                // Load profile image for the logged-in user
                const storedImg = localStorage.getItem(`profileImage_${parsedUser.email}`);
                if (storedImg) setProfileImage(storedImg);

                // Load all bookings and filter by logged-in user's email
                const allBookingsString = localStorage.getItem('bookings');
                if (allBookingsString) {
                    const allBookings = JSON.parse(allBookingsString);
                    const userBookings = allBookings.filter((booking: any) => booking.email === parsedUser.email);
                    setBookingHistory(userBookings);
                }
                 // Load the most recent booking details (typically after OTP flow)
                const recentBooking = localStorage.getItem('bookingDetails');
                if(recentBooking) {
                    const parsedRecentBooking = JSON.parse(recentBooking);
                    // Check if this booking belongs to the logged-in user
                    if(parsedRecentBooking.email === parsedUser.email) {
                        setBookingDetails(parsedRecentBooking);
                    }
                }


            } else {
                // No logged-in user found, redirect to user login
                router.push('/user-login');
            }
        }
    }, [router]);


    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('loggedInUser');
            // Optionally remove other user-specific data like profile image and address
            if (loggedInUser) {
                localStorage.removeItem(`profileImage_${loggedInUser.email}`);
                localStorage.removeItem(`userAddress_${loggedInUser.email}`);
            }
        }
        toast({ title: "Logged Out", description: "You have been successfully logged out." });
        router.push('/user-login');
    };

    useEffect(() => {
        // Update tempDetails when userDetails change (e.g., after initial load)
        setTempDetails({ ...userDetails });
    }, [userDetails]);


    if (!isClient || !loggedInUser) {
        return <div>Loading...</div>; // Or a more sophisticated loading state
    }


    const toggleMap = () => setShowMap(!showMap);
    const handleEditClick = () => setIsEditing(true);

    const handleCancelClick = () => {
        setIsEditing(false);
        setTempDetails({ ...userDetails }); // Reset tempDetails to current userDetails
        setNewProfileImageFile(null); // Reset new image file
        if (loggedInUser) { // Reload original profile image
             const storedImg = localStorage.getItem(`profileImage_${loggedInUser.email}`);
             if (storedImg) setProfileImage(storedImg);
             else setProfileImage(null);
        }
    };

    const handleSaveClick = () => {
        setUserDetails({ ...tempDetails });
        setIsEditing(false);

        if (typeof window !== 'undefined' && loggedInUser) {
            // Save updated name and email to loggedInUser in localStorage
            const updatedLoggedInUser = { ...loggedInUser, name: tempDetails.name, email: tempDetails.email, mobile: tempDetails.mobile, address: tempDetails.address };
            localStorage.setItem('loggedInUser', JSON.stringify(updatedLoggedInUser));
            setLoggedInUser(updatedLoggedInUser); // Update state

            // Save address separately if you want it more persistent per user email
            localStorage.setItem(`userAddress_${loggedInUser.email}`, tempDetails.address || '');


            // Handle profile image upload
            if (newProfileImageFile) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const newImageBase64 = reader.result as string;
                    localStorage.setItem(`profileImage_${loggedInUser.email}`, newImageBase64);
                    setProfileImage(newImageBase64); // Update displayed image
                    toast({ title: "Profile Image Updated" });
                };
                reader.readAsDataURL(newProfileImageFile);
                setNewProfileImageFile(null);
            }
             toast({ title: "Profile Updated", description: "Your profile has been updated successfully." });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTempDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewProfileImageFile(file);
            // Preview image
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as string); // Temporarily update profileImage for preview
            };
            reader.readAsDataURL(file);
        }
    };


    const renderContent = () => {
        if (!loggedInUser) return <p>Please log in to view your dashboard.</p>;

        switch (activeMenu) {
            case 'my-profile':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>User Profile</CardTitle>
                            <CardDescription>Manage your profile details.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <Avatar className="w-24 h-24">
                                    {profileImage ? (
                                        <AvatarImage src={profileImage} alt={userDetails.name} />
                                    ) : (
                                        <AvatarFallback>{userDetails.name?.charAt(0).toUpperCase()}{userDetails.name?.split(' ')[1]?.charAt(0).toUpperCase() || ''}</AvatarFallback>
                                    )}
                                </Avatar>
                            </div>

                            {isEditing ? (
                                <div className="grid gap-4">
                                    <div>
                                        <Label htmlFor="name">Name</Label>
                                        <Input type="text" id="name" name="name" value={tempDetails.name} onChange={handleInputChange} required />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input type="email" id="email" name="email" value={tempDetails.email} onChange={handleInputChange} required />
                                    </div>
                                     <div>
                                        <Label htmlFor="mobile">Mobile</Label>
                                        <Input type="tel" id="mobile" name="mobile" value={tempDetails.mobile} onChange={handleInputChange} />
                                    </div>
                                    <div>
                                        <Label htmlFor="address">Address</Label>
                                        <Input type="text" id="address" name="address" value={tempDetails.address || ''} onChange={handleInputChange} />
                                    </div>
                                    <div>
                                        <Label htmlFor="image">Upload New Profile Image</Label>
                                        <Input type="file" id="image" accept="image/*" onChange={handleImageChange} />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="secondary" onClick={handleCancelClick}>Cancel</Button>
                                        <Button onClick={handleSaveClick}><Save className="mr-2 h-4 w-4" /> Save</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    <div><Label>Name:</Label> <p>{userDetails.name}</p></div>
                                    <div><Label>Email:</Label> <p>{userDetails.email}</p></div>
                                    <div><Label>Mobile:</Label> <p>{userDetails.mobile || 'N/A'}</p></div>
                                    <div><Label>Address:</Label> <p>{userDetails.address || 'N/A'}</p></div>
                                    <Button onClick={handleEditClick}><Edit className="mr-2 h-4 w-4" /> Edit Profile</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            case 'booking-history':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Booking History</CardTitle>
                            <CardDescription>Here are your past and upcoming bookings.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {bookingHistory.length > 0 ? (
                                <ScrollArea className="w-full max-h-[400px]">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Time</TableHead>
                                                <TableHead>Source</TableHead>
                                                <TableHead>Destination</TableHead>
                                                <TableHead>Cab</TableHead>
                                                <TableHead>Fare</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {bookingHistory.map((booking) => (
                                                <TableRow key={booking.id}>
                                                    <TableCell>{booking.date}</TableCell>
                                                    <TableCell>{booking.time}</TableCell>
                                                    <TableCell>{booking.source}</TableCell>
                                                    <TableCell>{booking.destination}</TableCell>
                                                    <TableCell>{booking.cabModel}</TableCell>
                                                    <TableCell>₹{booking.fare}</TableCell>
                                                    <TableCell>{booking.status}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            ) : (
                                <p>No booking history found.</p>
                            )}
                        </CardContent>
                    </Card>
                );
            // Add other cases for 'payment-methods', 'settings' if needed
            default:
                return <p>Select a menu option.</p>;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <div className="w-64 bg-gray-200 p-4 flex flex-col justify-between">
                <nav>
                    <Link href="/" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-300 text-gray-700">
                        <ArrowLeft className="mr-2 inline-block h-5 w-5" /> Back to Home
                    </Link>
                    <hr className="my-4" />
                    <ul className="space-y-2">
                        <li><Button onClick={() => setActiveMenu('my-profile')} variant={activeMenu === 'my-profile' ? 'default' : 'ghost'} className="w-full justify-start">My Profile</Button></li>
                        <li><Button onClick={() => setActiveMenu('booking-history')} variant={activeMenu === 'booking-history' ? 'default' : 'ghost'} className="w-full justify-start">Booking History <Calendar className="ml-auto h-4 w-4" /></Button></li>
                        {/* Add other menu items here if needed */}
                    </ul>
                </nav>
                <Button onClick={handleLogout} variant="outline" className="w-full mt-auto">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
            </div>

            <main className="flex-1 p-6 overflow-auto">
                <div className="max-w-4xl mx-auto">
                    {renderContent()}

                    {/* Display most recent booking details if available */}
                    {bookingDetails && activeMenu !== 'booking-history' && (
                         <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Your Recent Booking Confirmed!</CardTitle>
                                <CardDescription>Mobile: {bookingDetails.mobileNumber}</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-2">
                                <p><strong>User:</strong> {bookingDetails.userName}</p>
                                <p><strong>Email:</strong> {bookingDetails.email}</p>
                                <p><strong>Source:</strong> {bookingDetails.source}</p>
                                <p><strong>Destination:</strong> {bookingDetails.destination}</p>
                                <p><strong>Cab Type:</strong> {bookingDetails.cabModel}</p>
                                <p><strong>Driver:</strong> {bookingDetails.driverName}</p>
                                <p><strong>Fare:</strong> ₹{bookingDetails.fare}</p>
                                <p><strong>Date:</strong> {bookingDetails.date} @ {bookingDetails.time}</p>
                                <p><strong>Status:</strong> {bookingDetails.status}</p>
                                <Button onClick={toggleMap} className="mt-2">
                                    {showMap ? 'Hide Map' : 'Track Cab (Simulation)'}
                                </Button>
                                {showMap && (
                                    <div className="mt-4 border rounded-lg overflow-hidden" style={{ height: '300px', width: '100%' }}>
                                        <ScrollArea className="h-full w-full">
                                        <iframe
                                            src={`https://www.google.com/maps/embed/v1/directions?key=YOUR_GOOGLE_MAPS_API_KEY&origin=${encodeURIComponent(bookingDetails.source)}&destination=${encodeURIComponent(bookingDetails.destination)}`}
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            allowFullScreen={true}
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        ></iframe>
                                        </ScrollArea>
                                        <div className="p-2 text-sm bg-gray-50">
                                            <p>Cab Location: Simulating route...</p>
                                            <p>Vehicle Number: {bookingDetails.cabModel === 'Sedan' ? 'KL01AB1234' : 'KL02CD5678'}</p>
                                            <p>Driver Name: {bookingDetails.driverName}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
};

export default UserDashboardPage;
