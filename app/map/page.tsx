"use client";

import DrawingExample from "@/components/mapComponent/drawing-example";
import { APIProvider } from "@vis.gl/react-google-maps";

export default function MapPage() {
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <DrawingExample />
    </APIProvider>
  );
}
