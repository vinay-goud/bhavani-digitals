import { tool } from 'ai';
import { z } from 'zod';

// Define the response type for Places
export interface PlaceResult {
    id: string;
    name: string;
    formattedAddress: string;
    rating?: number;
    userRatingCount?: number;
    photos?: string[];
    location: {
        latitude: number;
        longitude: number;
    };
    priceLevel?: string;
    types?: string[];
}

// Function to fetch from Google Places API (New)
async function searchPlaces(query: string): Promise<PlaceResult[]> {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) throw new Error('Missing Google Maps API Key');

    const url = 'https://places.googleapis.com/v1/places:searchText';

    const defaultBias = {
        circle: {
            center: { latitude: 17.3850, longitude: 78.4867 },
            radius: 50000
        }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.photos,places.priceLevel,places.types'
        },
        body: JSON.stringify({
            textQuery: query,
            locationBias: defaultBias,
            maxResultCount: 5,
        })
    });

    if (!response.ok) {
        throw new Error(`Google Places API Error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.places) return [];

    return data.places.map((place: any) => ({
        id: place.id,
        name: place.displayName?.text || 'Unknown Place',
        formattedAddress: place.formattedAddress,
        rating: place.rating,
        userRatingCount: place.userRatingCount,
        photos: place.photos?.slice(0, 1).map((p: any) => p.name) || [],
        location: {
            latitude: place.location.latitude,
            longitude: place.location.longitude
        },
        priceLevel: place.priceLevel,
        types: place.types
    }));
}

// Export the tool definition for Vercel AI SDK v6
// Export the tool definition for Vercel AI SDK v6
export const getPlacesTool = tool({
    description: 'Search for photography locations, parks, studios, or venues using Google Maps.',
    parameters: z.object({
        query: z.string().describe('The user search query, e.g. "sunset spots in Hyderabad" or "studios near Gachibowli"'),
    }),
    execute: async (args: any) => {
        console.log(`[Lumina] Tool args received:`, JSON.stringify(args));

        // Handle potential parameter aliases from the model
        const query = args.query || args.location || args.place || args.search || args.keyword;

        if (!query) {
            console.error('[Lumina] No query found in args');
            return {
                found: false,
                count: 0,
                places: [],
                error: 'Missing search query. Please provide a location or place name.'
            };
        }

        console.log(`[Lumina] Searching places for: ${query}`);
        try {
            const places = await searchPlaces(query);
            return {
                found: places.length > 0,
                count: places.length,
                places: places,
                // Ensure error is undefined on success
                error: undefined
            };
        } catch (error) {
            console.error('[Lumina] Place search failed:', error);
            // Return structured error
            return {
                found: false,
                count: 0,
                places: [],
                error: 'Failed to search places.'
            };
        }
    },
} as any);
