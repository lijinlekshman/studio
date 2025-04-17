'use client';

import {useEffect, useState, useCallback} from 'react';
import {Address, Coordinate, getCurrentLocation, getAddressForCoordinate} from '@/services/map';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Map} from 'lucide-react';
import {suggestDestinations} from '@/ai/flows/suggest-destinations';
import {useToast} from "@/hooks/use-toast";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {calculateFare} from '@/ai/flows/calculate-fare';
import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue} from "@/components/ui/select";
import { useRouter } from 'next/navigation';
import { Menu, Home } from "lucide-react";



export default function BookRidePage() {
    const [source, setSource] = useState<Coordinate | null>(null);
    const [destination, setDestination] = useState<Coordinate | null>(null);
    const [fare, setFare] = useState<number | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [sourceAddress, setSourceAddress] = useState<Address | null>(null);
    const [destinationAddress, setDestinationAddress] = useState<Address | null>(null);
    const [suggestedSources, setSuggestedSources] = useState<any[]>([]);
    const [suggestedDestinations, setSuggestedDestinations] = useState<any[]>([]);
    const {toast} = useToast();
    const [vehicleType, setVehicleType] = useState('sedan'); // Default vehicle type
    const [mobileNumber, setMobileNumber] = useState(''); // Mobile number state
    const router = useRouter();
    const [selectedSourceValue, setSelectedSourceValue] = useState<string | null>(null);
    const [selectedDestinationValue, setSelectedDestinationValue] = useState<string | null>(null);
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [userId, setUserId] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

        useEffect(() => {
        // Check if the user is authenticated (e.g., check for a token in local storage)
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('authToken');
            setIsAuthenticated(!!token);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        router.push('/'); // Redirect to home after logout
    };


    const fetchSuggestedSources = useCallback(async () => {
        try {
            const location = await getCurrentLocation(); // Use current location as a fallback
            const destinations = await suggestDestinations({currentLocation: location, pastRideHistory: []});
            setSuggestedSources(destinations);
        } catch (error: any) {
            toast({
                title: "Error fetching sources",
                description: error.message,
                variant: "destructive",
            });
            console.error('Error fetching sources:', error);
        }
    }, [toast]);

    const fetchSuggestedDestinations = useCallback(async () => {
        try {
            const location = await getCurrentLocation(); // Use current location as a fallback
            const destinations = await suggestDestinations({currentLocation: location, pastRideHistory: []});
            setSuggestedDestinations(destinations);
        } catch (error: any) {
            toast({
                title: "Error fetching destinations",
                description: error.message,
                variant: "destructive",
            });
            console.error('Error fetching destinations:', error);
        }
    }, [toast]);

    useEffect(() => {
        const fetchCurrentLocation = async () => {
            const location = await getCurrentLocation();
            setSource(location);
        };

        fetchCurrentLocation();
        fetchSuggestedSources();
        fetchSuggestedDestinations();
    }, [fetchSuggestedSources, fetchSuggestedDestinations]);

    useEffect(() => {
        const fetchSourceAddress = async () => {
            if (source) {
                const address = await getAddressForCoordinate(source);
                setSourceAddress(address);
            }
        };

        fetchSourceAddress();
    }, [source]);

    useEffect(() => {
        const estimateFare = async () => {
            if (source && destination) {
                try {
                    const fareDetails = await calculateFare({
                        sourceLat: source.lat,
                        sourceLng: source.lng,
                        destinationLat: destination.lat,
                        destinationLng: destination.lng,
                    });
                    let calculatedFare = fareDetails.fare;

                    // Adjust fare based on vehicle type
                    switch (vehicleType) {
                        case 'sedan':
                            calculatedFare *= 1; // Base fare
                            break;
                        case 'suv':
                            calculatedFare *= 1.5; // 50% higher
                            break;
                        case 'mini':
                            calculatedFare *= 0.8; // 20% lower
                            break;
                        default:
                            break;
                    }

                    setFare(calculatedFare);
                    setDistance(fareDetails.distance);
                } catch (error: any) {
                    toast({
                        title: "Error calculating fare",
                        description: error.message,
                        variant: "destructive",
                    });
                    console.error('Error calculating fare:', error);
                }
            }
        };

        estimateFare();
    }, [source, destination, vehicleType]);

    const [sourceInput, setSourceInput] = useState('');
    const [destinationInput, setDestinationInput] = useState('');

    const handleSourceSelect = async (selectedSource: any) => {
        setSource({ lat: selectedSource.lat, lng: selectedSource.lng });
        setSourceInput(selectedSource.name);
        setSelectedSourceValue(selectedSource.name);
        const address = await getAddressForCoordinate({ lat: selectedSource.lat, lng: selectedSource.lng });
        setSourceAddress(address);
    };

    const handleDestinationSelect = async (selectedDestination: any) => {
        setDestination({ lat: selectedDestination.lat, lng: selectedDestination.lng });
        setDestinationInput(selectedDestination.name);
        setSelectedDestinationValue(selectedDestination.name);
        const address = await getAddressForCoordinate({ lat: selectedSource.lat, lng: selectedSource.lng });
        setDestinationAddress(address);
    };

    const generateUniqueId = () => {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    };

    const bookCab = () => {
        if (source && destination && mobileNumber && fare && selectedSourceValue && selectedDestinationValue && userId && userName && email) {
            // Get current date and time
            const bookingDateTime = new Date();
            const bookingDate = bookingDateTime.toLocaleDateString();
            const bookingTime = bookingDateTime.toLocaleTimeString();

            // Store booking details
            const newBooking = {
                id: generateUniqueId(),
                mobileNumber: mobileNumber,
                userId: userId,
                userName: userName, // Added user name
                email: email,       // Added email
                source: selectedSourceValue,
                destination: selectedDestinationValue,
                cabModel: vehicleType,
                fare: fare.toFixed(2),
                driverName: 'Anoop', // Placeholder
                date: bookingDate,   // Add booking date
                time: bookingTime,   // Add booking time
                status: 'Confirmed', // Set initial status
            };

            // Save booking details to local storage

            let existingBookings = JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('bookings') || '[]' : '[]');
            existingBookings.push(newBooking);
            if (typeof window !== 'undefined') {
                localStorage.setItem('bookings', JSON.stringify(existingBookings));
            }

            if (typeof window !== 'undefined') {
                localStorage.setItem('bookingDetails', JSON.stringify(newBooking));
            }

            // Redirect to user dashboard with booking details
            //router.push(`/user-dashboard?mobileNumber=${mobileNumber}`);
            router.push(`/otp?mobileNumber=${mobileNumber}`);

        } else {
            toast({
                title: "Error Booking Cab",
                description: "Please select both source and destination, and enter your mobile number, User ID, User Name and Email.",
                variant: "destructive",
            });
        }
    };

    const handleBookCabClick = () => {
        if (selectedSourceValue && selectedDestinationValue) {
            bookCab();
        } else {
            toast({
                title: "Booking Error",
                description: "Please select both source and destination.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">

            <div className="absolute top-4 right-4 flex items-center space-x-2">
                <Link href="/">
                    <Button variant="secondary">
                        <Home className="mr-2" />
                        Home
                    </Button>
                </Link>

                
            </div>

            <main id="booking-section" className="flex flex-col items-center justify-center w-full flex-1 px-4 md:px-20 text-center relative">


                <Card className="w-full max-w-md mt-10">
                    <CardHeader>
                        <CardTitle>Book a Ride</CardTitle>
                        <CardDescription>Enter your source and destination to book a cab.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                         <div className="grid gap-2">
                            <label htmlFor="userName">User Name</label>
                            <Input
                                type="text"
                                id="userName"
                                placeholder="Enter your user name"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                required
                            />
                        </div>
                         <div className="grid gap-2">
                            <label htmlFor="email">Email</label>
                            <Input
                                type="email"
                                id="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="mobileNumber">Mobile Number</label>
                            <Input
                                type="tel"
                                id="mobileNumber"
                                placeholder="Enter your mobile number"
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="userId">User ID</label>
                            <Input
                                type="text"
                                id="userId"
                                placeholder="Enter User ID"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="source">Source</label>
                            <Select onValueChange={(value) => {
                                const selectedSource = suggestedSources.find(src => src.name === value);
                                if (selectedSource) {
                                    handleSourceSelect(selectedSource);
                                }
                            }} required value={selectedSourceValue || ""} >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select source" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Source</SelectLabel>
                                        {suggestedSources.map((src) => (
                                            <SelectItem key={src.name} value={src.name}>
                                                {src.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="destination">Destination</label>
                            <Select onValueChange={(value) => {
                                const selectedDestination = suggestedDestinations.find(dest => dest.name === value);
                                if (selectedDestination) {
                                    handleDestinationSelect(selectedDestination);
                                }
                            }} required value={selectedDestinationValue || ""}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select destination" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Destination</SelectLabel>
                                        {suggestedDestinations.map((dest) => (
                                            <SelectItem key={dest.name} value={dest.name}>
                                                {dest.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="vehicleType">Vehicle Type</label>
                            <Select onValueChange={setVehicleType} defaultValue={vehicleType} required>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select vehicle type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Type</SelectLabel>
                                        <SelectItem value="sedan">Sedan</SelectItem>
                                        <SelectItem value="suv">SUV</SelectItem>
                                        <SelectItem value="mini">Mini</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        {fare !== null && (
                            <div className="grid gap-2">
                                <label htmlFor="fare">Estimated Fare</label>
                                <Input
                                    type="text"
                                    id="fare"
                                    value={`₹${fare.toFixed(2)}`}
                                    disabled
                                />
                            </div>
                        )}
                        {distance !== null && (
                            <div className="grid gap-2">
                                <label htmlFor="distance">Distance</label>
                                <Input
                                    type="text"
                                    id="distance"
                                    value={`${distance.toFixed(2)} km`}
                                    disabled
                                />
                            </div>
                        )}
                        <Button onClick={handleBookCabClick} disabled={!source || !destination || !mobileNumber || !userId || !userName || !email}>Book Cab <Map className="ml-2"/></Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

