'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {useToast} from "@/hooks/use-toast";
import {ArrowLeft, Edit, Trash, Eye} from "lucide-react";
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
    notes: 'Good condition'
  },
  {
    id: 'CAB002',
    model: 'SUV Y',
    city: 'Kochi',
    type: 'SUV',
    status: 'on-trip',
    notes: 'Driver on break'
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

  const addCab = () => {
    const newCab = {
      id: cabId,
      model: cabModel,
      city: city,
      type: cabType,
      status: cabStatus,
      notes: additionalNotes
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


  const updateFare = () => {
    toast({
      title: "Fare Updated!",
      description: `Fare updated to ${fare}`,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
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
                          <Button variant="ghost" size="sm" onClick={() => editCab(cab.id)}>
                            <Edit className="mr-2 h-4 w-4"/>
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteCab(cab.id)}>
                            <Trash className="mr-2 h-4 w-4"/>
                            Delete
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="mr-2 h-4 w-4"/>
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Update Fare Card */}
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
                <Button onClick={updateFare}>Update Fare</Button>
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
          </div>
        </div>
      </main>
    </div>
  );
}
