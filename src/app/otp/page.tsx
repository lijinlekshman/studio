
'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the client-side content of the OTP page
// SSR is disabled to prevent prerendering issues with client-side hooks like useSearchParams
const OTPPageClient = dynamic(() => import('@/components/otp-page-client'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-cover bg-center" style={{ backgroundImage: "url('/Images/attractive-taxi-bg.jpg')" }}>
      <p>Loading...</p>
    </div>
  ), // Optional: show a loading state
});

export default function OTPPage() {
  return <OTPPageClient />;
}
