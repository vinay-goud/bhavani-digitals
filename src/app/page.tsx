'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Sparkles, BookOpen, Heart, PlayCircle, ChevronLeft, ChevronRight, X, Film, Rocket, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { getData } from '@/services/dataService';

type GalleryImage = {
    id: string;
    src: string;
    alt: string;
    category?: string;
    'data-ai-hint'?: string;
}

type HomeContent = {
    heroImages: GalleryImage[];
    portfolioImages: GalleryImage[];
}

type AboutContent = {
  id: string;
  about: string | string[];
};

type Service = {
  id: string;
  title: string;
  icon: string;
  description: string;
};

const defaultContent: HomeContent = {
    heroImages: [
      { id: "hero1", src: "https://picsum.photos/1920/1080?random=indian-wedding-hero-1", alt: "Indian Hindu Wedding scene", 'data-ai-hint': "indian wedding" },
      { id: "hero2", src: "https://picsum.photos/1920/1080?random=indian-wedding-hero-2", alt: "Bride and groom at sunset", 'data-ai-hint': "bride groom" },
      { id: "hero3", src: "https://picsum.photos/1920/1080?random=indian-wedding-hero-3", alt: "Joyful wedding celebration", 'data-ai-hint': "wedding celebration" },
    ],
    portfolioImages: [
      { id: "port1", src: "https://picsum.photos/600/800?random=1", alt: "Wedding photo 1", category: "Weddings" },
      { id: "port2", src: "https://picsum.photos/800/600?random=2", alt: "Wedding photo 2", category: "Pre-Weddings" },
      { id: "port3", src: "https://picsum.photos/600/800?random=3", alt: "Wedding photo 3", category: "Receptions" },
      { id: "port4", src: "https://picsum.photos/800/600?random=4", alt: "Wedding photo 4", category: "Weddings" },
      { id: "port5", src: "https://picsum.photos/600/800?random=5", alt: "Wedding photo 5", category: "Candid" },
      { id: "port6", src: "https://picsum.photos/800/600?random=6", alt: "Wedding photo 6", category: "Pre-Weddings" },
    ]
};

const DroneIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M10 10 7 7"/><path d="m10 14-3 3"/>
        <path d="m14 10 3-3"/><path d="m14 14 3 3"/>
        <path d="M14.205 4.139a4 4 0 1 1 5.439 5.863"/>
        <path d="M19.637 14a4 4 0 1 1-5.432 5.868"/>
        <path d="M4.367 10a4 4 0 1 1 5.438-5.862"/>
        <path d="M9.795 19.862a4 4 0 1 1-5.429-5.873"/>
        <rect x="10" y="8" width="4" height="8" rx="1"/>
    </svg>
);

const iconMap: Record<string, React.ComponentType<any>> = {
  Heart,
  Camera,
  DroneIcon,
  Sparkles,
  Film,
  BookOpen,
};

const BackgroundText = () => (
  <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 pointer-events-none">
      <h1 className="text-[20vw] md:text-[15vw] font-extrabold font-headline text-secondary select-none whitespace-nowrap">
          Bhavani
      </h1>
  </div>
);



export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState<HomeContent>(defaultContent);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [aboutContent, setAboutContent] = useState<string[]>([ // fallback static
    "We are a passionate team of photographers and cinematographers dedicated to telling your unique love story. With years of experience and an eye for detail, we specialize in creating a relaxed, enjoyable experience while capturing the most authentic and beautiful moments of your wedding day.",
    "Our style is a blend of timeless portraiture and candid photojournalism, ensuring a collection of memories that you will cherish for a lifetime. We believe that every couple has a story, and it is our privilege to tell it through our lenses."
  ]);
  const [services, setServices] = useState<Service[]>([ // fallback static
    { id: "traditional", title: "Traditional Photography", icon: "Heart", description: "Classic, posed portraits and group shots to cherish for generations." },
    { id: "pre-wedding", title: "Pre-Wedding Shoots", icon: "Camera", description: "Create beautiful narratives of your journey together before the big day." },
    { id: "drone", title: "Drone Shoots", icon: "DroneIcon", description: "Get breathtaking aerial views and cinematic shots of your grand celebration." },
    { id: "candid", title: "Candid Photography", icon: "Sparkles", description: "Freezing genuine emotions and unfiltered moments that tell the real story." },
    { id: "video", title: "Videography", icon: "Film", description: "We offer both artistic cinematography focused on the couple and key family members, and traditional videography to cover the entire event." },
    { id: "albums", title: "Photobooks & Albums", icon: "BookOpen", description: "Beautifully crafted photobooks and albums to preserve your memories in style." },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex(prevIndex => (prevIndex + 1) % (content.heroImages.length || 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [content.heroImages.length]);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      const [heroImagesData, portfolioImagesData, aboutDataRaw, servicesDataRaw] = await Promise.all([
        getData('heroImages'),
        getData('portfolioImages'),
        getData('siteContent'),
        getData('services'),
      ]);
      const loadedContent = {
        heroImages: heroImagesData.length > 0 ? heroImagesData as any : defaultContent.heroImages,
        portfolioImages: portfolioImagesData.length > 0 ? portfolioImagesData as any : defaultContent.portfolioImages
      };
      setContent(loadedContent);

      // About section
      if (Array.isArray(aboutDataRaw) && aboutDataRaw.length > 0) {
        // Type guard function to check if an item is AboutContent
        const isAboutContent = (item: any): item is AboutContent => {
          if (!item || typeof item !== 'object') return false;
          if (!('id' in item) || !('about' in item)) return false;
          if (typeof item.id !== 'string') return false;
          if (Array.isArray(item.about)) {
            return item.about.every((p: any) => typeof p === 'string');
          }
          return typeof item.about === 'string';
        };

        // Filter and type cast at the same time
        const aboutObjs = aboutDataRaw.filter(isAboutContent);

        if (aboutObjs.length > 0) {
          const aboutObj = aboutObjs[0];
          if (Array.isArray(aboutObj.about)) {
            setAboutContent(aboutObj.about);
          } else if (typeof aboutObj.about === 'string') {
            setAboutContent([aboutObj.about]);
          }
        }
      }

      // Services section
      if (Array.isArray(servicesDataRaw) && servicesDataRaw.length > 0) {
        // Type guard function to check if an item is Service
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
        const validServices = servicesDataRaw.filter(isService);
        if (validServices.length > 0) {
          setServices(validServices);
        }
      }
      setIsLoading(false);
    };
    fetchContent();
  }, []);
  
  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    setSelectedImageIndex(null);
  }, []);

  const changeImage = useCallback((direction: 'next' | 'prev') => {
    if (selectedImageIndex === null) return;
    
    const imageCount = content.portfolioImages.length;
    let newIndex;

    if (direction === 'next') {
      newIndex = (selectedImageIndex + 1) % imageCount;
    } else {
      newIndex = (selectedImageIndex - 1 + imageCount) % imageCount;
    }
    setSelectedImageIndex(newIndex);
  }, [selectedImageIndex, content.portfolioImages.length]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxOpen) {
        if (e.key === 'ArrowRight') changeImage('next');
        if (e.key === 'ArrowLeft') changeImage('prev');
        if (e.key === 'Escape') closeLightbox();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, changeImage, closeLightbox]);

  const currentImage = selectedImageIndex !== null ? content.portfolioImages[selectedImageIndex] : null;


  if (isLoading) {
      return (
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 bg-background flex items-center justify-center">
             <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </main>
          <Footer />
        </div>
      )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-background relative">
        <BackgroundText />

        <section className="relative h-screen w-full">
          {content.heroImages.map((image, index) => (
             <Image
              key={image.id}
              src={image.src}
              alt={image.alt}
              fill
              className={cn(
                "object-cover transition-opacity duration-1000",
                index === currentHeroIndex ? "opacity-100" : "opacity-0"
              )}
              priority={index === 0}
              data-ai-hint="indian wedding"
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="relative z-10 flex h-full flex-col items-center justify-end text-center text-white pb-16 sm:pb-24 p-4">
            <h1 className="font-headline text-4xl sm:text-5xl md:text-7xl lg:text-8xl drop-shadow-2xl leading-tight">
              Your Love Story, Beautifully Told
            </h1>
            <p className="font-body mt-4 max-w-3xl text-base sm:text-lg md:text-xl text-stone-200 drop-shadow-md">
              Crafting beautiful, timeless, and authentic memories for the most special day of your life.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg transition-transform hover:scale-105 rounded-full px-8 py-6 text-lg">
                  <Link href="/booking">Inquire Now</Link>
                </Button>
                 <Button asChild size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-black rounded-full px-8 py-6 text-lg shadow-lg transition-transform hover:scale-105">
                  <Link href="/gallery" className="flex items-center gap-2">
                    <PlayCircle className="h-6 w-6" />
                    <span>Watch Films</span>
                  </Link>
                </Button>
            </div>
          </div>
        </section>

        <section id="services" className="py-16 md:py-24 bg-secondary/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="font-headline text-4xl md:text-5xl text-foreground">Our Services</h2>
              <p className="font-body mt-2 text-lg text-muted-foreground">From candid moments to grand celebrations, we cover it all.</p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => {
                const Icon = iconMap[service.icon] || Heart;
                return (
                  <Card key={service.title} className="group transform transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 border-transparent hover:border-primary bg-background">
                    <CardHeader className="flex flex-row items-center gap-4">
                      <Icon className="h-10 w-10 text-primary" />
                      <CardTitle className="font-headline text-2xl text-foreground">{service.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-body text-muted-foreground">
                        {service.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
        
        <section id="gallery" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="font-headline text-4xl md:text-5xl text-foreground">Our Recent Work</h2>
              <p className="font-body mt-2 text-lg text-muted-foreground">A curated collection of stories we've had the honor to tell.</p>
            </div>
             <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {content.portfolioImages.map((image, index) => (
                  <CarouselItem key={image.id} className="md:basis-1/2 lg:basis-1/3">
                    <div className="group relative break-inside-avoid overflow-hidden rounded-lg shadow-lg aspect-[4/3]" onClick={() => openLightbox(index)}>
                      <div className="cursor-pointer">
                          <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 768px) 50vw, 33vw"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-end justify-start">
                            <p className="text-white font-body p-4 text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              {image.category || "Featured"}
                            </p>
                          </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="ml-12"/>
              <CarouselNext className="mr-12"/>
            </Carousel>
            <div className="text-center mt-12">
              <Button asChild size="lg" variant="outline" className="rounded-full px-10 py-6 text-lg">
                <Link href="/gallery">View Full Gallery</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="about" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
              <Card className="bg-secondary/30 border-0 md:border md:max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle className="font-headline text-4xl md:text-5xl text-foreground text-center">About Bhavani Digitals</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  {aboutContent.map((para, idx) => (
                    <p key={idx} className="font-body mt-4 text-lg text-muted-foreground">{para}</p>
                  ))}
                  <Button asChild size="lg" variant="link" className="px-0 text-lg mt-4">
                      <Link href="/contact">Learn More About Us &rarr;</Link>
                  </Button>
                </CardContent>
              </Card>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-secondary/50">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="font-headline text-4xl md:text-5xl text-foreground">Let's Create Something Beautiful</h2>
            <p className="font-body mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Have a question or ready to book your special day? We're here to help.
            </p>
            <Button asChild size="lg" className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90 transition-transform hover:scale-105 rounded-full px-10 py-6 text-lg">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </section>
      </main>
      
      {currentImage && (
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className="max-w-4xl w-full p-2 bg-transparent border-0 shadow-none">
            <div className="relative">
              <Image
                src={currentImage.src}
                alt={currentImage.alt}
                width={1600}
                height={1200}
                className="rounded-lg object-contain w-full h-auto max-h-[85vh]"
              />
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
                onClick={() => changeImage('prev')}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 rounded-full h-10 w-10"
                onClick={() => changeImage('next')}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Footer />
    </div>
  );
}
