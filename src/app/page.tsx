'use client';

import {useEffect, useState, useCallback} from 'react';
import {Address, Coordinate, getCurrentLocation, getAddressForCoordinate} from '@/services/map';
import {getFare} from '@/services/fare';
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

const INR_CONVERSION_RATE = 83;

export default function Home() {
  const [source, setSource] = useState<Coordinate | null>(null);
  const [destination, setDestination] = useState<Coordinate | null>(null);
  const [fare, setFare] = useState<number | null>(null);
  const [sourceAddress, setSourceAddress] = useState<Address | null>(null);
  const [destinationAddress, setDestinationAddress] = useState<Address | null>(null);
  const [suggestedDestinations, setSuggestedDestinations] = useState<any[]>([]);
  const {toast} = useToast();
  const [destinationInput, setDestinationInput] = useState('');

  const fetchSuggestedDestinations = useCallback(async (destinationName: string) => {
    try {
      if (!destinationName) return;
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
  }, [suggestDestinations, toast]);

  useEffect(() => {
    const fetchCurrentLocation = async () => {
      const location = await getCurrentLocation();
      setSource(location);
    };

    fetchCurrentLocation();
  }, []);

  useEffect(() => {
    const fetchSourceAddress = async () => {
      if (source) {
        const address = await getAddressForCoordinate(source);
        setSourceAddress(address);
      }
    };

    fetchSourceAddress();
  }, [source]);

  const handleDestinationChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const destinationName = event.target.value;
    setDestinationInput(destinationName);
    fetchSuggestedDestinations(destinationName);

    if (source) {
      // Placeholder: Geocode the destination name to coordinates
      const newDestination: Coordinate = {lat: 8.5241, lng: 76.9366};
      setDestination(newDestination);

      const destinationAddress = await getAddressForCoordinate(newDestination);
      setDestinationAddress(destinationAddress);
    }
  };

  useEffect(() => {
    const estimateFare = async () => {
      if (source && destination) {
        const estimatedFare = await getFare(source, destination);
        setFare(estimatedFare);
      }
    };

    estimateFare();
  }, [source, destination]);

  const bookCab = () => {
    if (source && destination) {
      toast({
        title: "Cab Booked!",
        description: `Cab booked from ${sourceAddress?.formattedAddress} to ${destinationAddress?.formattedAddress} for ₹${fare ? fare * INR_CONVERSION_RATE : 0}`,
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
                  <AvatarImage src="https://picsum.photos/id/11/50/50" alt="@shadcn" />
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
        <h1 className="text-6xl font-bold">
          Let&apos;sGo Rides
        </h1>

        <Card className="w-full max-w-md mt-10">
          <CardHeader>
            <CardTitle>Book a Ride</CardTitle>
            <CardDescription>Enter your destination to book a cab.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="source">Source</label>
              <Input
                type="text"
                id="source"
                value={sourceAddress ? sourceAddress.formattedAddress : 'Fetching current location...'}
                disabled
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="destination">Destination</label>
              <Input
                type="text"
                id="destination"
                placeholder="Enter destination"
                onChange={handleDestinationChange}
                value={destinationInput}
                list="destinationSuggestions"
              />
              <datalist id="destinationSuggestions">
                {suggestedDestinations.map((dest, index) => (
                  <option key={index} value={dest.name} />
                ))}
              </datalist>
            </div>
            {fare !== null && (
              <div className="grid gap-2">
                <label htmlFor="fare">Estimated Fare</label>
                <Input
                  type="text"
                  id="fare"
                  value={`₹${fare * INR_CONVERSION_RATE}`}
                  disabled
                />
              </div>
            )}
            <Button onClick={bookCab}>Book Cab <Map className="ml-2"/></Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
