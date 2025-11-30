'use client';

import dynamic from 'next/dynamic';

// Dynamically import the Header component with SSR turned off
export const DynamicHeader = dynamic(
  () => import('./header').then(mod => mod.Header),
  { ssr: false }
);
