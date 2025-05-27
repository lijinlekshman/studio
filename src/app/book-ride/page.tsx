
'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Address, Coordinate } from '@/services/map';
import { getCurrentLocation, getAddressForCoordinate } from '@/services/map';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Map as MapIcon, Bot, ArrowLeft } from 'lucide-react'; // Map renamed to MapIcon to avoid conflict
import { suggestDestinations } from '@/ai/flows/suggest-destinations';
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { calculateDistance } from '@/ai/flows/calculate-fare';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { parseBookingRequest, type ParseBookingRequestOutput } from '@/ai/flows/parse-booking-request';


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

    const [availableCabs, setAvailableCabs] = useState<any[]>([]);
    const [currentFares, setCurrentFares] = useState<any[]>([]);

    const [aiRequestText, setAiRequestText] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [isAiHelperDialogOpen, setIsAiHelperDialogOpen] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);


    useEffect(() => {
        let chatbotRequestData: ParseBookingRequestOutput | null = null;
        const loadInitialData = async () => {
            if (typeof window !== 'undefined') {
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
                } catch (error) {
                    console.error("Failed to parse currentFares from localStorage", error);
                    setCurrentFares([]);
                }

                const chatbotRequestString = localStorage.getItem('chatbotBookingRequest');
                if (chatbotRequestString) {
                    try {
                        chatbotRequestData = JSON.parse(chatbotRequestString) as ParseBookingRequestOutput;
                        if (chatbotRequestData?.userName) setUser(chatbotRequestData.userName);
                        if (chatbotRequestData?.email) setEmail(chatbotRequestData.email);
                        if (chatbotRequestData?.mobileNumber) setMobileNumber(chatbotRequestData.mobileNumber);
                        localStorage.removeItem('chatbotBookingRequest'); // Clear after use
                        toast({title: "AI Assistant", description: "Form pre-filled with your request. Please review and complete."});
                    } catch (e) {
                        console.error("Error parsing chatbotBookingRequest from localStorage", e);
                        localStorage.removeItem('chatbotBookingRequest'); // Clear even on error
                    }
                }
            }

            try {
                const location = await getCurrentLocation();
                setSource(location);
                if (location) {
                    const address = await getAddressForCoordinate(location);
                    setSourceAddress(address);
                }
            } catch (e) {
                console.error("Error getting current location:", e);
            }

            // Await these individually to ensure they complete
            try {
                const sources = await suggestDestinations({ currentLocation: await getCurrentLocation(), pastRideHistory: [] });
                setSuggestedSources(sources);
            } catch (error: any) {
                toast({ title: "Error fetching sources", description: error.message, variant: "destructive" });
            }

            try {
                const destinations = await suggestDestinations({ currentLocation: await getCurrentLocation(), pastRideHistory: [] });
                setSuggestedDestinations(destinations);
            } catch (error: any) {
                toast({ title: "Error fetching destinations", description: error.message, variant: "destructive" });
            }


            // Apply chatbot data after suggestions are loaded and currentFares is set
            if (chatbotRequestData?.vehiclePreference && currentFares.length > 0) {
                const validVehicle = currentFares.find(f => f.vehicleType && f.vehicleType.toLowerCase() === chatbotRequestData!.vehiclePreference?.toLowerCase());
                if (validVehicle) {
                    setVehicleType(validVehicle.vehicleType);
                } else if (chatbotRequestData?.vehiclePreference) {
                    toast({ title: "AI Assistant", description: `Vehicle type "${chatbotRequestData.vehiclePreference}" not available. Please select manually.`, variant: "default" });
                }
            }
             if (chatbotRequestData?.sourceName && suggestedSources.length > 0) { // Check if suggestedSources is populated
                const matchedSource = suggestedSources.find(s => s.name.toLowerCase().includes(chatbotRequestData!.sourceName!.toLowerCase()));
                if (matchedSource) {
                    await handleSourceSelect(matchedSource.name);
                } else {
                     toast({ title: "AI Helper", description: `Source "${chatbotRequestData.sourceName}" not found in suggestions. Please select manually.`, variant: "default" });
                }
            }
            if (chatbotRequestData?.destinationName && suggestedDestinations.length > 0) { // Check if suggestedDestinations is populated
                const matchedDestination = suggestedDestinations.find(d => d.name.toLowerCase().includes(chatbotRequestData!.destinationName!.toLowerCase()));
                if (matchedDestination) {
                    await handleDestinationSelect(matchedDestination.name);
                } else {
                    toast({ title: "AI Helper", description: `Destination "${chatbotRequestData.destinationName}" not found in suggestions. Please select manually.`, variant: "default" });
                }
            }


            setDataLoaded(true);
        };

        loadInitialData();
    }, []); // Empty dependency array: runs once on mount


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
        }
    }, [toast]);


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
                    const address = await getAddressForCoordinate(destination); // Corrected to use destination
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
                        if (vehicleType) { // Only show toast if a vehicle type was actually selected but no rule found
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
                    setFare(null);
                    setDistance(null);
                }
            } else {
                // Reset fare and distance if conditions aren't met (e.g., vehicleType is cleared)
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
                 setSourceAddress(null);
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
                setDestinationAddress(null);
            }
        }
    };

    const generateUniqueId = () => {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    };

    const simulateSendOtp = async (phoneNumber: string) => {
        console.log(`Simulating OTP send to: ${phoneNumber} using Twilio Verify Service ID: VA4e5f3c5b9f308ba482baa879f38b4bba`);
        // In a real app, this would involve a backend call to Twilio:
        // const response = await fetch('/api/send-otp', { method: 'POST', body: JSON.stringify({ phoneNumber }) });
        // if (!response.ok) throw new Error('Failed to send OTP');
        // const data = await response.json(); return data.success;
        toast({
            title: "OTP Simulation",
            description: `An OTP would be sent to ${phoneNumber}. (Demo: Use 123456 to verify). Actual Twilio integration needed.`,
            duration: 9000,
        });
        return true; // Simulate success
    };


    const bookCab = async () => {
        if (!user || !email || !mobileNumber || !selectedSourceValue || !selectedDestinationValue || !vehicleType || fare === null) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields: User, Email, Mobile, Source, Destination, and Vehicle Type.",
                variant: "destructive",
            });
            return;
        }

        if (source && destination && fare !== null) {
            try {
                const otpSent = await simulateSendOtp(mobileNumber);
                if (!otpSent) {
                    toast({
                        title: "OTP Error",
                        description: "Failed to send OTP. Please try again.",
                        variant: "destructive",
                    });
                    return;
                }

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
                    status: 'Pending OTP', // Initial status before OTP verification
                };

                if (typeof window !== 'undefined') {
                    let existingBookings = [];
                    try {
                        const storedBookings = localStorage.getItem('bookings');
                        existingBookings = storedBookings ? JSON.parse(storedBookings) : [];
                    } catch (error) {
                        console.error("Error parsing existing bookings from localStorage", error);
                        existingBookings = []; // Reset to empty array on error
                    }
                    existingBookings.push(newBooking);
                    localStorage.setItem('bookings', JSON.stringify(existingBookings));
                    localStorage.setItem('bookingDetails', JSON.stringify(newBooking)); // For OTP page to retrieve
                }
                router.push(`/otp?mobileNumber=${mobileNumber}`);
            } catch (error: any) {
                 toast({
                    title: "Booking Error",
                    description: error.message || "Could not initiate booking.",
                    variant: "destructive",
                });
            }
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
                const validVehicle = currentFares.find(f => f.vehicleType && f.vehicleType.toLowerCase() === parsedData.vehiclePreference?.toLowerCase());
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
            setIsAiHelperDialogOpen(false); // Close dialog on success
        } catch (error: any) {
            toast({ title: "AI Parsing Error", description: error.message || "Could not parse the request.", variant: "destructive" });
        } finally {
            setIsParsing(false);
        }
    };

    return (
        <div className="container mx-auto p-4 min-h-screen flex flex-col items-center">
            <div className="w-full max-w-2xl mb-6 flex justify-start">
                <Button variant="outline" onClick={() => router.push('/')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Button>
            </div>

            <div className="w-full max-w-lg space-y-6">
                <Card className="shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center">Book Your Ride</CardTitle>
                        <CardDescription className="text-center">
                            Fill in the details below or use our AI Assistant to get started!
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="user" className="font-medium text-left">User Name</Label>
                            <Input
                                type="text"
                                id="user"
                                placeholder="Enter your name"
                                value={user}
                                onChange={(e) => setUser(e.target.value)}
                                required
                                className="text-base"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="font-medium text-left">Email</Label>
                            <Input
                                type="email"
                                id="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="text-base"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="mobileNumber" className="font-medium text-left">Mobile Number</Label>
                            <Input
                                type="tel"
                                id="mobileNumber"
                                placeholder="Enter your mobile number"
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value)}
                                required
                                className="text-base"
                            />
                        </div>

                        {!dataLoaded && <p className="text-sm text-muted-foreground text-center">Loading location options...</p>}
                        {dataLoaded && (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="source" className="font-medium text-left">Pickup Location</Label>
                                    <Select
                                        onValueChange={(value) => handleSourceSelect(value)}
                                        required
                                        value={selectedSourceValue || ""}
                                    >
                                        <SelectTrigger className="w-full text-base">
                                            <SelectValue placeholder="Select pickup location" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Suggested Sources</SelectLabel>
                                                {suggestedSources.map((src) => (
                                                    <SelectItem key={src.name} value={src.name} className="text-base">
                                                        {src.name}
                                                    </SelectItem>
                                                ))}
                                                {suggestedSources.length === 0 && <SelectItem value="--no-sources-placeholder--" disabled>No sources found</SelectItem>}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="destination" className="font-medium text-left">Drop-off Location</Label>
                                    <Select
                                        onValueChange={(value) => handleDestinationSelect(value)}
                                        required
                                        value={selectedDestinationValue || ""}
                                    >
                                        <SelectTrigger className="w-full text-base">
                                            <SelectValue placeholder="Select drop-off location" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Suggested Destinations</SelectLabel>
                                                {suggestedDestinations.filter(d => d.name && d.name.trim() !== "").map((dest) => (
                                                    <SelectItem key={dest.name} value={dest.name} className="text-base">
                                                        {dest.name}
                                                    </SelectItem>
                                                ))}
                                                {suggestedDestinations.filter(d => d.name && d.name.trim() !== "").length === 0 && (
                                                    <SelectItem value="--no-destinations-placeholder--" disabled>No destinations found</SelectItem>
                                                )}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="vehicleType" className="font-medium text-left">Vehicle Type</Label>
                                    <Select
                                        onValueChange={setVehicleType}
                                        value={vehicleType}
                                        required
                                    >
                                        <SelectTrigger className="w-full text-base">
                                            <SelectValue placeholder="Select vehicle type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Available Types</SelectLabel>
                                                {currentFares
                                                    .filter(fareRule => fareRule.vehicleType && fareRule.vehicleType.trim() !== "")
                                                    .map((fareRule) => (
                                                        <SelectItem key={fareRule.id} value={fareRule.vehicleType} className="text-base">
                                                            {fareRule.vehicleType}
                                                        </SelectItem>
                                                    ))}
                                                {currentFares.filter(fareRule => fareRule.vehicleType && fareRule.vehicleType.trim() !== "").length === 0 &&
                                                    <SelectItem value="--no-vehicle-types-placeholder--" disabled>No vehicle types available</SelectItem>
                                                }
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        )}
                        {distance !== null && (
                            <div className="grid gap-2">
                                <Label htmlFor="distance" className="font-medium text-left">Distance</Label>
                                <Input
                                    type="text"
                                    id="distance"
                                    value={`${distance.toFixed(2)} km`}
                                    disabled
                                    className="text-base font-medium"
                                />
                            </div>
                        )}
                        {fare !== null && (
                            <div className="grid gap-2">
                                <Label htmlFor="fare" className="font-medium text-left">Estimated Fare</Label>
                                <Input
                                    type="text"
                                    id="fare"
                                    value={`₹${fare.toFixed(2)}`}
                                    disabled
                                    className="text-xl font-bold text-primary"
                                />
                            </div>
                        )}
                        <Button onClick={bookCab} disabled={!source || !destination || !mobileNumber || !user || !email || !vehicleType || fare === null} className="w-full py-3 text-lg">
                            Confirm Booking <MapIcon className="ml-2 h-5 w-5" />
                        </Button>
                    </CardContent>
                </Card>

                 <Card className="mt-6 w-full shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-xl text-left">Selected Trip Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-left">
                        <p><strong>Pickup:</strong> {selectedSourceValue || 'Not selected'}</p>
                        <p><strong>Drop-off:</strong> {selectedDestinationValue || 'Not selected'}</p>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isAiHelperDialogOpen} onOpenChange={setIsAiHelperDialogOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 rounded-full w-12 h-12 sm:w-14 sm:h-14 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
                        aria-label="Open AI Booking Assistant"
                    >
                        <Bot className="h-6 w-6 sm:h-7 sm:w-7" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
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
                                Your Booking Request
                            </Label>
                            <Textarea
                                id="aiRequestText"
                                value={aiRequestText}
                                onChange={(e) => setAiRequestText(e.target.value)}
                                placeholder="Enter your booking request here..."
                                rows={5}
                                className="text-sm"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAiHelperDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleParseWithAI} disabled={isParsing}>
                            {isParsing ? "Processing..." : "Process with AI"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
