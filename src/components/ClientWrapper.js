"use client";

import dynamic from 'next/dynamic';

const FaceTrackingApp = dynamic(
  () => import('./FaceTrackingApp'),
  { ssr: false }
);

export default function ClientWrapper() {
  return <FaceTrackingApp />;
}