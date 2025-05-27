
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Address, Coordinate, getCurrentLocation, getAddressForCoordinate } from '@/services/map';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Map } from 'lucide-react';
import { suggestDestinations } from '@/ai/flows/suggest-destinations';
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { calculateDistance } from '@/ai/flows/calculate-fare';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from 'next/navigation';


export default function BookRidePage() {
    const [source, setSource] = useState<Coordinate | null>(null);
    const [destination, setDestination] = useState<Coordinate | null>(null);
    const [fare, setFare] = useState<number | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [sourceAddress, setSourceAddress] = useState<Address | null>(null);
    const [destinationAddress, setDestinationAddress] = useState<Address | null>(null);
    const [suggestedSources, setSuggestedSources] = useState<any[]>([]);
    const [suggestedDestinations, setSuggestedDestinations] = useState<any[]>([]);
    const { toast } = useToast();
    const [vehicleType, setVehicleType] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const router = useRouter();
    const [selectedSourceValue, setSelectedSourceValue] = useState<string | null>(null);
    const [selectedDestinationValue, setSelectedDestinationValue] = useState<string | null>(null);
    const [user, setUser] = useState('');
    const [email, setEmail] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const [availableCabs, setAvailableCabs] = useState<any[]>([]);
    const [currentFares, setCurrentFares] = useState<any[]>([]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('authToken');
            setIsAuthenticated(!!token);

            try {
                const storedCabs = localStorage.getItem('cabs');
                if (storedCabs) {
                    setAvailableCabs(JSON.parse(storedCabs));
                } else {
                    setAvailableCabs([]); 
                }
            } catch (error) {
                console.error("Failed to parse availableCabs from localStorage", error);
                setAvailableCabs([]);
            }
            try {
                const storedFares = localStorage.getItem('fares');
                if (storedFares) {
                    const parsedFares = JSON.parse(storedFares);
                    setCurrentFares(parsedFares);
                    if (!vehicleType && parsedFares.length > 0) {
                        // Ensure a valid default vehicle type if available
                        const firstValidFare = parsedFares.find((f: any) => f.vehicleType && f.vehicleType.trim() !== "");
                        if (firstValidFare) {
                            setVehicleType(firstValidFare.vehicleType);
                        }
                    }
                } else {
                    setCurrentFares([]);
                }
            } catch (error) {
                console.error("Failed to parse currentFares from localStorage", error);
                setCurrentFares([]);
            }
        }
    }, [vehicleType]); // Keep vehicleType dependency to re-evaluate default if it changes externally

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
        }
        setIsAuthenticated(false);
        router.push('/'); 
    };


    const fetchSuggestedSources = useCallback(async () => {
        try {
            const location = await getCurrentLocation(); 
            const destinations = await suggestDestinations({ currentLocation: location, pastRideHistory: [] });
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
            const location = await getCurrentLocation(); 
            const destinations = await suggestDestinations({ currentLocation: location, pastRideHistory: [] });
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
            try {
                const location = await getCurrentLocation();
                setSource(location);
            } catch (e) {
                console.error(e);
            }
        };

        fetchCurrentLocation();
        fetchSuggestedSources();
        fetchSuggestedDestinations();
    }, [fetchSuggestedSources, fetchSuggestedDestinations]);

    useEffect(() => {
        const fetchSourceAddress = async () => {
            if (source) {
                try {
                    const address = await getAddressForCoordinate(source);
                    setSourceAddress(address);
                } catch (e) {
                    console.error(e);
                }
            }
        };

        fetchSourceAddress();
    }, [source]);

    useEffect(() => {
        const fetchDestinationAddress = async () => {
            if (destination) {
                try {
                    const address = await getAddressForCoordinate(destination);
                    setDestinationAddress(address);
                } catch (e) {
                    console.error(e);
                }
            }
        };

        fetchDestinationAddress();
    }, [destination]);


    useEffect(() => {
        const estimateFare = async () => {
            if (source && destination && vehicleType && currentFares.length > 0) {
                try {
                    const distanceResult = await calculateDistance({
                        sourceLat: source.lat,
                        sourceLng: source.lng,
                        destinationLat: destination.lat,
                        destinationLng: destination.lng,
                    });
                    
                    setDistance(distanceResult.distance);

                    const selectedFareRule = currentFares.find(f => f.vehicleType === vehicleType);

                    if (selectedFareRule) {
                        const calculatedFare = selectedFareRule.baseFare + (distanceResult.distance * selectedFareRule.perKmRate);
                        setFare(calculatedFare);
                    } else {
                        setFare(null); 
                        if(vehicleType){ // Only toast if a vehicle type was actually selected but no rule found
                           toast({
                                title: "Fare Calculation Error",
                                description: `No fare rule found for ${vehicleType}. Please check admin settings.`,
                                variant: "destructive",
                            });
                        }
                    }

                } catch (error: any) {
                    toast({
                        title: "Error calculating fare/distance",
                        description: error.message,
                        variant: "destructive",
                    });
                    console.error('Error calculating fare/distance:', error);
                    setFare(null);
                    setDistance(null);
                }
            } else {
                setFare(null);
                setDistance(null);
            }
        };

        estimateFare();
    }, [source, destination, vehicleType, currentFares, toast]);

    const [sourceInput, setSourceInput] = useState('');
    const [destinationInput, setDestinationInput] = useState('');

    const handleSourceSelect = async (selectedSourceName: string) => {
        const selected = suggestedSources.find(src => src.name === selectedSourceName);
        if (selected) {
            setSource({ lat: selected.lat, lng: selected.lng });
            setSourceInput(selected.name);
            setSelectedSourceValue(selected.name);
            try {
                const address = await getAddressForCoordinate({ lat: selected.lat, lng: selected.lng });
                setSourceAddress(address);
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handleDestinationSelect = async (selectedDestinationName: string) => {
         const selected = suggestedDestinations.find(dest => dest.name === selectedDestinationName);
        if (selected) {
            setDestination({ lat: selected.lat, lng: selected.lng });
            setDestinationInput(selected.name);
            setSelectedDestinationValue(selected.name);
            try {
                const address = await getAddressForCoordinate({ lat: selected.lat, lng: selected.lng });
                setDestinationAddress(address);
            } catch (e) {
                console.error(e);
            }
        }
    };

    const generateUniqueId = () => {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    };

    const bookCab = () => {
        if (source && destination && mobileNumber && fare && selectedSourceValue && selectedDestinationValue && user && email && vehicleType) {
            const bookingDateTime = new Date();
            const bookingDate = bookingDateTime.toLocaleDateString();
            const bookingTime = bookingDateTime.toLocaleTimeString();

            const selectedCabDetails = availableCabs.find(cab => cab.model === vehicleType);
            const driverName = selectedCabDetails ? selectedCabDetails.driverName : 'Not Assigned';

            const newBooking = {
                id: generateUniqueId(),
                mobileNumber: mobileNumber,
                user: user,
                userName: user, 
                email: email,       
                source: selectedSourceValue,
                destination: selectedDestinationValue,
                cabModel: vehicleType,
                fare: fare.toFixed(2),
                driverName: driverName, 
                date: bookingDate,  
                time: bookingTime,  
                status: 'Confirmed', 
            };

            if (typeof window !== 'undefined') {
                let existingBookings = [];
                try {
                    existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
                } catch (error) {
                    console.error("Error parsing existing bookings from localStorage", error);
                    existingBookings = []; 
                }
                existingBookings.push(newBooking);
                localStorage.setItem('bookings', JSON.stringify(existingBookings));
                localStorage.setItem('bookingDetails', JSON.stringify(newBooking));
            }

            router.push(`/otp?mobileNumber=${mobileNumber}`);

        } else {
            let missingFields = [];
            if (!source) missingFields.push("source");
            if (!destination) missingFields.push("destination");
            if (!mobileNumber) missingFields.push("mobile number");
            if (fare === null) missingFields.push("fare calculation (ensure source/destination/vehicle type are set)");
            if (!selectedSourceValue) missingFields.push("source selection");
            if (!selectedDestinationValue) missingFields.push("destination selection");
            if (!user) missingFields.push("user name");
            if (!email) missingFields.push("email");
            if (!vehicleType) missingFields.push("vehicle type");
            
            toast({
                title: "Error Booking Cab",
                description: `Please fill in all required fields: ${missingFields.join(', ')}.`,
                variant: "destructive",
            });
        }
    };

    const handleBookCabClick = () => {
        bookCab();
    };

    

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <div className="absolute top-4 left-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
            </div>
            <main id="booking-section" className="flex flex-col items-center justify-center w-full flex-1 px-4 md:px-20 text-center relative">
                <Card className="w-full max-w-md mt-10">
                    <CardHeader>
                        <CardTitle>Book a Ride</CardTitle>
                        <CardDescription>Enter your source and destination to book a cab.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                         <div className="grid gap-2">
                            <label htmlFor="user">User</label>
                            <Input
                                type="text"
                                id="user"
                                placeholder="Enter your user"
                                value={user}
                                onChange={(e) => setUser(e.target.value)}
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
                            <label htmlFor="source">Source</label>
                            <Select 
                                onValueChange={(value) => handleSourceSelect(value)} 
                                required 
                                value={selectedSourceValue || ""}
                            >
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
                            <Select 
                                onValueChange={(value) => handleDestinationSelect(value)} 
                                required 
                                value={selectedDestinationValue || ""}
                            >
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
                            <Select 
                                onValueChange={setVehicleType} 
                                value={vehicleType} 
                                required
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select vehicle type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Type</SelectLabel>
                                        {currentFares
                                            .filter(fareRule => fareRule.vehicleType && fareRule.vehicleType.trim() !== "")
                                            .map((fareRule) => (
                                            <SelectItem key={fareRule.id} value={fareRule.vehicleType}>
                                                {fareRule.vehicleType}
                                            </SelectItem>
                                        ))}
                                        {currentFares.filter(fareRule => fareRule.vehicleType && fareRule.vehicleType.trim() !== "").length === 0 && 
                                            <SelectItem value="--no-vehicle-types--" disabled>No vehicle types available</SelectItem>
                                        }
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
                        <Button onClick={handleBookCabClick} disabled={!source || !destination || !mobileNumber || !user || !email || !vehicleType || fare === null}>Book Cab <Map className="ml-2" /></Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

