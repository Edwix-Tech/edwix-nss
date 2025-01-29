'use client';
import * as React from 'react';
import LayoutSidebar from '@/components/layout-sidebar';
import AppIframe from '@/components/app-iframe';
import Navbar from '@/components/horizontal-navbar';
import { usePathname } from 'next/navigation';

export default function IframePage() {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <Navbar />
      <LayoutSidebar
        hideTrigger
        className="p-0 h-[calc(100vh-4rem)]"
        contentClassName="h-full w-full min-w-full"
      >
        <div className="relative w-full h-full">
          <AppIframe pathname={pathname} className="h-full" />
        </div>
      </LayoutSidebar>
    </div>
  );
}
