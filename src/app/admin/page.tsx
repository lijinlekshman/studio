'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';

export default function Admin() {
  const [cabId, setCabId] = useState('');
  const [city, setCity] = useState('');

  const addCab = () => {
    alert(`Cab ${cabId} added to ${city}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          Let&apos;sGo Rides Admin Portal
        </h1>

        <Card className="w-full max-w-md mt-10">
          <CardHeader>
            <CardTitle>Add New Cab</CardTitle>
            <CardDescription>Enter the cab details to add it to the system.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="cabId">Cab ID</label>
              <Input
                type="text"
                id="cabId"
                placeholder="Enter Cab ID"
                value={cabId}
                onChange={(e) => setCabId(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="city">City</label>
              <Input
                type="text"
                id="city"
                placeholder="Enter City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <Button onClick={addCab}>Add Cab</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
/
