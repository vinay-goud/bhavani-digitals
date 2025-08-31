
'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Youtube, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getDataById } from '@/services/dataService';

// Helper function to extract YouTube Video ID from various URL formats
const getYouTubeId = (url: string) => {
    let videoId = '';
    if (!url) return videoId;
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    if (match && match[1]) {
        videoId = match[1];
    }
    return videoId;
};

type LiveEvent = {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
};

export default function LiveEventPage({ params }: { params: { eventId: string } }) {
  const [event, setEvent] = useState<LiveEvent | null | undefined>(undefined); // undefined: loading, null: not found

  useEffect(() => {
    if (!params.eventId) {
      setEvent(null);
      return;
    }

    const fetchEvent = async () => {
        const eventData = await getDataById('liveEvents', params.eventId);
        setEvent(eventData as LiveEvent | null);
    };

    fetchEvent();
  }, [params.eventId]);

  if (event === undefined) {
      return (
         <>
          <Header />
           <main className="min-h-screen bg-background py-16 md:py-24 flex items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </main>
          <Footer />
        </>
      )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          {event === null ? (
             <Card className="max-w-4xl mx-auto bg-secondary/30 shadow-lg">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl md:text-4xl text-center">Event Not Found</CardTitle>
                    <CardDescription className="font-body text-lg pt-2 text-center">
                        The live event you are looking for does not exist or may have been removed.
                    </CardDescription>
                </CardHeader>
             </Card>
          ) : (
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
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
