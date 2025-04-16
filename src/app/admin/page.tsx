'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {useToast} from "@/hooks/use-toast";
import {Trash} from "lucide-react";

export default function Admin() {
  const [cabId, setCabId] = useState('');
  const [cabModel, setCabModel] = useState('');
  const [city, setCity] = useState('');
  const [fare, setFare] = useState('');
  const {toast} = useToast();

  const addCab = () => {
    toast({
      title: "Cab Added!",
      description: `Cab ${cabId} added to ${city}`,
    });
  };

  const editCab = () => {
    toast({
      title: "Cab Edited!",
      description: `Cab ${cabId} updated.`,
    });
  };

  const deleteCab = () => {
    toast({
      title: "Cab Deleted!",
      description: `Cab ${cabId} deleted from ${city}.`,
    });
  };


  const updateFare = () => {
    toast({
      title: "Fare Updated!",
      description: `Fare updated to ${fare}`,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          Let&apos;sGo Rides Admin Portal
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          <Card className="w-full max-w-md">
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
                <label htmlFor="cabModel">Cab Model</label>
                <Input
                  type="text"
                  id="cabModel"
                  placeholder="Enter Cab Model"
                  value={cabModel}
                  onChange={(e) => setCabModel(e.target.value)}
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

          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Cab</CardTitle>
              <CardDescription>Edit the cab details in the system.</CardDescription>
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
                <label htmlFor="cabModel">Cab Model</label>
                <Input
                  type="text"
                  id="cabModel"
                  placeholder="Enter Cab Model"
                  value={cabModel}
                  onChange={(e) => setCabModel(e.target.value)}
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
              <Button onClick={editCab}>Edit Cab</Button>
            </CardContent>
          </Card>

          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Delete Cab</CardTitle>
              <CardDescription>Delete the cab from the system.</CardDescription>
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
              <Button variant="destructive" onClick={deleteCab}>
                Delete Cab <Trash className="ml-2"/>
              </Button>
            </CardContent>
          </Card>

          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Fare</CardTitle>
              <CardDescription>Enter the new fare to update it in the system.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="fare">Fare</label>
                <Input
                  type="text"
                  id="fare"
                  placeholder="Enter Fare"
                  value={fare}
                  onChange={(e) => setFare(e.target.value)}
                />
              </div>
              <Button onClick={updateFare}>Update Fare</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
