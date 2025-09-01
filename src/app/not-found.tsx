'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="font-headline text-4xl md:text-6xl text-foreground">404 - Page Not Found</h1>
          <p className="font-body mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            We couldn't find the page you were looking for. Perhaps it has been moved or deleted.
          </p>
          <Button asChild className="mt-8" size="lg">
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
