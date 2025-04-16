'use client';

import {useEffect, useState, useCallback, useRef} from 'react';
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
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import Image from 'next/image';
import {calculateFare} from '@/ai/flows/calculate-fare';
import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue} from "@/components/ui/select";

const INR_CONVERSION_RATE = 83;

const countryCodes = [
    { label: 'India (+91)', value: '+91' },
    { label: 'USA (+1)', value: '+1' },
    { label: 'UK (+44)', value: '+44' },
    // Add more country codes as needed
];

export default function Home() {
  const [source, setSource] = useState<Coordinate | null>(null);
  const [destination, setDestination] = useState<Coordinate | null>(null);
  const [fare, setFare] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [sourceAddress, setSourceAddress] = useState<Address | null>(null);
  const [destinationAddress, setDestinationAddress] = useState<Address | null>(null);
  const [suggestedSources, setSuggestedSources] = useState<any[]>([]);
  const [suggestedDestinations, setSuggestedDestinations] = useState<any[]>([]);
  const {toast} = useToast();
  const [sourceInput, setSourceInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [vehicleType, setVehicleType] = useState('sedan'); // Default vehicle type
  const [mobileNumber, setMobileNumber] = useState(''); // Mobile number state
  const [countryCode, setCountryCode] = useState('+91'); // Default country code
    const [otpSent, setOtpSent] = useState(false); // OTP sent state
    const [otp, setOtp] = useState('');
    const [otpVerified, setOtpVerified] = useState(false);

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

    const handleSourceSelect = async (selectedSource: any) => {
    setSource({ lat: selectedSource.lat, lng: selectedSource.lng });
    setSourceInput(selectedSource.name);
    const address = await getAddressForCoordinate({ lat: selectedSource.lat, lng: selectedSource.lng });
    setSourceAddress(address);
  };

  const handleDestinationSelect = async (selectedDestination: any) => {
    setDestination({ lat: selectedDestination.lat, lng: selectedDestination.lng });
    setDestinationInput(selectedDestination.name);
    const address = await getAddressForCoordinate({ lat: selectedDestination.lat, lng: selectedDestination.lng });
    setDestinationAddress(address);
  };

    const handleSendOtp = () => {
        // Simulate sending OTP
        console.log(`Simulating sending OTP to ${countryCode}${mobileNumber}`);
        toast({
            title: "OTP Sent!",
            description: "Please enter the OTP sent to your mobile number.",
        });
        setOtpSent(true);
    };

    const handleVerifyOtp = () => {
        // Simulate verifying OTP
        if (otp === "123456") { // Replace with actual OTP verification logic
            console.log("OTP Verified!");
            toast({
                title: "OTP Verified!",
                description: "Your mobile number has been verified.",
            });
            setOtpVerified(true);
        } else {
            toast({
                title: "OTP Verification Failed!",
                description: "Invalid OTP. Please try again.",
                variant: "destructive",
            });
        }
    };

  const bookCab = () => {
    if (source && destination && otpVerified) {
        // Placeholder: Simulate sending notification to user's mobile
        console.log(`Sending notification to ${mobileNumber}`);
        toast({
            title: "Cab Booked!",
            description: `Cab booked from ${sourceAddress?.formattedAddress} to ${destinationAddress?.formattedAddress} for ₹${fare ? fare.toFixed(2) : 0} in a ${vehicleType}. A notification has been sent to ${mobileNumber}.`,
        });
    } else {
        toast({
            title: "Error Booking Cab",
            description: "Please select both source and destination and verify OTP.",
            variant: "destructive",
        });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center relative">
        <div className="absolute top-4 right-4 flex items-center space-x-2">

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <Avatar>
                  <AvatarImage src="/assets/user.png" alt="@shadcn" />
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem>
                <Link href="/admin">Admin Portal</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Image src="/Images/LetsGo-W-slogan.png" width={400} height={100} alt="Let'sGo Rides"/>

        <Card className="w-full max-w-md mt-10">
          <CardHeader>
            <CardTitle>Book a Ride</CardTitle>
            <CardDescription>Enter your source and destination to book a cab.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
             <div className="grid gap-2">
                    <label htmlFor="countryCode">Country Code</label>
                    <Select onValueChange={setCountryCode} defaultValue={countryCode}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Country Code" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Country</SelectLabel>
                                {countryCodes.map((code) => (
                                    <SelectItem key={code.value} value={code.value}>
                                        {code.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            <div className="grid gap-2">
              <label htmlFor="mobileNumber">Mobile Number</label>
              <Input
                type="tel"
                id="mobileNumber"
                placeholder="Enter your mobile number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                disabled={otpSent}
              />
            </div>
             {!otpSent && (
                        <Button onClick={handleSendOtp} disabled={!mobileNumber}>
                            Send OTP
                        </Button>
                    )}

                    {otpSent && !otpVerified && (
                        <>
                            <div className="grid gap-2">
                                <label htmlFor="otp">Enter OTP</label>
                                <Input
                                    type="text"
                                    id="otp"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleVerifyOtp} disabled={!otp}>
                                Verify OTP
                            </Button>
                        </>
                    )}
           <div className="grid gap-2">
                <label htmlFor="source">Source</label>
                <Select onValueChange={(value) => {
                    const selectedSource = suggestedSources.find(src => src.name === value);
                    if (selectedSource) {
                        handleSourceSelect(selectedSource);
                    }
                }}>
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
                }}>
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
              <Select onValueChange={setVehicleType} defaultValue={vehicleType}>
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
            <Button onClick={bookCab} disabled={!source || !destination || !mobileNumber || !otpVerified}>Book Cab <Map className="ml-2"/></Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
