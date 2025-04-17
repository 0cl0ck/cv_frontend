'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Simple redirect component
function RedirectComponent() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to homepage
    router.replace('/');
  }, [router]);
  
  return (
    <div className="w-full max-w-md bg-white dark:bg-neutral-800 rounded-lg shadow-md p-8 text-center">
      <div className="text-lg">Redirection en cours...</div>
      <div className="w-8 h-8 border-t-4 border-primary border-solid rounded-full animate-spin mx-auto mt-4"></div>
    </div>
  );
}

// Main page component
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 px-4">
      <RedirectComponent />
    </div>
  );
}
