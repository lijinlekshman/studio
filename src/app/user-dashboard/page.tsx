
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // useSearchParams removed as not directly used here
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import Image from 'next/image'; // Image not used directly here
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Save, ArrowLeft, Calendar, LogOut, Menu } from 'lucide-react'; // Menu for mobile
import { useToast } from "@/hooks/use-toast";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet'; // For mobile sidebar

interface LoggedInUser {
    email: string;
    name: string;
    mobile?: string; 
    address?: string; 
}

const UserDashboardPage: React.FC = () => {
    const router = useRouter();
    const { toast } = useToast();
    
    const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null);
    const [bookingDetails, setBookingDetails] = useState<any>(null); 
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
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('loggedInUser');
            if (storedUser) {
                try {
                    const parsedUser: LoggedInUser = JSON.parse(storedUser);
                    setLoggedInUser(parsedUser);
                    const initialUserDetails = {
                        name: parsedUser.name || '',
                        email: parsedUser.email || '',
                        mobile: parsedUser.mobile || '',
                        address: localStorage.getItem(`userAddress_${parsedUser.email}`) || parsedUser.address || '',
                    };
                    setUserDetails(initialUserDetails);
                    setTempDetails(initialUserDetails); // Initialize tempDetails

                    const storedImg = localStorage.getItem(`profileImage_${parsedUser.email}`);
                    if (storedImg) setProfileImage(storedImg);

                    const allBookingsString = localStorage.getItem('bookings');
                    if (allBookingsString) {
                        const allBookings = JSON.parse(allBookingsString);
                        const userBookings = allBookings.filter((booking: any) => booking.email === parsedUser.email);
                        setBookingHistory(userBookings);
                    }
                    const recentBooking = localStorage.getItem('bookingDetails');
                    if(recentBooking) {
                        const parsedRecentBooking = JSON.parse(recentBooking);
                        if(parsedRecentBooking.email === parsedUser.email) {
                            setBookingDetails(parsedRecentBooking);
                        }
                    }
                } catch (error) {
                    console.error("Error parsing user data from localStorage", error);
                    toast({ title: "Error", description: "Could not load user data.", variant: "destructive" });
                    router.push('/user-login');
                }
            } else {
                router.push('/user-login');
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, toast]); // toast was missing


    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('loggedInUser');
            if (loggedInUser) {
                localStorage.removeItem(`profileImage_${loggedInUser.email}`);
                localStorage.removeItem(`userAddress_${loggedInUser.email}`);
                 localStorage.removeItem('bookingDetails'); // Clear recent booking on logout
            }
        }
        toast({ title: "Logged Out", description: "You have been successfully logged out." });
        router.push('/user-login');
    };
    
    useEffect(() => {
        setTempDetails({ ...userDetails });
    }, [userDetails]);


    if (!isClient || !loggedInUser) {
        return <div className="flex items-center justify-center min-h-screen"><p>Loading dashboard...</p></div>;
    }

    const toggleMap = () => setShowMap(!showMap);
    const handleEditClick = () => setIsEditing(true);

    const handleCancelClick = () => {
        setIsEditing(false);
        setTempDetails({ ...userDetails }); 
        setNewProfileImageFile(null); 
        if (loggedInUser) { 
             const storedImg = localStorage.getItem(`profileImage_${loggedInUser.email}`);
             if (storedImg) setProfileImage(storedImg);
             else setProfileImage(null);
        }
    };

    const handleSaveClick = () => {
        setUserDetails({ ...tempDetails });
        setIsEditing(false);

        if (typeof window !== 'undefined' && loggedInUser) {
            const updatedLoggedInUser = { ...loggedInUser, name: tempDetails.name, email: tempDetails.email, mobile: tempDetails.mobile, address: tempDetails.address };
            localStorage.setItem('loggedInUser', JSON.stringify(updatedLoggedInUser));
            setLoggedInUser(updatedLoggedInUser); 

            localStorage.setItem(`userAddress_${loggedInUser.email}`, tempDetails.address || '');

            if (newProfileImageFile) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const newImageBase64 = reader.result as string;
                    localStorage.setItem(`profileImage_${loggedInUser.email}`, newImageBase64);
                    setProfileImage(newImageBase64); 
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
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as string); 
            };
            reader.readAsDataURL(file);
        }
    };

    const renderSidebarContent = () => (
        <nav className="flex flex-col h-full">
            <Link href="/" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-300 text-gray-700 text-sm">
                <ArrowLeft className="mr-2 inline-block h-4 w-4" /> Back to Home
            </Link>
            <hr className="my-2" />
            <ul className="space-y-1">
                <li><Button onClick={() => { setActiveMenu('my-profile'); setIsMobileSidebarOpen(false); }} variant={activeMenu === 'my-profile' ? 'secondary' : 'ghost'} className="w-full justify-start text-sm">My Profile</Button></li>
                <li><Button onClick={() => { setActiveMenu('booking-history'); setIsMobileSidebarOpen(false); }} variant={activeMenu === 'booking-history' ? 'secondary' : 'ghost'} className="w-full justify-start text-sm">Booking History <Calendar className="ml-auto h-4 w-4" /></Button></li>
            </ul>
            <Button onClick={handleLogout} variant="outline" className="w-full mt-auto text-sm">
                <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
        </nav>
    );


    const renderContent = () => {
        if (!loggedInUser) return <p>Please log in to view your dashboard.</p>;

        switch (activeMenu) {
            case 'my-profile':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">User Profile</CardTitle>
                            <CardDescription>Manage your profile details.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex flex-col items-center sm:items-start">
                                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 mb-2">
                                    {profileImage ? (
                                        <AvatarImage src={profileImage} alt={userDetails.name} />
                                    ) : (
                                        <AvatarFallback className="text-2xl sm:text-3xl">{userDetails.name?.charAt(0).toUpperCase()}{(userDetails.name?.split(' ')[1]?.charAt(0) || '').toUpperCase()}</AvatarFallback>
                                    )}
                                </Avatar>
                                 {isEditing && (
                                     <Label htmlFor="image" className="text-sm text-primary cursor-pointer hover:underline">Change Photo
                                        <Input type="file" id="image" accept="image/*" onChange={handleImageChange} className="hidden" />
                                     </Label>
                                 )}
                            </div>

                            {isEditing ? (
                                <div className="grid gap-4">
                                    <div className="grid gap-1">
                                        <Label htmlFor="name" className="text-sm">Name</Label>
                                        <Input type="text" id="name" name="name" value={tempDetails.name} onChange={handleInputChange} required className="text-sm"/>
                                    </div>
                                    <div className="grid gap-1">
                                        <Label htmlFor="email" className="text-sm">Email</Label>
                                        <Input type="email" id="email" name="email" value={tempDetails.email} onChange={handleInputChange} required className="text-sm"/>
                                    </div>
                                     <div className="grid gap-1">
                                        <Label htmlFor="mobile" className="text-sm">Mobile</Label>
                                        <Input type="tel" id="mobile" name="mobile" value={tempDetails.mobile} onChange={handleInputChange} className="text-sm"/>
                                    </div>
                                    <div className="grid gap-1">
                                        <Label htmlFor="address" className="text-sm">Address</Label>
                                        <Input type="text" id="address" name="address" value={tempDetails.address || ''} onChange={handleInputChange} className="text-sm"/>
                                    </div>
                                   
                                    <div className="flex justify-end gap-2 mt-2">
                                        <Button variant="outline" onClick={handleCancelClick} size="sm">Cancel</Button>
                                        <Button onClick={handleSaveClick} size="sm"><Save className="mr-1.5 h-4 w-4" /> Save</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid gap-3 text-sm">
                                    <div><Label className="font-semibold">Name:</Label> <p className="inline">{userDetails.name}</p></div>
                                    <div><Label className="font-semibold">Email:</Label> <p className="inline">{userDetails.email}</p></div>
                                    <div><Label className="font-semibold">Mobile:</Label> <p className="inline">{userDetails.mobile || 'N/A'}</p></div>
                                    <div><Label className="font-semibold">Address:</Label> <p className="inline">{userDetails.address || 'N/A'}</p></div>
                                    <Button onClick={handleEditClick} size="sm" className="mt-2 w-full sm:w-auto"><Edit className="mr-1.5 h-4 w-4" /> Edit Profile</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            case 'booking-history':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Booking History</CardTitle>
                            <CardDescription>Here are your past and upcoming bookings.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {bookingHistory.length > 0 ? (
                                <ScrollArea className="w-full max-h-[300px] sm:max-h-[400px]">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-xs">Date</TableHead>
                                                <TableHead className="text-xs">Time</TableHead>
                                                <TableHead className="text-xs">Source</TableHead>
                                                <TableHead className="text-xs">Destination</TableHead>
                                                <TableHead className="text-xs">Cab</TableHead>
                                                <TableHead className="text-xs">Fare</TableHead>
                                                <TableHead className="text-xs">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {bookingHistory.sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime()).map((booking) => (
                                                <TableRow key={booking.id}>
                                                    <TableCell className="text-xs">{booking.date}</TableCell>
                                                    <TableCell className="text-xs">{booking.time}</TableCell>
                                                    <TableCell className="text-xs">{booking.source}</TableCell>
                                                    <TableCell className="text-xs">{booking.destination}</TableCell>
                                                    <TableCell className="text-xs">{booking.cabModel}</TableCell>
                                                    <TableCell className="text-xs">₹{booking.fare}</TableCell>
                                                    <TableCell className="text-xs">{booking.status}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            ) : (
                                <p className="text-sm">No booking history found.</p>
                            )}
                        </CardContent>
                    </Card>
                );
            default:
                return <p className="text-sm">Select a menu option.</p>;
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gray-100">
            {/* Mobile Header with Menu Button */}
            <header className="md:hidden p-4 bg-gray-200 border-b border-gray-300 flex items-center justify-between">
                <h1 className="text-lg font-semibold">User Dashboard</h1>
                 <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0 bg-gray-200">
                        {renderSidebarContent()}
                    </SheetContent>
                </Sheet>
            </header>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-60 bg-gray-200 p-4 flex-col justify-between border-r border-gray-300">
                {renderSidebarContent()}
            </aside>

            <main className="flex-1 p-4 sm:p-6 overflow-auto">
                <div className="max-w-4xl mx-auto">
                    {renderContent()}

                    {bookingDetails && activeMenu !== 'booking-history' && (
                         <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="text-lg sm:text-xl">Your Recent Booking Confirmed!</CardTitle>
                                <CardDescription className="text-sm">Mobile: {bookingDetails.mobileNumber}</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-1 sm:gap-2 text-xs sm:text-sm">
                                <p><strong>User:</strong> {bookingDetails.userName}</p>
                                <p><strong>Email:</strong> {bookingDetails.email}</p>
                                <p><strong>Source:</strong> {bookingDetails.source}</p>
                                <p><strong>Destination:</strong> {bookingDetails.destination}</p>
                                <p><strong>Cab Type:</strong> {bookingDetails.cabModel}</p>
                                <p><strong>Driver:</strong> {bookingDetails.driverName}</p>
                                <p><strong>Fare:</strong> ₹{bookingDetails.fare}</p>
                                <p><strong>Date:</strong> {bookingDetails.date} @ {bookingDetails.time}</p>
                                <p><strong>Status:</strong> {bookingDetails.status}</p>
                                <Button onClick={toggleMap} size="sm" className="mt-2 w-full sm:w-auto">
                                    {showMap ? 'Hide Map' : 'Track Cab (Simulation)'}
                                </Button>
                                {showMap && (
                                    <div className="mt-4 border rounded-lg overflow-hidden h-[250px] sm:h-[300px] w-full">
                                        <ScrollArea className="h-full w-full">
                                        <iframe
                                            src={`https://www.google.com/maps/embed/v1/directions?key=YOUR_GOOGLE_MAPS_API_KEY&origin=${encodeURIComponent(bookingDetails.source)}&destination=${encodeURIComponent(bookingDetails.destination)}`}
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            allowFullScreen={true}
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            title="Cab Route Map"
                                        ></iframe>
                                        </ScrollArea>
                                        <div className="p-2 text-xs bg-gray-50">
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
