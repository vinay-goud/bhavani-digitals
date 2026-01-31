'use client';

import { APIProvider, Map, AdvancedMarker, Marker, ColorScheme } from '@vis.gl/react-google-maps';
import { useTheme } from 'next-themes';
import { Camera } from 'lucide-react';
import { useEffect, useState } from 'react';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID as string;

// Actual Studio Location
const STUDIO_POSITION = { lat: 18.532025093087885, lng: 77.89822229683062 };

// Custom Location Pin Component - Proper Teardrop Shape
function CustomLocationPin() {
    // Using the app's primary orange color: hsl(25, 95%, 53%) ≈ #f97316
    const primaryColor = '#f97316';

    return (
        <div className="relative group cursor-pointer flex flex-col items-center">
            {/* The Pin Container */}
            <div className="relative transform transition-transform duration-200 group-hover:scale-110 origin-bottom">
                {/* SVG Teardrop Pin Shape */}
                <svg
                    width="48"
                    height="60"
                    viewBox="0 0 48 60"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="drop-shadow-xl"
                >
                    {/* Teardrop Path - Single unified shape */}
                    <path
                        d="M24 0C10.745 0 0 10.745 0 24C0 37.255 24 60 24 60C24 60 48 37.255 48 24C48 10.745 37.255 0 24 0Z"
                        fill={primaryColor}
                    />
                    {/* Inner teardrop with white border */}
                    <path
                        d="M24 3C12.402 3 3 12.402 3 24C3 34.5 24 54 24 54C24 54 45 34.5 45 24C45 12.402 35.598 3 24 3Z"
                        fill={primaryColor}
                        stroke="white"
                        strokeWidth="2"
                    />
                    {/* Inner circle highlight */}
                    <circle cx="24" cy="22" r="12" fill="rgba(255,255,255,0.2)" />
                </svg>
                {/* Camera Icon Overlay - centered in the pin */}
                <div className="absolute top-[10px] left-1/2 -translate-x-1/2">
                    <Camera className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
            </div>
            {/* Tooltip on Hover */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Bhavani Digitals Studio
            </div>
        </div>
    );
}

export default function ContactMap() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const isDarkMode = mounted && resolvedTheme === 'dark';

    if (!API_KEY) {
        return (
            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground p-4 text-center rounded-lg">
                <p>Google Maps API Key not found. Please check your configuration.</p>
            </div>
        );
    }

    return (
        <APIProvider apiKey={API_KEY}>
            <div className="w-full h-full rounded-lg overflow-hidden border border-border bg-muted min-h-[300px]">
                <Map
                    defaultCenter={STUDIO_POSITION}
                    defaultZoom={15}
                    mapId={MAP_ID}
                    colorScheme={isDarkMode ? ColorScheme.DARK : ColorScheme.LIGHT}
                    disableDefaultUI={false}
                    gestureHandling={'cooperative'}
                    className="w-full h-full"
                    key={isDarkMode ? 'dark' : 'light'}
                >
                    {MAP_ID ? (
                        <AdvancedMarker position={STUDIO_POSITION}>
                            <CustomLocationPin />
                        </AdvancedMarker>
                    ) : (
                        <Marker
                            position={STUDIO_POSITION}
                            title="Bhavani Digitals Studio"
                        />
                    )}
                </Map>
            </div>
        </APIProvider>
    );
}

