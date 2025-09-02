import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import LiveEventClient from './LiveEventClient';
import { Metadata, ResolvingMetadata } from 'next';
import { getEventData } from '@/services/dataService';

type Props = {
  params: { eventId: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const event = await getEventData(params.eventId);
  
  if (!event) {
    return {
      title: 'Event Not Found | BDS',
      description: 'The live event you are looking for does not exist or may have been removed.',
    }
  }

  return {
    title: `${event.title} | BDS Live`,
    description: event.description,
  }
}

export const dynamic = 'force-static';

export async function generateStaticParams() {
  // Return at least one param for static export to work
  return [
    { eventId: 'default' }
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
