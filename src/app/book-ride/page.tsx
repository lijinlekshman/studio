
'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Address, Coordinate } from '@/services/map'; // Ensure type import
import { getCurrentLocation, getAddressForCoordinate } from '@/services/map';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Map as MapIcon } from 'lucide-react'; // Renamed Map to MapIcon to avoid conflict
import { suggestDestinations } from '@/ai/flows/suggest-destinations';
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { calculateDistance } from '@/ai/flows/calculate-fare'; // Corrected import path
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
    const [mapUrl, setMapUrl] = useState<string>('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('authToken');
            setIsAuthenticated(!!token);

            try {
                const storedCabs = localStorage.getItem('cabs');
                setAvailableCabs(storedCabs ? JSON.parse(storedCabs) : []);
            } catch (error) {
                console.error("Failed to parse availableCabs from localStorage", error);
                setAvailableCabs([]);
            }
            try {
                const storedFares = localStorage.getItem('fares');
                const parsedFares = storedFares ? JSON.parse(storedFares) : [];
                setCurrentFares(parsedFares);
                if (!vehicleType && parsedFares.length > 0) {
                    const firstValidFare = parsedFares.find((f: any) => f.vehicleType && f.vehicleType.trim() !== "");
                    if (firstValidFare) {
                        setVehicleType(firstValidFare.vehicleType);
                    }
                }
            } catch (error) {
                console.error("Failed to parse currentFares from localStorage", error);
                setCurrentFares([]);
            }
        }
    }, [vehicleType]); // Added vehicleType to dependencies

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
                        if(vehicleType){
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

     useEffect(() => {
        // Update map URL when source or destination changes
        const apiKey = "YOUR_GOOGLE_MAPS_API_KEY"; // IMPORTANT: Replace with your actual API key
        if (source && destination) {
            setMapUrl(`https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${source.lat},${source.lng}&destination=${destination.lat},${destination.lng}&mode=driving`);
        } else if (source) {
            setMapUrl(`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${source.lat},${source.lng}`);
        } else if (destination) {
            setMapUrl(`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${destination.lat},${destination.lng}`);
        } else {
            // Default map view (e.g., a central location or empty)
            setMapUrl(`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=India`);
        }
    }, [source, destination]);


    const handleSourceSelect = async (selectedSourceName: string) => {
        const selected = suggestedSources.find(src => src.name === selectedSourceName);
        if (selected) {
            setSource({ lat: selected.lat, lng: selected.lng });
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
            setSelectedDestinationValue(selected.name);
            try {
                const address = await getAddressForCoordinate({ lat: selected.lat, lng: selected.lng }); // Corrected to use selected.lat, selected.lng
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
        if (!user || !email || !mobileNumber || !selectedSourceValue || !selectedDestinationValue || !vehicleType || fare === null) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields: User, Email, Mobile, Source, Destination, and Vehicle Type.",
                variant: "destructive",
            });
            return;
        }

        if (source && destination && fare !== null) {
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
                localStorage.setItem('bookingDetails', JSON.stringify(newBooking)); // For OTP/Dashboard page
            }

            router.push(`/otp?mobileNumber=${mobileNumber}`);

        } else {
            toast({
                title: "Error Booking Cab",
                description: "Please ensure source, destination, and all user details are correctly set.",
                variant: "destructive",
            });
        }
    };


    return (
        <div className="container mx-auto p-4 min-h-screen">
            <div className="mb-6">
                <Button variant="outline" onClick={() => router.push('/')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Booking Form */}
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Book a Ride</CardTitle>
                        <CardDescription>Enter your ride details below.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                         <div className="grid gap-2">
                            <label htmlFor="user" className="text-left font-medium">User Name</label>
                            <Input
                                type="text"
                                id="user"
                                placeholder="Enter your name"
                                value={user}
                                onChange={(e) => setUser(e.target.value)}
                                required
                            />
                        </div>
                         <div className="grid gap-2">
                            <label htmlFor="email" className="text-left font-medium">Email</label>
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
                            <label htmlFor="mobileNumber" className="text-left font-medium">Mobile Number</label>
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
                            <label htmlFor="source" className="text-left font-medium">Source</label>
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
                            <label htmlFor="destination" className="text-left font-medium">Destination</label>
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
                                        {suggestedDestinations.filter(d => d.name && d.name.trim() !== "").map((dest) => (
                                            <SelectItem key={dest.name} value={dest.name}>
                                                {dest.name}
                                            </SelectItem>
                                        ))}
                                        {suggestedDestinations.filter(d => d.name && d.name.trim() !== "").length === 0 && (
                                            <SelectItem value="--no-destinations--" disabled>No destinations available</SelectItem>
                                        )}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="vehicleType" className="text-left font-medium">Vehicle Type</label>
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
                                <label htmlFor="fare" className="text-left font-medium">Estimated Fare</label>
                                <Input
                                    type="text"
                                    id="fare"
                                    value={`₹${fare.toFixed(2)}`}
                                    disabled
                                    className="font-semibold"
                                />
                            </div>
                        )}
                        {distance !== null && (
                            <div className="grid gap-2">
                                <label htmlFor="distance" className="text-left font-medium">Distance</label>
                                <Input
                                    type="text"
                                    id="distance"
                                    value={`${distance.toFixed(2)} km`}
                                    disabled
                                />
                            </div>
                        )}
                        <Button onClick={bookCab} disabled={!source || !destination || !mobileNumber || !user || !email || !vehicleType || fare === null} className="w-full">
                            Book Cab <MapIcon className="ml-2 h-5 w-5" />
                        </Button>
                    </CardContent>
                </Card>

                {/* Right Column: Map Display */}
                <Card className="w-full h-full min-h-[400px] md:min-h-0">
                    <CardHeader>
                        <CardTitle>Ride Map</CardTitle>
                         <CardDescription>
                            {mapUrl.includes("YOUR_GOOGLE_MAPS_API_KEY") && (
                                <span className="text-destructive font-semibold">
                                    The current map uses Google Maps Embed. Replace 'YOUR_GOOGLE_MAPS_API_KEY' 
                                    in the code with your actual Google Maps API key for this map to display.
                                </span>
                            )}
                             <br />
                             <span className="text-sm text-muted-foreground">
                                (Alternative map sources like `maptiles.p.rapidapi.com` for map tiles could be used with a dedicated mapping library e.g., Leaflet, instead of the current iframe embed.)
                             </span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col h-[calc(100%-4rem)]"> {/* Adjust height to fill card */}
                        {mapUrl && !mapUrl.includes("YOUR_GOOGLE_MAPS_API_KEY") ? (
                            <iframe
                                src={mapUrl}
                                width="100%"
                                height="100%" // Fill available space
                                style={{ border: 0 }}
                                allowFullScreen={true}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="flex-grow rounded-md" // Make iframe grow
                            ></iframe>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                <p>{mapUrl.includes("YOUR_GOOGLE_MAPS_API_KEY") ? "Please configure Google Maps API Key." : "Select source/destination to see map."}</p>
                            </div>
                        )}
                        <div className="mt-4 text-sm">
                            <p><strong>Pickup:</strong> {sourceAddress?.formattedAddress || 'Not selected'}</p>
                            <p><strong>Drop-off:</strong> {destinationAddress?.formattedAddress || 'Not selected'}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

    