'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash, Map, Plus, Car, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Image from 'next/image';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend } from 'recharts';
import { useRouter } from 'next/navigation';

// Placeholder data for cabs and fares
const initialCabs = [
  { id: '1', model: 'Sedan', licensePlate: 'KL 01 AB 1234', status: 'Active' },
  { id: '2', model: 'SUV', licensePlate: 'KL 02 CD 5678', status: 'Inactive' },
];

const initialFares = [
  { id: '1', vehicleType: 'Sedan', baseFare: 50, perKmRate: 10 },
  { id: '2', vehicleType: 'SUV', baseFare: 75, perKmRate: 15 },
];

const initialBookings = [
    { id: '1', userId: '101', source: 'Punalur', destination: 'Kollam', fare: 600, cabModel: 'Sedan', driverName: 'Anoop' },
    { id: '2', userId: '102', source: 'Kottarakkara', destination: 'Trivandrum', fare: 900, cabModel: 'SUV', driverName: 'Gopi' },
];


export default function AdminDashboard() {
  const [cabs, setCabs] = useState(initialCabs);
  const [fares, setFares] = useState(initialFares);
  const [bookings, setBookings] = useState(initialBookings);
  const [isAddCabDialogOpen, setIsAddCabDialogOpen] = useState(false);
  const [newCabModel, setNewCabModel] = useState('');
  const [newCabLicensePlate, setNewCabLicensePlate] = useState('');
  const [isAddFareDialogOpen, setIsAddFareDialogOpen] = useState(false);
  const [newFareVehicleType, setNewFareVehicleType] = useState('');
  const [newFareBaseFare, setNewFareBaseFare] = useState('');
  const [newFarePerKmRate, setNewFarePerKmRate] = useState('');
  const [selectedCab, setSelectedCab] = useState(null);
  const [selectedFare, setSelectedFare] = useState(null);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
   const [selectedBooking, setSelectedBooking] = useState(null);
    const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
   const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if the user is authenticated (e.g., check for a token in local storage)
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsAuthenticated(true);
        } else {
            router.push('/login'); // Redirect to login if not authenticated
        }
    }, [router]);

    if (!isAuthenticated) {
        return null; // Or a loading spinner, or a message like "Redirecting..."
    }

  // Function to handle adding a new cab
  const handleAddCab = () => {
    if (!newCabModel || !newCabLicensePlate) {
      toast({
        title: "Error Adding Cab",
        description: "Please fill in all cab details.",
        variant: "destructive",
      });
      return;
    }
    const newCab = {
      id: String(cabs.length + 1), // Simple ID generation
      model: newCabModel,
      licensePlate: newCabLicensePlate,
      status: 'Active', // Default status
    };
    setCabs([...cabs, newCab]);
    setIsAddCabDialogOpen(false);
    setNewCabModel('');
    setNewCabLicensePlate('');
    toast({
      title: "Cab Added",
      description: `Cab ${newCab.model} with license plate ${newCab.licensePlate} has been added successfully.`,
    });
  };

  // Function to handle deleting a cab
  const handleDeleteCab = (id: string) => {
    setCabs(cabs.filter(cab => cab.id !== id));
    toast({
      title: "Cab Deleted",
      description: "Cab deleted successfully.",
    });
  };

  // Function to handle editing a cab
  const handleEditCab = (cab: any) => {
    setSelectedCab(cab);
  };

  // Function to handle updating cab status (placeholder)
  const handleUpdateCabStatus = (id: string, status: string) => {
    setCabs(cabs.map(cab => cab.id === id ? { ...cab, status } : cab));
    toast({
      title: "Cab Status Updated",
      description: `Cab status updated to ${status}.`,
    });
  };

  // Function to handle adding a new fare
  const handleAddFare = () => {
    if (!newFareVehicleType || !newFareBaseFare || !newFarePerKmRate) {
      toast({
        title: "Error Adding Fare",
        description: "Please fill in all fare details.",
        variant: "destructive",
      });
      return;
    }

    const newFare = {
      id: String(fares.length + 1),
      vehicleType: newFareVehicleType,
      baseFare: parseFloat(newFareBaseFare),
      perKmRate: parseFloat(newFarePerKmRate),
    };

    setFares([...fares, newFare]);
    setIsAddFareDialogOpen(false);
    setNewFareVehicleType('');
    setNewFareBaseFare('');
    setNewFarePerKmRate('');
    toast({
      title: "Fare Added",
      description: `Fare for ${newFare.vehicleType} has been added successfully.`,
    });
  };

  // Function to handle deleting a fare
  const handleDeleteFare = (id: string) => {
    setFares(fares.filter(fare => fare.id !== id));
    toast({
      title: "Fare Deleted",
      description: "Fare deleted successfully.",
    });
  };

  const handleEditFare = (fare: any) => {
    setSelectedFare(fare);
  };

  const handleUpdateFare = (id: string, updatedFare: any) => {
    setFares(fares.map(fare => fare.id === id ? updatedFare : fare));
    toast({
      title: "Fare Updated",
      description: `Fare for ${updatedFare.vehicleType} has been updated successfully.`,
    });
  };

  const handlePreview = (item: any) => {
    setSelectedCab(item);
    setIsPreviewDialogOpen(true);
  };

  const handleViewBooking = (booking: any) => {
        setSelectedBooking(booking);
        setIsBookingDialogOpen(true);
    };

  // Chart data (example)
  const bookingData = [
    { name: 'Sedan', bookings: bookings.filter(b => b.cabModel === 'Sedan').length },
    { name: 'SUV', bookings: bookings.filter(b => b.cabModel === 'SUV').length },
  ];

  return (
    
      
        
          
            Let'sGo Rides Admin Dashboard
          
          <Link href="/">
            <Button variant="secondary">
              <ArrowLeft className="mr-2" />
              Back to Home
            </Button>
          </Link>
        
      

      
        
            {/* Left Panel: Management Cards & Charts */}
            
                {/* Management Cards */}
                
                    {/* Add New Cab Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Manage Cabs</CardTitle>
                            <CardDescription>Add, edit, or remove cabs from the system.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={() => setIsAddCabDialogOpen(true)}><Plus className="mr-2" /> Add New Cab</Button>
                            <Dialog open={isAddCabDialogOpen} onOpenChange={setIsAddCabDialogOpen}>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Cab</DialogTitle>
                                        <DialogDescription>Enter the details for the new cab.</DialogDescription>
                                    </DialogHeader>
                                    
                                        
                                            <Label htmlFor="model" className="text-right">
                                                Model
                                            </Label>
                                            <Input id="model" value={newCabModel} onChange={(e) => setNewCabModel(e.target.value)} className="col-span-3" required />
                                        
                                        
                                            <Label htmlFor="licensePlate" className="text-right">
                                                License Plate
                                            </Label>
                                            <Input id="licensePlate" value={newCabLicensePlate} onChange={(e) => setNewCabLicensePlate(e.target.value)} className="col-span-3" required />
                                        
                                    
                                    <DialogFooter>
                                        <Button type="button" onClick={handleAddCab}>Add Cab</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>

                    {/* Update Fare Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Manage Fares</CardTitle>
                            <CardDescription>Update base fares and per kilometer rates for different vehicle types.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={() => setIsAddFareDialogOpen(true)}><Plus className="mr-2" /> Add New Fare</Button>
                            <Dialog open={isAddFareDialogOpen} onOpenChange={setIsAddFareDialogOpen}>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Fare</DialogTitle>
                                        <DialogDescription>Enter the fare details for the new vehicle type.</DialogDescription>
                                    </DialogHeader>
                                    
                                        
                                            <Label htmlFor="vehicleType" className="text-right">
                                                Vehicle Type
                                            </Label>
                                            <Input id="vehicleType" value={newFareVehicleType} onChange={(e) => setNewFareVehicleType(e.target.value)} className="col-span-3" required />
                                        
                                        
                                            <Label htmlFor="baseFare" className="text-right">
                                                Base Fare
                                            </Label>
                                            <Input id="baseFare" type="number" value={newFareBaseFare} onChange={(e) => setNewFareBaseFare(e.target.value)} className="col-span-3" required />
                                        
                                        
                                            <Label htmlFor="perKmRate" className="text-right">
                                                Per KM Rate
                                            </Label>
                                            <Input id="perKmRate" type="number" value={newFarePerKmRate} onChange={(e) => setNewFarePerKmRate(e.target.value)} className="col-span-3" required />
                                        
                                    
                                    <DialogFooter>
                                        <Button type="button" onClick={handleAddFare}>Add Fare</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                

                {/* Booking Summary Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Booking Summary</CardTitle>
                        <CardDescription>A summary of bookings by vehicle type.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <BarChart width={500} height={300} data={bookingData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <ChartTooltip />
                            <Legend />
                            <Bar dataKey="bookings" fill="#3498db" />
                        </BarChart>
                    </CardContent>
                </Card>
            

          {/* Right Panel: Data Tables */}
          
            {/* Added Cabs Table */}
            <Card>
              <CardHeader>
                <CardTitle>Added Cabs</CardTitle>
                <CardDescription>List of all cabs currently in the system.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Model</TableHead>
                        <TableHead>License Plate</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cabs.map((cab) => (
                        <TableRow key={cab.id}>
                          <TableCell>{cab.model}</TableCell>
                          <TableCell>{cab.licensePlate}</TableCell>
                          <TableCell className="text-right">
                            
                              <Button variant="ghost" size="icon" onClick={() => handleEditCab(cab)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteCab(cab.id)}>
                                <Trash className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handlePreview(cab)}>
                                <Car className="h-4 w-4" />
                              </Button>
                            
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Updated Fare Table */}
            <Card>
              <CardHeader>
                <CardTitle>Updated Fares</CardTitle>
                <CardDescription>Current fare rates for each vehicle type.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vehicle Type</TableHead>
                        <TableHead>Base Fare</TableHead>
                        <TableHead>Per KM Rate</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fares.map((fare) => (
                        <TableRow key={fare.id}>
                          <TableCell>{fare.vehicleType}</TableCell>
                          <TableCell>{fare.baseFare}</TableCell>
                          <TableCell>{fare.perKmRate}</TableCell>
                          <TableCell className="text-right">
                            
                              {selectedFare?.id === fare.id ? (
                                <Button variant="ghost" size="icon" onClick={() => handleUpdateFare(fare.id, { ...fare, baseFare: parseFloat(newFareBaseFare), perKmRate: parseFloat(newFarePerKmRate) })}>
                                  Save
                                </Button>
                              ) : (
                                <Button variant="ghost" size="icon" onClick={() => handleEditFare(fare)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteFare(fare.id)}>
                                <Trash className="h-4 w-4" />
                              </Button>
                            
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
             {/* Bookings Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Bookings</CardTitle>
                                <CardDescription>List of all current bookings.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>User ID</TableHead>
                                                <TableHead>Source</TableHead>
                                                <TableHead>Destination</TableHead>
                                                <TableHead>Fare</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {bookings.map((booking) => (
                                                <TableRow key={booking.id}>
                                                    <TableCell>{booking.userId}</TableCell>
                                                    <TableCell>{booking.source}</TableCell>
                                                    <TableCell>{booking.destination}</TableCell>
                                                    <TableCell>{booking.fare}</TableCell>
                                                    <TableCell className="text-right">
                                                        
                                                            <Button variant="ghost" size="icon" onClick={() => handleViewBooking(booking)}>
                                                                <User className="h-4 w-4" />
                                                            </Button>
                                                        
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </CardContent>
                        </Card>
          
        
      
      <Dialog open={isPreviewDialogOpen} onOpenChange={() => setIsPreviewDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cab Details</DialogTitle>
          </DialogHeader>
          {selectedCab && (
            
              <p>Model: {selectedCab.model}</p>
              <p>License Plate: {selectedCab.licensePlate}</p>
              <p>Status: {selectedCab.status}</p>
            
          )}
        </DialogContent>
      </Dialog>
       <Dialog open={isBookingDialogOpen} onOpenChange={() => setIsBookingDialogOpen(false)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Booking Details</DialogTitle>
                    </DialogHeader>
                    {selectedBooking && (
                        
                            <p>User ID: {selectedBooking.userId}</p>
                            <p>Source: {selectedBooking.source}</p>
                            <p>Destination: {selectedBooking.destination}</p>
                            <p>Fare: {selectedBooking.fare}</p>
                            <p>Cab Model: {selectedBooking.cabModel}</p>
                            <p>Driver Name: {selectedBooking.driverName}</p>
                        
                    )}
                </DialogContent>
            </Dialog>
    
  );
}

    