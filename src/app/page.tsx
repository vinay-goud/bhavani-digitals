import { getData } from '@/services/dataService';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { GalleryImage, AboutContent, Service } from './types';

const HomePage = dynamic(() => import('./HomePage'), {
  loading: () => (
    <div className="flex-1 bg-background flex items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin" />
    </div>
  ),
  ssr: true,
});

async function getHomeData() {
  const [heroImagesRaw, portfolioImagesRaw, aboutDataRaw, servicesDataRaw] = await Promise.all([
    getData('heroImages'),
    getData('portfolioImages'),
    getData('siteContent'),
    getData('services'),
  ]);

  // Type guard functions
  const isGalleryImage = (item: any): item is GalleryImage => {
    if (!item || typeof item !== 'object') return false;
    if (!('id' in item) || !('src' in item) || !('alt' in item)) return false;
    return (
      typeof item.id === 'string' &&
      typeof item.src === 'string' &&
      typeof item.alt === 'string'
    );
  };

  const isAboutContent = (item: any): item is AboutContent => {
    if (!item || typeof item !== 'object') return false;
    if (!('id' in item) || !('about' in item)) return false;
    if (typeof item.id !== 'string') return false;
    if (Array.isArray(item.about)) {
      return item.about.every((p: any) => typeof p === 'string');
    }
    return typeof item.about === 'string';
  };

  const isService = (item: any): item is Service => {
    if (!item || typeof item !== 'object') return false;
    if (!('id' in item) || !('title' in item) || !('icon' in item) || !('description' in item)) return false;
    return (
      typeof item.id === 'string' &&
      typeof item.title === 'string' &&
      typeof item.icon === 'string' &&
      typeof item.description === 'string'
    );
  };

  // Type check and filter the data
  const heroImagesData = Array.isArray(heroImagesRaw) ? heroImagesRaw.filter(isGalleryImage) : [];
  const portfolioImagesData = Array.isArray(portfolioImagesRaw) ? portfolioImagesRaw.filter(isGalleryImage) : [];
  const aboutData = Array.isArray(aboutDataRaw) ? aboutDataRaw.filter(isAboutContent) : [];
  const services = Array.isArray(servicesDataRaw) ? servicesDataRaw.filter(isService) : [];

  return {
    heroImagesData,
    portfolioImagesData,
    aboutDataRaw: aboutData,
    servicesDataRaw: services
  };
}

export default async function Page() {
  const initialData = await getHomeData();

  return (
    <Suspense fallback={
      <div className="flex-1 bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    }>
      <HomePage initialData={initialData} />
    </Suspense>
  );
}
