'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ManagementTabs } from '@/components/admin/management-tabs';

export default function AdminPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and the user is either not present or not an admin, redirect.
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  // While loading, or if the user is not yet available or not an admin, show a loading/unauthorized message.
  // This prevents rendering the admin content for unauthorized users before the redirect happens.
  if (isLoading || !user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading or unauthorized...</p>
      </div>
    );
  }

  // Only render the admin console if the user is confirmed to be an admin.
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Console</h1>
      <ManagementTabs />
    </div>
  );
}
