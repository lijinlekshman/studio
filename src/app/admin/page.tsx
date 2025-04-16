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
    
      
        
          
            Let'sGo Rides Admin Dashboard
          
          <Link href="/">
            <Button variant="secondary">
              <ArrowLeft className="mr-2"/>
              Back to Home
            </Button>
          </Link>
        
      

      
        
          {/* Left Panel: Management Cards */}
          
            {/* Add New Cab Card */}
            
              
                
                  Add New Cab
                
                
                  Add a new cab to the system.
                
              
              
                
                  
                    Cab ID
                  
                  <Input
                    type="text"
                    id="cabId"
                    placeholder="Enter Cab ID"
                    value={cabId}
                    onChange={(e) => setCabId(e.target.value)}
                  />
                
                
                  
                    Cab Model
                  
                  <Input
                    type="text"
                    id="cabModel"
                    placeholder="Enter Cab Model"
                    value={cabModel}
                    onChange={(e) => setCabModel(e.target.value)}
                  />
                
                
                  
                    City
                  
                  <Input
                    type="text"
                    id="city"
                    placeholder="Enter City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                
                
                  
                    Cab Type
                  
                  <Select onValueChange={setCabType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select cab type"/>
                    </SelectTrigger>
                    <SelectContent>
                      
                        
                          Type
                        
                        <SelectItem value="sedan">Sedan</SelectItem>
                        <SelectItem value="suv">SUV</SelectItem>
                        <SelectItem value="mini">Mini</SelectItem>
                      
                    </SelectContent>
                  </Select>
                
                
                  
                    Cab Status
                  
                  <Select onValueChange={setCabStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status"/>
                    </SelectTrigger>
                    <SelectContent>
                      
                        
                          Status
                        
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="on-trip">On Trip</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      
                    </SelectContent>
                  </Select>
                
                
                  
                    Additional Notes
                  
                  <Textarea
                    id="additionalNotes"
                    placeholder="Enter any additional notes"
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                  />
                
                <Button onClick={addCab}>Add Cab</Button>
              
            

            {/* Added Cabs Listing */}
            
              
                
                  Added Cabs
                
                
                  Manage existing cabs in the system.
                
              
              
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
              
            
            {/* Fare Management Section */}
            
              
                
                  Update Fare
                
                
                  Update the fare for a specific city.
                
              
              
                
                  
                    City
                  
                  <Input
                    type="text"
                    id="city"
                    placeholder="Enter City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                
                
                  
                    Fare
                  
                  <Input
                    type="text"
                    id="fare"
                    placeholder="Enter Fare"
                    value={fare}
                    onChange={(e) => setFare(e.target.value)}
                  />
                
                <Button onClick={updateFareForCity}>Update Fare</Button>
              
            

            {/* Fare Listing */}
            
              
                
                  Fare Listing
                
              
              
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
              
            
          

          {/* Right Panel: Analytics and Additional Info */}
          
            {/* Cab Status Card */}
            
              
                
                  Cab Status
                
                
                  View and modify the status of cabs.
                
              
              
                
                  
                    Cab ID
                  
                  <Input
                    type="text"
                    id="cabId"
                    placeholder="Enter Cab ID"
                    value={cabId}
                    onChange={(e) => setCabId(e.target.value)}
                  />
                
                
                  
                    Cab Status
                  
                  <Select onValueChange={setCabStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status"/>
                    </SelectTrigger>
                    <SelectContent>
                      
                        
                          Status
                        
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="on-trip">On Trip</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      
                    </SelectContent>
                  </Select>
                
                
                  
                    Additional Notes
                  
                  <Textarea
                    id="additionalNotes"
                    placeholder="Enter any additional notes"
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                  />
                
                <Button onClick={() => toast({title: "Status Updated", description: `Cab ${cabId} status updated`})}>
                  Update Status
                </Button>
              
            

            {/* Analytics Card */}
            
              
                
                  Monthly Analytics
                
                
                  Monthly overview of cabs and fares.
                
              
              
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
              
            
             {/* Booking Details Accordion */}
                        
                            
                                Booking Details
                            
                            
                                View details of all bookings.
                            
                        
                        
                            {isBookingDataAvailable ? (
                                
                                    {bookings.map((booking) => (
                                        
                                            
                                                
                                                    Booking ID: {booking.id}
                                                
                                                
                                                    
                                                        <strong>Source:</strong> {booking.source}
                                                    
                                                    
                                                        <strong>Destination:</strong> {booking.destination}
                                                    
                                                    
                                                        <strong>Fare:</strong> {booking.fare}
                                                    
                                                    
                                                        <strong>Cab ID:</strong> {booking.cabId}
                                                    
                                                    
                                                        <strong>Mobile Number:</strong> {booking.mobileNumber}
                                                    
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
                                                
                                            
                                        
                                    ))}
                                
                            ) : (
                                
                                    No booking data available.
                                
                            )}
                        
              
              {/* Cab Tracking Section */}
              
                
                  
                    Cab Tracking
                  
                  
                    Track the current location of cabs.
                  
                
                
                  
                    {cabs.map((cab) => (
                      
                        
                          
                            {cab.model} ({cab.id})
                          
                          
                            Status: {cab.status}
                          
                          {/* Map Integration */}
                          
                            <iframe
                              width="100%"
                              height="200"
                              style={{ border: 0 }}
                              loading="lazy"
                              allowFullScreen
                              src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${cab.location.lat},${cab.location.lng}`}
                            ></iframe>
                          
                          
                            Location: Lat: {cab.location.lat}, Lng: {cab.location.lng}
                          
                        
                      
                    ))}
                  
                
              
          
        
      
       <AlertDialog open={openPreview} onOpenChange={setOpenPreview}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {previewCab ? `Cab Details - ${previewCab.id}` : previewFare ? `Fare Details - ${previewFare.city}` : 'Details'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {previewCab ? (
                <>
                  
                    <strong>Model:</strong> {previewCab.model}
                  
                  
                    <strong>City:</strong> {previewCab.city}
                  
                  
                    <strong>Type:</strong> {previewCab.type}
                  
                  
                    <strong>Status:</strong> {previewCab.status}
                  
                  
                    <strong>Notes:</strong> {previewCab.notes}
                  
				  
					<strong>Vehicle Number:</strong> {previewCab.vehicleNumber}
				  
				  
					<strong>Driver Name:</strong> {previewCab.driverDetails.name}
				  
				  
					<strong>Driver Mobile:</strong> {previewCab.driverDetails.mobile}
				  
                  
                                    
                                        <iframe
                                            width="100%"
                                            height="200"
                                            style={{ border: 0 }}
                                            loading="lazy"
                                            allowFullScreen
                                            src={mapURL}
                                        ></iframe>
                                    
                </>
              ) : previewFare ? (
                <>
                  
                    <strong>City:</strong> {previewFare.city}
                  
                  
                    <strong>Fare:</strong> {previewFare.fare}
                  
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
      
    
  );
}


