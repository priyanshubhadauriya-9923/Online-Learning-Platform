'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserButton, useUser } from '@clerk/nextjs';
import React from 'react';

function AppHeader({ hideSidebar = false }) {
  const { user, isLoaded } = useUser();

  const userName = isLoaded && user ? user.fullName || user.primaryEmailAddress || 'back, Scholar' : '';

  return (
    <div className='p-4 flex justify-between items-center shadow-sm sticky'>
      {!hideSidebar && <SidebarTrigger />}
      <div className='text-xl text-blue-900 font-bold'>
        Welcome{userName ? `, ${userName}` : ''}
      </div>
      <UserButton />
    </div>
  );
}

export default AppHeader;
