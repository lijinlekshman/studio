
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";

// Demo users (in a real app, this would come from a backend)
const demoUsers = [
  { email: 'user1@example.com', password: 'password123', name: 'Demo User One', mobile: '1111111111' },
  { email: 'user2@example.com', password: 'password456', name: 'Demo User Two', mobile: '2222222222' },
  { email: 'anoop@example.com', password: 'password789', name: 'Anoop P', mobile: '9876543210'},
  { email: 'gopi@example.com', password: 'password101', name: 'Gopi K', mobile: '8765432190'}
];

const UserLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // If a user is already logged in, redirect to dashboard
    if (typeof window !== 'undefined' && localStorage.getItem('loggedInUser')) {
      router.push('/user-dashboard');
    }
  }, [router]);

  const handleLogin = () => {
    const user = demoUsers.find(u => u.email === email && u.password === password);

    if (user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('loggedInUser', JSON.stringify({ email: user.email, name: user.name, mobile: user.mobile }));
      }
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.name}!`,
      });
      router.push('/user-dashboard');
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid email or password.",
        variant: "destructive",
      });
    }
  };

  if (!isClient) {
    return <div className="flex items-center justify-center min-h-screen"><p>Loading...</p></div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-cover bg-center">
      {/* Background image is now applied via globals.css to the body */}
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 text-center">
        <Link href="/">
          <Image 
            src="/Images/logo.png" 
            width={400} 
            height={100} 
            alt="Let'sGo Rides" 
            data-ai-hint="logo" 
            className="max-w-[200px] h-auto sm:max-w-[250px] md:max-w-[300px] mb-6" />
        </Link>
        <Card className="w-full max-w-sm mt-8 sm:mt-10">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">User Login</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2 text-left">
              <label htmlFor="email">Email</label>
              <Input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-sm"
              />
            </div>
            <div className="grid gap-2 text-left">
              <label htmlFor="password">Password</label>
              <Input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-sm"
              />
            </div>
            <Button onClick={handleLogin} className="w-full">Login</Button>
          </CardContent>
        </Card>
        <Link href="/" className="mt-4 text-sm text-muted-foreground hover:text-foreground">
            Back to Home
        </Link>
      </main>
    </div>
  );
};

export default UserLoginPage;
