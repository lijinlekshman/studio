'use client';

import {useEffect, useState} from 'react';
import {Address, Coordinate, getCurrentLocation, getAddressForCoordinate} from '@/services/map';
import {getFare} from '@/services/fare';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Map} from 'lucide-react';

const INR_CONVERSION_RATE = 83;

export default function Home() {
  const [source, setSource] = useState<Coordinate | null>(null);
  const [destination, setDestination] = useState<Coordinate | null>(null);
  const [fare, setFare] = useState<number | null>(null);
  const [sourceAddress, setSourceAddress] = useState<Address | null>(null);
  const [destinationAddress, setDestinationAddress] = useState<Address | null>(null);

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
    // Placeholder: Geocode the destination name to coordinates
    const newDestination: Coordinate = {lat: 34.062235, lng: -118.253683};
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
      alert(`Cab booked from ${sourceAddress?.formattedAddress} to ${destinationAddress?.formattedAddress} for ₹${fare ? fare * INR_CONVERSION_RATE : 0}`);
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
              <img src="https://picsum.photos/400/300" alt="Indian Map" className="rounded-md shadow-md"/>
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
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
