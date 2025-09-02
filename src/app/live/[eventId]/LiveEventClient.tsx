'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Youtube, Loader2 } from 'lucide-react';
// Client component

// Helper function to extract YouTube Video ID from various URL formats
const getYouTubeId = (url: string) => {
  if (!url) return '';
  
  try {
    const urlObj = new URL(url);
    
    // Handle youtu.be format
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }
    
    // Handle youtube.com format
    if (urlObj.hostname === 'youtube.com' || urlObj.hostname === 'www.youtube.com') {
      // Handle /watch?v= format
      const videoId = urlObj.searchParams.get('v');
      if (videoId) return videoId;
      
      // Handle /embed/ format
      if (urlObj.pathname.startsWith('/embed/')) {
        return urlObj.pathname.split('/')[2];
      }
      
      // Handle /v/ format
      if (urlObj.pathname.startsWith('/v/')) {
        return urlObj.pathname.split('/')[2];
      }
    }
  } catch (error) {
    console.error('Invalid YouTube URL:', error);
  }
  
  return '';
};

type LiveEvent = {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
};

export default function LiveEventClient({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<LiveEvent | null | undefined>(undefined); // undefined: loading, null: not found

  useEffect(() => {
    if (!eventId) {
      setEvent(null);
      return;
    }

    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) {
          setEvent(null);
          return;
        }
        const data = await response.json();
        setEvent(data);
      } catch (error) {
        console.error('Error fetching event:', error);
        setEvent(null);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (event === undefined) {
      return (
        <div className="flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )
  }

  if (event === null) {
    return (
      <Card className="max-w-4xl mx-auto bg-secondary/30 shadow-lg">
        <CardHeader>
            <CardTitle className="font-headline text-3xl md:text-4xl text-center">Event Not Found</CardTitle>
            <CardDescription className="font-body text-lg pt-2 text-center">
                The live event you are looking for does not exist or may have been removed.
            </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto overflow-hidden bg-secondary/30 shadow-lg">
      <div className="relative w-full pt-[56.25%] bg-black">
        {event.youtubeUrl ? (
          <iframe
            src={`https://www.youtube.com/embed/${getYouTubeId(event.youtubeUrl)}?autoplay=1&modestbranding=1&rel=0`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
          ></iframe>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <Youtube className="h-16 w-16" />
            <p className="mt-4 font-body text-lg">The live stream is not available.</p>
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle className="font-headline text-3xl md:text-4xl">{event.title}</CardTitle>
        <CardDescription className="font-body text-lg pt-2">{event.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="font-body text-muted-foreground">
          <p>Welcome! We're so glad you could join us virtually. Please enjoy the ceremony.</p>
          <p className="mt-2 text-sm">If you're experiencing issues, try refreshing the page or checking your internet connection.</p>
        </div>
      </CardContent>
    </Card>
  );
}