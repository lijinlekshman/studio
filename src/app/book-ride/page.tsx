
'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Address, Coordinate } from '@/services/map'; // Ensure type import
import { getCurrentLocation, getAddressForCoordinate } from '@/services/map';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Map as MapIcon, Bot } from 'lucide-react';
import { suggestDestinations } from '@/ai/flows/suggest-destinations';
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { calculateDistance } from '@/ai/flows/calculate-fare';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from 'next/navigation';
import { parseBookingRequest, type ParseBookingRequestOutput } from '@/ai/flows/parse-booking-request';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';


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

    const [aiRequestText, setAiRequestText] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [isAiHelperDialogOpen, setIsAiHelperDialogOpen] = useState(false);


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
    }, [vehicleType]);

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
                        if (vehicleType) {
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
            const bookingTime = bookingDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
                    const storedBookings = localStorage.getItem('bookings');
                    existingBookings = storedBookings ? JSON.parse(storedBookings) : [];
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
            toast({
                title: "Error Booking Cab",
                description: "Please ensure source, destination, and all user details are correctly set.",
                variant: "destructive",
            });
        }
    };

    const handleParseWithAI = async () => {
        if (!aiRequestText.trim()) {
            toast({ title: "AI Helper", description: "Please enter your booking request.", variant: "default" });
            return;
        }
        setIsParsing(true);
        try {
            const parsedData: ParseBookingRequestOutput = await parseBookingRequest({ requestText: aiRequestText });

            if (parsedData.userName) setUser(parsedData.userName);
            if (parsedData.email) setEmail(parsedData.email);
            if (parsedData.mobileNumber) setMobileNumber(parsedData.mobileNumber);
            if (parsedData.vehiclePreference) {
                const validVehicle = currentFares.find(f => f.vehicleType.toLowerCase() === parsedData.vehiclePreference?.toLowerCase());
                if (validVehicle) {
                    setVehicleType(validVehicle.vehicleType);
                } else if (parsedData.vehiclePreference) {
                    toast({ title: "AI Helper", description: `Vehicle type "${parsedData.vehiclePreference}" not found or not available. Please select manually.`, variant: "default" });
                }
            }

            if (parsedData.sourceName) {
                const matchedSource = suggestedSources.find(s => s.name.toLowerCase().includes(parsedData.sourceName!.toLowerCase()));
                if (matchedSource) {
                    await handleSourceSelect(matchedSource.name);
                } else {
                    toast({ title: "AI Helper", description: `Source "${parsedData.sourceName}" not found in suggestions. Please select manually.`, variant: "default" });
                }
            }

            if (parsedData.destinationName) {
                const matchedDestination = suggestedDestinations.find(d => d.name.toLowerCase().includes(parsedData.destinationName!.toLowerCase()));
                if (matchedDestination) {
                    await handleDestinationSelect(matchedDestination.name);
                } else {
                    toast({ title: "AI Helper", description: `Destination "${parsedData.destinationName}" not found in suggestions. Please select manually.`, variant: "default" });
                }
            }
            toast({ title: "AI Helper", description: "Form fields updated based on your request. Please review and complete.", variant: "default" });
            setIsAiHelperDialogOpen(false); // Close dialog after parsing

        } catch (error: any) {
            toast({ title: "AI Parsing Error", description: error.message || "Could not parse the request.", variant: "destructive" });
        } finally {
            setIsParsing(false);
        }
    };


    return (
        <div className="container mx-auto p-4 min-h-screen">
            <div className="mb-6 flex justify-between items-center">
                <Button variant="outline" onClick={() => router.push('/')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-8"> {/* Changed to single column */}
                {/* Booking Form */}
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Book a Ride</CardTitle>
                        <CardDescription>Enter your ride details below, or use our AI Assistant!</CardDescription>
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

                        <div className="mt-4 flex justify-center">
                             <Dialog open={isAiHelperDialogOpen} onOpenChange={setIsAiHelperDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="icon" className="rounded-full w-12 h-12">
                                        <Bot className="h-6 w-6" />
                                        <span className="sr-only">AI Booking Assistant</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>AI Booking Assistant</DialogTitle>
                                        <DialogDescription>
                                            Type your booking request below, and the AI will try to fill the form for you.
                                            e.g., "Book a cab from Punalur to Kollam for Anoop, email@example.com, 9876543210, SUV"
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-1 items-center gap-4">
                                            <Label htmlFor="aiRequestText" className="sr-only">
                                                Booking Request
                                            </Label>
                                            <Textarea
                                                id="aiRequestText"
                                                value={aiRequestText}
                                                onChange={(e) => setAiRequestText(e.target.value)}
                                                placeholder="Enter your booking request..."
                                                rows={4}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleParseWithAI} disabled={isParsing}>
                                            {isParsing ? "Processing..." : "Process Request"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardContent>
                </Card>

                {/* Map Display Section Removed */}
                {/* Selected locations can be displayed below if needed */}
                 <Card className="mt-4">
                    <CardHeader>
                        <CardTitle>Selected Locations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p><strong>Pickup:</strong> {sourceAddress?.formattedAddress || 'Not selected'}</p>
                        <p><strong>Drop-off:</strong> {destinationAddress?.formattedAddress || 'Not selected'}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
