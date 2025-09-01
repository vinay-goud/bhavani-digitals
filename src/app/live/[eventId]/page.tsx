// Static page
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import LiveEventClient from './LiveEventClient';

type LiveEvent = {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
};

export const dynamicParams = false;

export function generateStaticParams() {
  // For static export, we'll pre-render a few dummy event IDs
  return [
    { eventId: 'event1' },
    { eventId: 'event2' },
    { eventId: 'event3' }
  ];
}

export default function LiveEventPage({ params }: { params: { eventId: string } }) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <LiveEventClient eventId={params.eventId} />
        </div>
      </main>
      <Footer />
    </>
  );
}
