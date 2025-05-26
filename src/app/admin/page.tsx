
'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash, Map, Plus, Car, User, Save } from 'lucide-react';
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Placeholder data for cabs and fares
const initialCabs = [
  { id: '1', model: 'Sedan', licensePlate: 'KL 01 AB 1234', status: 'Active', driverName: 'Anoop' },
  { id: '2', model: 'SUV', licensePlate: 'KL 02 CD 5678', status: 'Inactive', driverName: 'Gopi' },
];

const initialFares = [
  { id: '1', vehicleType: 'Sedan', baseFare: 50, perKmRate: 10 },
  { id: '2', vehicleType: 'SUV', baseFare: 75, perKmRate: 15 },
];

const initialBookings = [
    { id: '1', mobileNumber: '9876543210', user: 'Anoop P', source: 'Punalur', destination: 'Kollam', fare: "600.00", cabModel: 'Sedan', driverName: 'Anoop', date: "8/2/2024", time: "10:00 AM" },
    { id: '2', mobileNumber: '8765432190', user: 'Gopi K', source: 'Kottarakkara', destination: 'Trivandrum', fare: "900.00", cabModel: 'SUV', driverName: 'Gopi', date: "8/2/2024", time: "11:30 AM" },
];


export default function AdminDashboard() {
  const [cabs, setCabs] = useState(initialCabs);
  const [fares, setFares] = useState(initialFares);
  const [bookings, setBookings] = useState(initialBookings);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const storedCabs = localStorage.getItem('cabs');
                if (storedCabs) {
                    setCabs(JSON.parse(storedCabs));
                } else {
                    setCabs(initialCabs); 
                }
            } catch (error) {
                console.error("Failed to parse cabs from localStorage", error);
                setCabs(initialCabs);
            }

            try {
                const storedFares = localStorage.getItem('fares');
                if (storedFares) {
                    setFares(JSON.parse(storedFares));
                } else {
                    setFares(initialFares);
                }
            } catch (error) {
                console.error("Failed to parse fares from localStorage", error);
                setFares(initialFares);
            }

            try {
                const storedBookings = localStorage.getItem('bookings');
                if (storedBookings) {
                    setBookings(JSON.parse(storedBookings));
                } else {
                    setBookings(initialBookings);
                }
            } catch (error) {
                console.error("Failed to parse bookings from localStorage", error);
                setBookings(initialBookings);
            }
        }
    }, []); 


    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('cabs', JSON.stringify(cabs));
        }
    }, [cabs]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('bookings', JSON.stringify(bookings));
        }
    }, [bookings]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('fares', JSON.stringify(fares));
        }
    }, [fares]);

  const [isAddCabDialogOpen, setIsAddCabDialogOpen] = useState(false);
  const [newCabModel, setNewCabModel] = useState('');
  const [newCabLicensePlate, setNewCabLicensePlate] = useState('');
   const [newCabDriverName, setNewCabDriverName] = useState('');
  const [isAddFareDialogOpen, setIsAddFareDialogOpen] = useState(false);
  const [newFareVehicleType, setNewFareVehicleType] = useState('');
  const [newFareBaseFare, setNewFareBaseFare] = useState('');
  const [newFarePerKmRate, setNewFarePerKmRate] = useState('');
  const [selectedCab, setSelectedCab] = useState<any>(null);
  const [selectedFare, setSelectedFare] = useState<any>(null);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
   const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
   const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [editingCabId, setEditingCabId] = useState<string | null>(null);
    const [editedCabModel, setEditedCabModel] = useState('');
    const [editedCabLicensePlate, setEditedCabLicensePlate] = useState('');
      const [editedCabDriverName, setEditedCabDriverName] = useState('');
    const [editingFareId, setEditingFareId] = useState<string | null>(null);
    const [editedFareVehicleType, setEditedFareVehicleType] = useState('');
    const [editedFareBaseFare, setEditedFareBaseFare] = useState('');
    const [editedFarePerKmRate, setEditedFarePerKmRate] = useState('');

    useEffect(() => {
        // Check if the user is authenticated (e.g., check for a token in local storage)
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('authToken');
            if (token) {
                setIsAuthenticated(true);
            } else {
                router.push('/login'); // Redirect to login if not authenticated
            }
        }
    }, [router]);

    useEffect(() => { 
        const interval = setInterval(() => {
            if (typeof window !== 'undefined') {
                const storedBookings = localStorage.getItem('bookings');
                if (storedBookings) {
                    try {
                        const currentBookings = JSON.parse(storedBookings);
                        if (JSON.stringify(currentBookings) !== JSON.stringify(bookings)) {
                            setBookings(currentBookings);
                        }
                    } catch (error) {
                        console.error("Error parsing bookings for refresh interval:", error);
                    }
                }
            }
        }, 5000); 
        return () => clearInterval(interval);
    }, [bookings]); 

    if (!isAuthenticated) {
        return null; 
    }

  const handleAddCab = () => {
    if (!newCabModel || !newCabLicensePlate || !newCabDriverName) {
      toast({
        title: "Error Adding Cab",
        description: "Please fill in all cab details.",
        variant: "destructive",
      });
      return;
    }
    const newCab = {
      id: String(cabs.length > 0 ? Math.max(...cabs.map(c => parseInt(c.id))) + 1 : 1), 
      model: newCabModel,
      licensePlate: newCabLicensePlate,
      status: 'Active', 
      driverName: newCabDriverName,
    };
    
    const updatedCabs = [...cabs, newCab];
    setCabs(updatedCabs);

    const fareExists = fares.some(fare => fare.vehicleType === newCab.model);

    if (!fareExists) {
        const newFareRule = {
            id: String(fares.length > 0 ? Math.max(...fares.map(f => parseInt(f.id))) + 1 : 1), 
            vehicleType: newCab.model,
            baseFare: 0, 
            perKmRate: 0, 
        };
        setFares(prevFares => [...prevFares, newFareRule]);
        toast({
            title: "Fare Rule Created",
            description: `A new fare rule for ${newCab.model} has been created. Please set its rates.`,
            variant: "default"
        });
    }

    setIsAddCabDialogOpen(false);
    setNewCabModel('');
    setNewCabLicensePlate('');
    setNewCabDriverName('');
    toast({
      title: "Cab Added",
      description: `Cab ${newCab.model} with license plate ${newCab.licensePlate} has been added successfully.`,
    });
  };

  const handleDeleteCab = (id: string) => {
    setCabs(cabs.filter(cab => cab.id !== id));
    toast({
      title: "Cab Deleted",
      description: "Cab deleted successfully.",
    });
  };

  const handleEditCab = (cab: any) => {
        setEditingCabId(cab.id);
        setEditedCabModel(cab.model);
        setEditedCabLicensePlate(cab.licensePlate);
          setEditedCabDriverName(cab.driverName);
    };

    const handleUpdateCabStatus = (id: string, status: string) => {
        setCabs(cabs.map(cab => cab.id === id ? { ...cab, status } : cab));
        toast({
            title: "Cab Status Updated",
            description: `Cab status updated to ${status}.`,
        });
    };

    const handleSaveCab = (id: string) => {
        if (!editedCabModel || !editedCabLicensePlate || !editedCabDriverName) {
            toast({
                title: "Error Updating Cab",
                description: "Please fill in all cab details.",
                variant: "destructive",
            });
            return;
        }
        setCabs(cabs.map(cab =>
            cab.id === id ? { ...cab, model: editedCabModel, licensePlate: editedCabLicensePlate, driverName: editedCabDriverName } : cab
        ));
        setEditingCabId(null);
        toast({
            title: "Cab Updated",
            description: "Cab details updated successfully.",
        });
    };

    const handleAddFare = () => {
        if (!newFareVehicleType || !newFareBaseFare || !newFarePerKmRate) {
            toast({
                title: "Error Adding Fare",
                description: "Please fill in all fare details.",
                variant: "destructive",
            });
            return;
        }

        if (fares.some(f => f.vehicleType === newFareVehicleType)) {
            toast({
                title: "Fare Exists",
                description: `A fare rule for ${newFareVehicleType} already exists. You can edit it directly.`,
                variant: "destructive",
            });
            return;
        }


        const newFare = {
            id: String(fares.length > 0 ? Math.max(...fares.map(f => parseInt(f.id))) + 1 : 1), 
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

  const handleDeleteFare = (id: string) => {
    setFares(fares.filter(fare => fare.id !== id));
    toast({
      title: "Fare Deleted",
      description: "Fare deleted successfully.",
    });
  };

    const handleEditFare = (fare: any) => {
        setEditingFareId(fare.id);
        setEditedFareVehicleType(fare.vehicleType);
        setEditedFareBaseFare(String(fare.baseFare));
        setEditedFarePerKmRate(String(fare.perKmRate));
    };

    const handleSaveFare = (id: string) => {
        if (!editedFareVehicleType || !editedFareBaseFare || !editedFarePerKmRate) {
            toast({
                title: "Error Updating Fare",
                description: "Please fill in all fare details.",
                variant: "destructive",
            });
            return;
        }
        setFares(fares.map(fare => {
            if (fare.id === id) {
                try {
                const updatedFare = {
                    ...fare,
                    vehicleType: editedFareVehicleType,
                    baseFare: parseFloat(editedFareBaseFare),
                    perKmRate: parseFloat(editedFarePerKmRate)
                };
                return updatedFare;
            } catch (error:any) {
                toast({
                    title: "Error Updating Fare",
                    description: error.message,
                    variant: "destructive",
                });
                return fare;
            }
            }
            return fare;
        }));
        setEditingFareId(null);
        toast({
            title: "Fare Updated",
            description: "Fare details updated successfully.",
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

    const bookingData = fares.map(fareRule => ({
        name: fareRule.vehicleType,
        bookings: bookings.filter(b => b.cabModel === fareRule.vehicleType).length
    }));

    const uniqueCabModels = Array.from(new Set(cabs.map(cab => cab.model)));


  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          
          <h1 className="text-3xl font-bold text-gray-900">
            Let'sGo Rides Admin Dashboard
          </h1>
          <Link href="/">
            <Button variant="secondary">
              <ArrowLeft className="mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <ScrollArea className="h-[calc(100vh-150px)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Panel: Data Tables */}
          <div className="md:col-span-2 space-y-6">
            {/* Added Cabs Table */}
            <Card>
              <CardHeader>
                <CardTitle>Added Cabs</CardTitle>
                <CardDescription>List of all cabs currently in the system.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Model</TableHead>
                        <TableHead>License Plate</TableHead>
                          <TableHead>Driver Name</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cabs.map((cab) => (
                        <TableRow key={cab.id}>
                          {editingCabId === cab.id ? (
                            <>
                              <TableCell>
                                <Input
                                  value={editedCabModel}
                                  onChange={(e) => setEditedCabModel(e.target.value)}
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={editedCabLicensePlate}
                                  onChange={(e) => setEditedCabLicensePlate(e.target.value)}
                                />
                              </TableCell>
                                <TableCell>
                                    <Input
                                        value={editedCabDriverName}
                                        onChange={(e) => setEditedCabDriverName(e.target.value)}
                                    />
                                </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleSaveCab(cab.id)}>
                                  <Save className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell>{cab.model}</TableCell>
                              <TableCell>{cab.licensePlate}</TableCell>
                                <TableCell>{cab.driverName}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="icon" onClick={() => handleEditCab(cab)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleDeleteCab(cab.id)}>
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handlePreview(cab)}>
                                    <Car className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </>
                          )}
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
                <ScrollArea className="w-full overflow-x-auto">
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
                          {editingFareId === fare.id ? (
                            <>
                              <TableCell>
                                <Input
                                  value={editedFareVehicleType}
                                  onChange={(e) => setEditedFareVehicleType(e.target.value)}
                                  disabled // Vehicle type shouldn't be changed here, but through cab model
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={editedFareBaseFare}
                                  onChange={(e) => setEditedFareBaseFare(e.target.value)}
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={editedFarePerKmRate}
                                  onChange={(e) => setEditedFarePerKmRate(e.target.value)}
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleSaveFare(fare.id)}>
                                  <Save className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell>{fare.vehicleType}</TableCell>
                              <TableCell>₹{fare.baseFare}</TableCell>
                              <TableCell>₹{fare.perKmRate}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="icon" onClick={() => handleEditFare(fare)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleDeleteFare(fare.id)}>
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </>
                          )}
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
                <ScrollArea className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mobile Number</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>Fare</TableHead>
                        <TableHead>Cab Model</TableHead>
                        <TableHead>Driver</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                            <TableCell>{booking.mobileNumber}</TableCell>
                          <TableCell>{booking.user}</TableCell>
                          <TableCell>{booking.source}</TableCell>
                          <TableCell>{booking.destination}</TableCell>
                          <TableCell>₹{booking.fare}</TableCell>
                          <TableCell>{booking.cabModel}</TableCell>
                          <TableCell>{booking.driverName}</TableCell>
                          <TableCell>{booking.date}</TableCell>
                          <TableCell>{booking.time}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end">
                              <Button variant="ghost" size="icon" onClick={() => handleViewBooking(booking)}>
                                <User className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel: Management Cards */}
          <div className="md:col-span-1 space-y-6">
            {/* Add New Cab Card */}
            <Card>
              <CardHeader>
                <CardTitle>Manage Cabs</CardTitle>
                <CardDescription>Add, edit, or remove cabs from the system.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setIsAddCabDialogOpen(true)}>
                  <Plus className="mr-2" /> Add New Cab
                </Button>
                <Dialog open={isAddCabDialogOpen} onOpenChange={setIsAddCabDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Cab</DialogTitle>
                      <DialogDescription>Enter the details for the new cab.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="model" className="text-right">Model</Label>
                        <Input id="model" value={newCabModel} onChange={(e) => setNewCabModel(e.target.value)} className="col-span-3" required />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="licensePlate" className="text-right">License Plate</Label>
                        <Input id="licensePlate" value={newCabLicensePlate} onChange={(e) => setNewCabLicensePlate(e.target.value)} className="col-span-3" required />
                      </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="driverName" className="text-right">Driver Name</Label>
                            <Input id="driverName" value={newCabDriverName} onChange={(e) => setNewCabDriverName(e.target.value)} className="col-span-3" required />
                        </div>
                    </div>
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
                <Button onClick={() => setIsAddFareDialogOpen(true)}>
                  <Plus className="mr-2" /> Add New Fare
                </Button>
                <Dialog open={isAddFareDialogOpen} onOpenChange={setIsAddFareDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Fare</DialogTitle>
                      <DialogDescription>Enter the fare details for the new vehicle type.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="vehicleType" className="text-right">Vehicle Type</Label>
                         <Select 
                            onValueChange={(value) => setNewFareVehicleType(value)} 
                            value={newFareVehicleType}
                            required 
                            
                          >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select Cab Model" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Available Cab Models</SelectLabel>
                                    {uniqueCabModels.map((model) => (
                                        <SelectItem key={model} value={model}>
                                            {model}
                                        </SelectItem>
                                    ))}
                                    {uniqueCabModels.length === 0 && <SelectItem value="" disabled>No cab models available</SelectItem>}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="baseFare" className="text-right">Base Fare</Label>
                        <Input id="baseFare" type="number" value={newFareBaseFare} onChange={(e) => setNewFareBaseFare(e.target.value)} className="col-span-3" required />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="perKmRate" className="text-right">Per KM Rate</Label>
                        <Input id="perKmRate" type="number" value={newFarePerKmRate} onChange={(e) => setNewFarePerKmRate(e.target.value)} className="col-span-3" required />
                      </div>
                    </div>
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
                <div className="w-full h-[300px]">
                <BarChart width={380} height={300} data={bookingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="bookings" fill="hsl(var(--primary))" />
                </BarChart>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
          </ScrollArea>
      </main>

      <Dialog open={isPreviewDialogOpen} onOpenChange={() => setIsPreviewDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cab Details</DialogTitle>
          </DialogHeader>
          {selectedCab && (
            <>
              <p><strong>Model:</strong> {selectedCab.model}</p>
              <p><strong>License Plate:</strong> {selectedCab.licensePlate}</p>
              <p><strong>Status:</strong> {selectedCab.status}</p>
              <p><strong>Driver Name:</strong> {selectedCab.driverName}</p>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isBookingDialogOpen} onOpenChange={() => setIsBookingDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <>
                <p><strong>Mobile Number:</strong> {selectedBooking.mobileNumber}</p>
              <p><strong>User:</strong> {selectedBooking.user}</p>
              <p><strong>Source:</strong> {selectedBooking.source}</p>
              <p><strong>Destination:</strong> {selectedBooking.destination}</p>
              <p><strong>Fare:</strong> ₹{selectedBooking.fare}</p>
              <p><strong>Cab Model:</strong> {selectedBooking.cabModel}</p>
              <p><strong>Driver Name:</strong> {selectedBooking.driverName}</p>
              <p><strong>Date:</strong> {selectedBooking.date}</p>
              <p><strong>Time:</strong> {selectedBooking.time}</p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

