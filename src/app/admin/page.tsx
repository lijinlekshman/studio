'use client';

import {useState, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {useToast} from "@/hooks/use-toast";
import {ArrowLeft, Edit, Trash, Eye, Save, Car, Locate} from "lucide-react";
import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import Link from "next/link";
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";

const data = [
  {
    name: 'Jan', cabs: 4000, fares: 2400, amt: 2400,
  },
  {
    name: 'Feb', cabs: 3000, fares: 1398, amt: 2210,
  },
  {
    name: 'Mar', cabs: 2000, fares: 9800, amt: 2290,
  },
  {
    name: 'Apr', cabs: 2780, fares: 3908, amt: 2000,
  },
  {
    name: 'May', cabs: 1890, fares: 4800, amt: 2181,
  },
  {
    name: 'Jun', cabs: 2390, fares: 3800, amt: 2500,
  },
  {
    name: 'Jul', cabs: 3490, fares: 4300, amt: 2100,
  },
  {
    name: 'Aug', cabs: 4000, fares: 2400, amt: 2400,
  },
  {
    name: 'Sep', cabs: 3000, fares: 1398, amt: 2210,
  },
  {
    name: 'Oct', cabs: 2000, fares: 9800, amt: 2290,
  },
  {
    name: 'Nov', cabs: 2780, fares: 3908, amt: 2000,
  },
  {
    name: 'Dec', cabs: 1890, fares: 4800, amt: 2181,
  },
];

// Dummy data for cabs
const initialCabs = [
  {
    id: 'CAB001',
    model: 'Sedan X',
    city: 'Thiruvananthapuram',
    type: 'Sedan',
    status: 'available',
    notes: 'Good condition',
    location: { lat: 8.5241, lng: 76.9366 }, // Dummy location
	driverDetails: { name: 'John Doe', mobile: '+919876543210' },
	vehicleNumber: 'KL-01-AB-1234'
  },
  {
    id: 'CAB002',
    model: 'SUV Y',
    city: 'Kochi',
    type: 'SUV',
    status: 'on-trip',
    notes: 'Driver on break',
    location: { lat: 9.9312, lng: 76.2673 }, // Dummy location
	driverDetails: { name: 'Jane Smith', mobile: '+918765432109' },
	vehicleNumber: 'KL-07-CD-5678'
  }
];

// Dummy data for fares
const initialFares = [
  {
    city: 'Thiruvananthapuram',
    fare: '250'
  },
  {
    city: 'Kochi',
    fare: '300'
  }
];

// Dummy data for bookings
const initialBookings = [
  {
    id: 'BOOK001',
    source: 'Punalur',
    destination: 'Kollam',
    fare: '250',
    cabId: 'CAB001',
    mobileNumber: '+919876543210'
  },
  {
    id: 'BOOK002',
    source: 'Kochi',
    destination: 'Aluva',
    fare: '300',
    cabId: 'CAB002',
    mobileNumber: '+918765432109'
  }
];


export default function Admin() {
  const [cabId, setCabId] = useState('');
  const [cabModel, setCabModel] = useState('');
  const [city, setCity] = useState('');
  const [fare, setFare] = useState('');
  const {toast} = useToast();
  const [cabType, setCabType] = useState('');
  const [cabStatus, setCabStatus] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [cabs, setCabs] = useState(initialCabs); // State for cabs
  const [fares, setFares] = useState(initialFares); // State for fares
  const [bookings, setBookings] = useState(initialBookings); // State for bookings
  const [editingFareCity, setEditingFareCity] = useState<string | null>(null); // State to manage editing city
  const [editedFareValue, setEditedFareValue] = useState(''); // State to hold edited fare value
  const [isEditingCab, setIsEditingCab] = useState(false);
  const [isEditingFare, setIsEditingFare] = useState(false);
  const [previewCab, setPreviewCab] = useState<any>(null);
  const [previewFare, setPreviewFare] = useState<any>(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [isBookingDataAvailable, setIsBookingDataAvailable] = useState(false);
    const [mapURL, setMapURL] = useState('');

  const addCab = () => {
    const newCab = {
      id: cabId,
      model: cabModel,
      city: city,
      type: cabType,
      status: cabStatus,
      notes: additionalNotes,
	  location: { lat: 8.5241, lng: 76.9366 }, // Dummy location
	  driverDetails: { name: 'New Driver', mobile: '+919999999999' },
	  vehicleNumber: 'KL-99-XX-9999'
    };
    setCabs([...cabs, newCab]);
    toast({
      title: "Cab Added!",
      description: `Cab ${cabId} added to ${city}`,
    });
  };

  const editCab = (id: string) => {
    // Logic to edit cab details
    toast({
      title: "Cab Edited!",
      description: `Cab ${id} updated.`,
    });
  };

  const deleteCab = (id: string) => {
    setCabs(cabs.filter(cab => cab.id !== id));
    toast({
      title: "Cab Deleted!",
      description: `Cab ${id} deleted from ${city}.`,
    });
  };

  const updateFareForCity = () => {
    const existingFareIndex = fares.findIndex(f => f.city === city);
    if (existingFareIndex > -1) {
      // Update existing fare
      const updatedFares = [...fares];
      updatedFares[existingFareIndex] = { city: city, fare: fare };
      setFares(updatedFares);
    } else {
      // Add new fare
      setFares([...fares, { city: city, fare: fare }]);
    }
    toast({
      title: "Fare Updated!",
      description: `Fare for ${city} updated to ${fare}`,
    });
  };

  const handleEditFare = (city: string, currentFare: string) => {
    setEditingFareCity(city);
    setEditedFareValue(currentFare);
    setIsEditingFare(true);
  };
  const handleSaveFare = (city: string) => {
    const updatedFares = fares.map(fare =>
      fare.city === city ? { ...fare, fare: editedFareValue } : fare
    );
    setFares(updatedFares);
    setEditingFareCity(null);
    toast({
      title: "Fare Updated!",
      description: `Fare for ${city} updated to ${editedFareValue}`,
    });
    setIsEditingFare(false);
  };

  const deleteFare = (city: string) => {
    setFares(fares.filter(fare => fare.city !== city));
    toast({
      title: "Fare Deleted!",
      description: `Fare for ${city} deleted.`,
    });
  };

  const handlePreviewCab = (cab: any) => {
    setPreviewCab(cab);
        // Generate the Google Maps URL
        const lat = cab.location.lat;
        const lng = cab.location.lng;
        const zoom = 14; // You can adjust the zoom level as needed
        const mapUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
        setMapURL(mapUrl);
    setOpenPreview(true);
  };

	const handleTrackCab = (cab: any) => {
		setPreviewCab(cab);
		// Generate the Google Maps URL for tracking
		const lat = cab.location.lat;
		const lng = cab.location.lng;
		const zoom = 14; // You can adjust the zoom level as needed
		const mapUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
		setMapURL(mapUrl);
		setOpenPreview(true);
	};

  const handlePreviewFare = (fare: any) => {
    setPreviewFare(fare);
    setOpenPreview(true);
  };

    useEffect(() => {
        if (bookings && bookings.length > 0) {
            setIsBookingDataAvailable(true);
        } else {
            setIsBookingDataAvailable(false);
        }
    }, [bookings]);


  return (
    
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Let&apos;sGo Rides Admin Dashboard
          </h1>
          <Link href="/">
            <Button variant="secondary">
              <ArrowLeft className="mr-2"/>
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Panel: Management Cards */}
          <div className="md:col-span-2 space-y-6">
            {/* Add New Cab Card */}
            <Card>
              <CardHeader>
                <CardTitle>Add New Cab</CardTitle>
                <CardDescription>Add a new cab to the system.</CardDescription>
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
                <div className="grid gap-2">
                  <label htmlFor="cabType">Cab Type</label>
                  <Select onValueChange={setCabType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select cab type"/>
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
                <div className="grid gap-2">
                  <label htmlFor="cabStatus">Cab Status</label>
                  <Select onValueChange={setCabStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Status</SelectLabel>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="on-trip">On Trip</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="additionalNotes">Additional Notes</label>
                  <Textarea
                    id="additionalNotes"
                    placeholder="Enter any additional notes"
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                  />
                </div>
                <Button onClick={addCab}>Add Cab</Button>
              </CardContent>
            </Card>

            {/* Added Cabs Listing */}
            <Card>
              <CardHeader>
                <CardTitle>Added Cabs</CardTitle>
                <CardDescription>Manage existing cabs in the system.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cab ID</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cabs.map((cab) => (
                      <TableRow key={cab.id}>
                        <TableCell>{cab.id}</TableCell>
                        <TableCell>{cab.model}</TableCell>
                        <TableCell>{cab.city}</TableCell>
                        <TableCell>{cab.type}</TableCell>
                        <TableCell>{cab.status}</TableCell>
                        <TableCell className="text-right font-medium">
                          <Button variant="ghost" size="sm" onClick={() => editCab(cab.id)} disabled={isEditingCab}>
                            <Edit className="mr-2 h-4 w-4"/>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteCab(cab.id)} disabled={isEditingCab}>
                            <Trash className="mr-2 h-4 w-4"/>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handlePreviewCab(cab)}>
                            <Eye className="mr-2 h-4 w-4"/>
                          </Button>
						   <Button variant="ghost" size="sm" onClick={() => handleTrackCab(cab)}>
								<Locate className="mr-2 h-4 w-4"/>
							</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            {/* Fare Management Section */}
            <Card>
              <CardHeader>
                <CardTitle>Update Fare</CardTitle>
                <CardDescription>Update the fare for a specific city.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
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
                <Button onClick={updateFareForCity}>Update Fare</Button>
              </CardContent>
            </Card>

            {/* Fare Listing */}
            <Card>
              <CardHeader>
                <CardTitle>Fare Listing</CardTitle>
                <CardDescription>Manage fares for different cities.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>City</TableHead>
                      <TableHead>Fare</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fares.map((fare) => (
                      <TableRow key={fare.city}>
                        <TableCell>{fare.city}</TableCell>
                         <TableCell>
                            {editingFareCity === fare.city ? (
                              <Input
                                type="text"
                                value={editedFareValue}
                                onChange={(e) => setEditedFareValue(e.target.value)}
                              />
                            ) : (
                              fare.fare
                            )}
                          </TableCell>
                        <TableCell className="text-right font-medium">
                           {editingFareCity === fare.city ? (
                              <Button variant="ghost" size="sm" onClick={() => handleSaveFare(fare.city)}>
                                <Save className="mr-2 h-4 w-4"/>
                              </Button>
                            ) : (
                              <Button variant="ghost" size="sm" onClick={() => handleEditFare(fare.city, fare.fare)} disabled={isEditingCab}>
                                <Edit className="mr-2 h-4 w-4"/>
                              </Button>
                            )}
                          <Button variant="ghost" size="sm" onClick={() => deleteFare(fare.city)} disabled={isEditingCab || isEditingFare}>
                            <Trash className="mr-2 h-4 w-4"/>
                          </Button>
                           <Button variant="ghost" size="sm" onClick={() => handlePreviewFare(fare)}>
                            <Eye className="mr-2 h-4 w-4"/>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel: Analytics and Additional Info */}
          <div className="md:col-span-1 space-y-6">
            {/* Cab Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Cab Status</CardTitle>
                <CardDescription>View and modify the status of cabs.</CardDescription>
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
                  <label htmlFor="cabStatus">Cab Status</label>
                  <Select onValueChange={setCabStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Status</SelectLabel>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="on-trip">On Trip</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="additionalNotes">Additional Notes</label>
                  <Textarea
                    id="additionalNotes"
                    placeholder="Enter any additional notes"
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                  />
                </div>
                <Button onClick={() => toast({title: "Status Updated", description: `Cab ${cabId} status updated`})}>
                  Update Status
                </Button>
              </CardContent>
            </Card>

            {/* Analytics Card */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Analytics</CardTitle>
                <CardDescription>Monthly overview of cabs and fares.</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart data={data} margin={{top: 5, right: 20, bottom: 5, left: 0}}>
                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5"/>
                    <XAxis dataKey="name"/>
                    <YAxis />
                    <Tooltip/>
                    <Legend/>
                    <Area type="monotone" dataKey="amt" fill="#8884d8" stroke="#8884d8"/>
                    <Line type="monotone" dataKey="cabs" stroke="#ff7300"/>
                    <Scatter dataKey="fares" fill="red"/>
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
             {/* Booking Details Accordion */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Booking Details</CardTitle>
                                <CardDescription>View details of all bookings.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isBookingDataAvailable ? (
                                    <Accordion type="single" collapsible>
                                        {bookings.map((booking) => (
                                            <AccordionItem key={booking.id} value={booking.id}>
                                                <AccordionTrigger>
                                                    Booking ID: {booking.id}
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <p><strong>Source:</strong> {booking.source}</p>
                                                    <p><strong>Destination:</strong> {booking.destination}</p>
                                                    <p><strong>Fare:</strong> {booking.fare}</p>
                                                    <p><strong>Cab ID:</strong> {booking.cabId}</p>
                                                    <p><strong>Mobile Number:</strong> {booking.mobileNumber}</p>
													{/* Add Track Cab Button */}
													<Button variant="ghost" size="sm" onClick={() => {
														const cab = cabs.find(c => c.id === booking.cabId);
														if (cab) {
															handleTrackCab(cab);
														} else {
															toast({
																title: "Cab Not Found",
																description: `Cab with ID ${booking.cabId} not found.`,
																variant: "destructive",
															});
														}
													}}>
														<Locate className="mr-2 h-4 w-4"/>
														Track Cab
													</Button>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                ) : (
                                    <p>No booking data available.</p>
                                )}
                            </CardContent>
                        </Card>
              {/* Cab Tracking Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Cab Tracking</CardTitle>
                  <CardDescription>Track the current location of cabs.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {cabs.map((cab) => (
                      <div key={cab.id} className="border rounded-md p-4">
                        <h3 className="font-semibold">{cab.model} ({cab.id})</h3>
                        <p>Status: {cab.status}</p>
                        {/* Map Integration */}
                        <div className="mt-2">
                          <iframe
                            width="100%"
                            height="200"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${cab.location.lat},${cab.location.lng}`}
                          ></iframe>
                        </div>
                        <p>Location: Lat: {cab.location.lat}, Lng: {cab.location.lng}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
          </div>
        </div>
      </main>
       <AlertDialog open={openPreview} onOpenChange={setOpenPreview}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {previewCab ? `Cab Details - ${previewCab.id}` : previewFare ? `Fare Details - ${previewFare.city}` : 'Details'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {previewCab ? (
                <>
                  <p><strong>Model:</strong> {previewCab.model}</p>
                  <p><strong>City:</strong> {previewCab.city}</p>
                  <p><strong>Type:</strong> {previewCab.type}</p>
                  <p><strong>Status:</strong> {previewCab.status}</p>
                  <p><strong>Notes:</strong> {previewCab.notes}</p>
				  <p><strong>Vehicle Number:</strong> {previewCab.vehicleNumber}</p>
				  <p><strong>Driver Name:</strong> {previewCab.driverDetails.name}</p>
				  <p><strong>Driver Mobile:</strong> {previewCab.driverDetails.mobile}</p>
                  
                                    <div className="mt-2">
                                        <iframe
                                            width="100%"
                                            height="200"
                                            style={{ border: 0 }}
                                            loading="lazy"
                                            allowFullScreen
                                            src={mapURL}
                                        ></iframe>
                                    </div>
                </>
              ) : previewFare ? (
                <>
                  <p><strong>City:</strong> {previewFare.city}</p>
                  <p><strong>Fare:</strong> {previewFare.fare}</p>
                </>
              ) : (
                'No details to display.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setOpenPreview(false);
              setPreviewCab(null);
              setPreviewFare(null);
            }}>
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </main>
    
  );
}

