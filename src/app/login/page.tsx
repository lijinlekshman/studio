
'use client';

import React, {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    // Basic authentication logic
    if (username === 'admin' && password === 'password') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', 'admin-token');
      }
      router.push('/admin');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-cover bg-center">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 md:px-20 text-center">
        <Image src="/Images/letsGo.png" width={400} height={100} alt="Let'sGo Rides" data-ai-hint="logo letsGo"/>
        <Card className="w-full max-w-md mt-10">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your credentials to access the admin portal.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="username">Username</label>
              <Input
                type="text"
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="password">Password</label>
              <Input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button onClick={handleLogin}>Login</Button>
          </CardContent>
        </Card>
        <Link href="/" className="mt-4 text-sm text-muted-foreground hover:text-foreground">
            Back to Home
        </Link>
      </main>
    </div>
  );
};

export default LoginPage;
