
'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Youtube, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getData } from '@/services/dataService';

type Video = {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
};

// Helper function to extract YouTube Video ID from various URL formats
const getYouTubeId = (url: string) => {
    let videoId = '';
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    if (match && match[1]) {
        videoId = match[1];
    }
    return videoId;
};

export default function FilmsPage() {
  const [videos, setVideos] = useState<Video[] | undefined>(undefined); // undefined: loading

  useEffect(() => {
    const fetchVideos = async () => {
        const videosData = await getData('videos');
        setVideos(videosData as Video[]);
    };
    fetchVideos();
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
           <div className="text-center mb-12">
            <h1 className="font-headline text-4xl md:text-5xl text-foreground">Cinematic Stories</h1>
            <p className="font-body mt-2 text-lg text-muted-foreground">
              Watch our latest cinematic stories and films.
            </p>
          </div>
          
          {videos === undefined && (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          )}
          
          {videos && videos.length === 0 && (
             <Card className="max-w-4xl mx-auto bg-secondary/30 shadow-lg">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl md:text-4xl text-center">No Films Yet</CardTitle>
                    <CardDescription className="font-body text-lg pt-2 text-center">
                        We're busy creating beautiful films. Please check back soon!
                    </CardDescription>
                </CardHeader>
             </Card>
          )}

          {videos && videos.length > 0 && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {videos.map(video => {
                    const videoId = getYouTubeId(video.youtubeUrl);
                    return (
                        <Card key={video.id} className="overflow-hidden bg-secondary/30 shadow-lg">
                            <div className="relative w-full pt-[56.25%] bg-black">
                                {videoId ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0`}
                                    title={video.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="absolute top-0 left-0 w-full h-full"
                                ></iframe>
                                ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                                    <Youtube className="h-16 w-16" />
                                    <p className="mt-4 font-body text-lg">Invalid YouTube Link</p>
                                </div>
                                )}
                            </div>
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl">{video.title}</CardTitle>
                                <CardDescription className="font-body text-base pt-2">{video.description}</CardDescription>
                            </CardHeader>
                        </Card>
                    )
                })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
