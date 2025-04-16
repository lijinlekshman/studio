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
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import Image from 'next/image';
import {calculateFare} from '@/ai/flows/calculate-fare';
import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue} from "@/components/ui/select";

const INR_CONVERSION_RATE = 83;

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

  const fetchSuggestedSources = useCallback(async (sourceName: string) => {
    try {
      if (!sourceName) return;
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
  }, [toast]);

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

    const handleSourceChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const sourceName = event.target.value;
    setSourceInput(sourceName);
    fetchSuggestedSources(sourceName);
  };

  const handleDestinationChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const destinationName = event.target.value;
    setDestinationInput(destinationName);
    fetchSuggestedDestinations(destinationName);
  };

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

  const bookCab = () => {
    if (source && destination) {
      toast({
        title: "Cab Booked!",
        description: `Cab booked from ${sourceAddress?.formattedAddress} to ${destinationAddress?.formattedAddress} for ₹${fare ? fare.toFixed(2) : 0} in a ${vehicleType}.`,
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
              <label htmlFor="source">Source</label>
              <Input
                type="text"
                id="source"
                placeholder="Enter source"
                onChange={handleSourceChange}
                value={sourceInput}
                list="sourceSuggestions"
              />
              <datalist id="sourceSuggestions">
                {suggestedSources.map((src, index) => (
                 <option key={index} value={src.name}  />
                ))}
              </datalist>
             {suggestedSources.length > 0 && (
                <div className="mt-1">
                  {suggestedSources.map((src, index) => (
                   <Button key={index} variant="outline" size="sm" className="mr-1 mb-1" onClick={() => handleSourceSelect(src)}>
                      {src.name}
                    </Button>
                  ))}
                </div>
              )}
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
               {suggestedDestinations.length > 0 && (
                <div className="mt-1">
                  {suggestedDestinations.map((dest, index) => (
                    <Button key={index} variant="outline" size="sm" className="mr-1 mb-1" onClick={() => handleDestinationSelect(dest)}>
                      {dest.name}
                    </Button>
                  ))}
                </div>
              )}
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
            <Button onClick={bookCab} disabled={!source || !destination}>Book Cab <Map className="ml-2"/></Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
