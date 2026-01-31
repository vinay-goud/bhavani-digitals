'use client';

import type { PlaceResult } from '@/features/lumina/api/tools/google-places';
import { Star, MapPin, Navigation, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LocationCard({ place }: { place: PlaceResult }) {
    // Generate Google Maps URLs
    const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ', ' + place.formattedAddress)}`;

    // Get Directions URL - uses current location as origin
    const getDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=current+location&destination=${encodeURIComponent(place.name + ', ' + place.formattedAddress)}&travelmode=driving`;

    const handleOpenInMaps = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(mapsSearchUrl, '_blank');
    };

    const handleGetDirections = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(getDirectionsUrl, '_blank');
    };

    return (
        <div
            className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={handleOpenInMaps}
        >
            {/* Photo Placeholder */}
            <div className="h-28 bg-muted relative">
                {place.photos && place.photos.length > 0 ? (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <MapPin className="text-primary/40 h-8 w-8" />
                    </div>
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">No Photo</span>
                    </div>
                )}
                {/* Rating Badge */}
                {place.rating && (
                    <div className="absolute top-2 left-2 flex items-center gap-0.5 bg-black/70 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                        <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                        {place.rating.toFixed(1)}
                        {place.userRatingCount && (
                            <span className="text-white/70 font-normal ml-0.5">({place.userRatingCount})</span>
                        )}
                    </div>
                )}
                {/* Price Level Badge */}
                {place.priceLevel && (
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                        {place.priceLevel}
                    </div>
                )}
            </div>

            <div className="p-3">
                <h4 className="font-semibold text-sm line-clamp-2 leading-tight">{place.name}</h4>

                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                    {place.formattedAddress}
                </p>

                {/* Action Buttons */}
                <div className="mt-3 flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 text-xs gap-1"
                        onClick={handleOpenInMaps}
                    >
                        <ExternalLink className="h-3 w-3" />
                        Open in Maps
                    </Button>
                    <Button
                        size="sm"
                        variant="default"
                        className="flex-1 h-8 text-xs gap-1"
                        onClick={handleGetDirections}
                    >
                        <Navigation className="h-3 w-3" />
                        Directions
                    </Button>
                </div>
            </div>
        </div>
    );
}
