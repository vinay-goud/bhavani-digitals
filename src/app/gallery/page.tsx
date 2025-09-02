
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Film, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { getGalleryData } from '@/services/dataService';

type MediaType = 'image' | 'video';

type GalleryItem = {
    id: string;
    type: MediaType;
    src: string; // URL for image or YouTube Video ID for video
    alt: string;
    category: string;
    aspectRatio?: 'vertical' | 'horizontal';
};

type GalleryCategory = {
    name: string;
    items: GalleryItem[];
};

type GalleryData = {
    [key: string]: GalleryCategory;
};

// Define the order of categories
const categoryOrder = ['weddings', 'pre-weddings', 'receptions', 'others'];

const defaultGallery: GalleryData = {
  weddings: { name: 'Weddings', items: [] },
  'pre-weddings': { name: 'Pre-Weddings', items: [] },
  receptions: { name: 'Receptions', items: [] },
  others: { name: 'Others', items: [] },
};

type CategoryKey = keyof GalleryData;

export default function GalleryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<GalleryData>(defaultGallery);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ category: CategoryKey; index: number } | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
        setIsLoading(true);
        const galleryData = await getGalleryData();
        setCategories(galleryData as GalleryData || defaultGallery);
        setIsLoading(false);
    }
    fetchGallery();
  }, []);

  const openLightbox = (category: CategoryKey, index: number) => {
    setSelectedItem({ category, index });
    setLightboxOpen(true);
  };

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    setSelectedItem(null);
  }, []);

  const changeItem = useCallback((direction: 'next' | 'prev') => {
    if (!selectedItem) return;

    const { category, index } = selectedItem;
    const categoryItems = categories[category]?.items;
    if (!categoryItems || categoryItems.length === 0) return;

    const itemCount = categoryItems.length;
    let newIndex;

    if (direction === 'next') {
      newIndex = (index + 1) % itemCount;
    } else {
      newIndex = (index - 1 + itemCount) % itemCount;
    }
    setSelectedItem({ category, index: newIndex });
  }, [selectedItem, categories]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxOpen) {
        if (e.key === 'ArrowRight') changeItem('next');
        if (e.key === 'ArrowLeft') changeItem('prev');
        if (e.key === 'Escape') closeLightbox();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, changeItem, closeLightbox]);

  const currentItem = selectedItem ? categories[selectedItem.category]?.items[selectedItem.index] : null;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h1 className="font-headline text-4xl md:text-5xl text-foreground">Our Portfolio</h1>
            <p className="font-body mt-2 text-lg text-muted-foreground">
              A collection of moments and stories we've had the honor to capture.
            </p>
          </div>
          <Tabs defaultValue="weddings" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-secondary h-auto">
              {categoryOrder.map((key) => (
                <TabsTrigger key={key} value={key} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-10">
                  {categories[key as CategoryKey].name}
                </TabsTrigger>
              ))}
            </TabsList>

            {categoryOrder.map((key) => {
              const category = categories[key as CategoryKey];
              if (isLoading) {
                  return (
                      <TabsContent key={key} value={key}>
                        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 mt-8">
                            {Array.from({length: 8}).map((_, i) => (
                                <Skeleton key={i} className={cn("rounded-lg block break-inside-avoid", i % 2 === 0 ? 'aspect-[3/4]' : 'aspect-video')} />
                            ))}
                        </div>
                      </TabsContent>
                  )
              }
              if (!category || !category.items) return null;

              return (
              <TabsContent key={key} value={key}>
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 mt-8">
                  {category.items.map((item, index) => (
                    <div
                      key={item.id || index}
                      className={cn(
                          "group relative cursor-pointer overflow-hidden rounded-lg shadow-lg block break-inside-avoid",
                          item.type === 'image' && item.aspectRatio === 'vertical' ? 'aspect-[3/4]' : 'aspect-video'
                      )}
                      onClick={() => openLightbox(key as CategoryKey, index)}
                    >
                      {item.type === 'image' ? (
                         <Image
                            src={item.src}
                            alt={item.alt}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-black flex items-center justify-center">
                            <Image
                                src={`https://img.youtube.com/vi/${item.src}/hqdefault.jpg`}
                                alt={item.alt}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110 opacity-70"
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors" />
                       <div className="absolute top-2 right-2 text-white z-10">
                          {item.type === 'video' ? <Film className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
                       </div>
                    </div>
                  ))}
                </div>
                 {category.items.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        <p>No items in this category yet. Check back soon!</p>
                    </div>
                 )}
              </TabsContent>
            )})}
          </Tabs>
        </div>
      </main>
      
      {currentItem && (
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className="max-w-4xl w-full p-2 bg-transparent border-0 shadow-none">
            <DialogHeader>
              <DialogTitle className="sr-only">{currentItem.alt}</DialogTitle>
              <DialogDescription className="sr-only">Showing item {selectedItem ? selectedItem.index + 1 : 0} of {selectedItem && categories[selectedItem.category]?.items ? categories[selectedItem.category].items.length : 0}: {currentItem.alt}</DialogDescription>
            </DialogHeader>
            <div className="relative">
              {currentItem.type === 'image' ? (
                <Image
                  src={currentItem.src}
                  alt={currentItem.alt}
                  width={1600}
                  height={1200}
                  className="rounded-lg object-contain w-full h-auto max-h-[85vh]"
                />
              ) : (
                 <div className="aspect-video w-full">
                  <iframe
                    src={`https://www.youtube.com/embed/${currentItem.src}?autoplay=1&modestbranding=1&rel=0`}
                    title={currentItem.alt}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full rounded-lg"
                  ></iframe>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-2 -right-2 text-white bg-black/30 hover:bg-black/50 rounded-full h-8 w-8 z-10"
                onClick={closeLightbox}
              >
                <X className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 rounded-full h-10 w-10"
                onClick={() => changeItem('prev')}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 rounded-full h-10 w-10"
                onClick={() => changeItem('next')}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Footer />
    </>
  );
}
