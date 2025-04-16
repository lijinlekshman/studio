'use client';

import {useEffect, useState} from 'react';
import {Address, Coordinate, getCurrentLocation, getAddressForCoordinate} from '@/services/map';
import {getFare} from '@/services/fare';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Map} from 'lucide-react';
import {suggestDestinations} from '@/ai/flows/suggest-destinations';
import {useToast} from "@/hooks/use-toast";

const INR_CONVERSION_RATE = 83;

export default function Home() {
  const [source, setSource] = useState<Coordinate | null>(null);
  const [destination, setDestination] = useState<Coordinate | null>(null);
  const [fare, setFare] = useState<number | null>(null);
  const [sourceAddress, setSourceAddress] = useState<Address | null>(null);
  const [destinationAddress, setDestinationAddress] = useState<Address | null>(null);
  const [suggestedDestinations, setSuggestedDestinations] = useState<any[]>([]);
  const {toast} = useToast();

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

  useEffect(() => {
    const fetchSuggestedDestinations = async () => {
      if (source) {
        try {
          const destinations = await suggestDestinations({currentLocation: source, pastRideHistory: []});
          setSuggestedDestinations(destinations);
        } catch (error: any) {
          toast({
            title: "Error fetching destinations",
            description: error.message,
            variant: "destructive",
          });
          console.error('Error fetching destinations:', error);
        }
      }
    };

    fetchSuggestedDestinations();
  }, [source, toast]);

  const handleDestinationChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const destinationName = event.target.value;
    // Placeholder: Geocode the destination name to coordinates
    const newDestination: Coordinate = {lat: 8.5241, lng: 76.9366};
    setDestination(newDestination);

    const destinationAddress = await getAddressForCoordinate(newDestination);
    setDestinationAddress(destinationAddress);
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
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
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
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/India_Kerala_locator_map.svg/500px-India_Kerala_locator_map.svg.png" alt="Kerala Map" className="rounded-md shadow-md"/>
            </div>
            <div className="grid gap-2">
              <label htmlFor="destination">Destination</label>
              <Input
                type="text"
                id="destination"
                placeholder="Enter destination"
                onChange={handleDestinationChange}
              />
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
            {suggestedDestinations.length > 0 && (
              <div className="grid gap-2">
                <label>Suggested Destinations</label>
                <ul>
                  {suggestedDestinations.map((dest, index) => (
                    <li key={index}>{dest.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
