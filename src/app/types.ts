export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category?: string;
}

export interface HomeContent {
  heroImages: GalleryImage[];
  portfolioImages: GalleryImage[];
}

export interface Service {
  id: string;
  title: string;
  icon: string;
  description: string;
}

export interface AboutContent {
  id: string;
  about: string[] | string;
}
