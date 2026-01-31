'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Reorder } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Wand2, Trash2, GripVertical, Mail, Phone, Calendar, MapPin, UploadCloud, Check, PlusCircle, FileUp, Edit, Copy, Heart, Camera, Sparkles, Film, BookOpen, Users, Shield, ShieldOff, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, X, Save } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const DroneIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M10 10 7 7" /><path d="m10 14-3 3" />
        <path d="m14 10 3-3" /><path d="m14 14 3 3" />
        <path d="M14.205 4.139a4 4 0 1 1 5.439 5.863" />
        <path d="M19.637 14a4 4 0 1 1-5.432 5.868" />
        <path d="M4.367 10a4 4 0 1 1 5.438-5.862" />
        <path d="M9.795 19.862a4 4 0 1 1-5.429-5.873" />
        <rect x="10" y="8" width="4" height="8" rx="1" />
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
import { enhanceWebsiteSEO } from '@/ai/flows/enhance-website-seo';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useIsLoggedIn } from '@/hooks/useAuth';
import {
    getData,
    getDataById,
    saveData,
    deleteData,
    saveOrderedData,
    uploadFile,
    getGalleryData,
    saveGalleryData,
    getUsers,
    updateUserRole,
    UserProfile,
    UserRole
} from '@/services/dataServiceClient';

// Helper to generate a truly unique ID
const generateUniqueId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const defaultServices: Service[] = [
    { id: "traditional", title: "Traditional Photography", icon: "Heart", description: "Classic, posed portraits and group shots to cherish for generations." },
    { id: "pre-wedding", title: "Pre-Wedding Shoots", icon: "Camera", description: "Create beautiful narratives of your journey together before the big day." },
    { id: "drone", title: "Drone Shoots", icon: "DroneIcon", description: "Get breathtaking aerial views and cinematic shots of your grand celebration." },
    { id: "candid", title: "Candid Photography", icon: "Sparkles", description: "Freezing genuine emotions and unfiltered moments that tell the real story." },
    { id: "video", title: "Videography", icon: "Film", description: "We offer both artistic cinematography focused on the couple and key family members, and traditional videography to cover the entire event." },
    { id: "albums", title: "Photobooks & Albums", icon: "BookOpen", description: "Beautifully crafted photobooks and albums to preserve your memories in style." },
];

const defaultBookings = [
    { id: '1', name: 'Rohan & Priya', eventDate: '2024-10-26', eventType: 'Wedding', status: 'Pending', email: 'rohan.p@example.com', phone: '9876543210', venue: 'The Grand Palace', notes: 'Looking for candid and traditional mix.' },
];
const defaultContacts = [
    { id: '1', name: 'Ananya Roy', email: 'ananya.r@example.com', subject: 'Inquiry about wedding packages', message: 'Hi, could you please send me your wedding photography packages and pricing? Thanks!' },
];

type MediaType = 'image' | 'video';

type GalleryItem = {
    id: string;
    type: MediaType;
    src: string;
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

type Service = {
    id: string;
    title: string;
    icon: string;
    description: string;
};

type AboutContent = {
    id: string;
    about: string | string[];
};

const defaultGallery: GalleryData = {
    weddings: { name: 'Weddings', items: [] },
    'pre-weddings': { name: 'Pre-Weddings', items: [] },
    receptions: { name: 'Receptions', items: [] },
    others: { name: 'Others', items: [] },
};

const galleryFormSchema = z.object({
    items: z.array(z.object({
        id: z.string(),
        type: z.enum(['image', 'video']),
        src: z.string().min(1, 'URL or Video ID is required.'),
        alt: z.string(),
        category: z.string(),
        aspectRatio: z.enum(['vertical', 'horizontal']).optional(),
    }))
});

type GalleryFormValues = z.infer<typeof galleryFormSchema>;

type LiveEvent = {
    id: string;
    title: string;
    description: string;
    youtubeUrl: string;
};

const liveEventSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(3, "Title must be at least 3 characters."),
    description: z.string().min(10, "Description must be at least 10 characters."),
    youtubeUrl: z.string().url("Please enter a valid YouTube URL."),
});

type LiveEventFormValues = z.infer<typeof liveEventSchema>;

const defaultLiveEvents: LiveEvent[] = [
    { id: "default-live-event-1", title: "Priya & Rohan's Wedding", description: "Join us in celebrating the beautiful union of Priya and Rohan, live from The Grand Palace.", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
];

type Video = {
    id: string;
    title: string;
    description: string;
    youtubeUrl: string;
};

const videoSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(3, "Title must be at least 3 characters."),
    description: z.string().min(10, "Description must be at least 10 characters."),
    youtubeUrl: z.string().url("Please enter a valid YouTube URL."),
});

type VideoFormValues = z.infer<typeof videoSchema>;

const defaultVideos: Video[] = [
    { id: "default-film-1", title: "Beautiful Cinematic Wedding Film", description: "A highlight reel of one of our favorite weddings. Pure emotion and cinematic beauty.", youtubeUrl: "https://www.youtube.com/watch?v=Y5mpU5T2xXw" },
    { id: "default-film-2", title: "Pre-Wedding Adventure in the Hills", description: "An adventurous pre-wedding shoot capturing the couple's love for nature.", youtubeUrl: "https://www.youtube.com/watch?v=0vF3HqORb3Y" },
];

const defaultHomeContent = {
    heroImages: [
        { id: "hero1", src: "https://picsum.photos/1920/1080?random=indian-wedding-hero-1", alt: "Indian Hindu Wedding scene", 'data-ai-hint': "indian wedding" },
        { id: "hero2", src: "https://picsum.photos/1920/1080?random=indian-wedding-hero-2", alt: "Bride and groom at sunset", 'data-ai-hint': "bride groom" },
        { id: "hero3", src: "https://picsum.photos/1920/1080?random=indian-wedding-hero-3", alt: "Joyful wedding celebration", 'data-ai-hint': "wedding celebration" },
    ],
    portfolioImages: Array.from({ length: 6 }, (_, i) => ({ id: `port${i + 1}`, src: `https://picsum.photos/800/600?random=${i + 1}`, alt: `Wedding photo ${i + 1}` }))
};

const seoSchema = z.object({
    websiteContent: z.string().min(50, 'Content must be at least 50 characters.'),
});

type SeoFormValues = z.infer<typeof seoSchema>;

const seoDefaultContent = "Bhavani Digitals offers premier wedding photography and videography. We capture beautiful moments in candid and traditional styles. Our services include pre-wedding shoots, drone videography, and custom album design. Based in Celebration City, we are the top choice for couples who want their memories preserved perfectly. Contact us for your special day."

export default function AdminPage() {
    const { toast } = useToast();
    const { isLoggedIn, role, isLoading: isAuthLoading } = useIsLoggedIn();
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingSeo, setIsLoadingSeo] = useState(false);
    const [seoResult, setSeoResult] = useState<{ keywords: string, guidance: string } | null>(null);

    const [services, setServices] = useState<Service[]>(defaultServices);
    const [aboutContent, setAboutContent] = useState<string[]>([
        "We are a passionate team of photographers and cinematographers dedicated to telling your unique love story. With years of experience and an eye for detail, we specialize in creating a relaxed, enjoyable experience while capturing the most authentic and beautiful moments of your wedding day.",
        "Our style is a blend of timeless portraiture and candid photojournalism, ensuring a collection of memories that you will cherish for a lifetime. We believe that every couple has a story, and it is our privilege to tell it through our lenses."
    ]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);
    const [selectedContact, setSelectedContact] = useState<any | null>(null);
    const [gallery, setGallery] = useState<GalleryData>(defaultGallery);
    const [homeContent, setHomeContent] = useState(defaultHomeContent);
    const [currentPortfolioItems, setCurrentPortfolioItems] = useState(defaultHomeContent.portfolioImages);
    const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
    const [editingEvent, setEditingEvent] = useState<LiveEvent | null>(null);
    const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
    const [videos, setVideos] = useState<Video[]>([]);
    const [editingVideo, setEditingVideo] = useState<Video | null>(null);
    const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
    const [portfolioOrderChanged, setPortfolioOrderChanged] = useState(false);
    const [users, setUsers] = useState<UserProfile[]>([]);

    const seoForm = useForm<SeoFormValues>({
        resolver: zodResolver(seoSchema),
        defaultValues: { websiteContent: seoDefaultContent }
    });

    const galleryForm = useForm<GalleryFormValues>({
        resolver: zodResolver(galleryFormSchema),
        defaultValues: { items: [] },
    });

    const eventForm = useForm<LiveEventFormValues>({
        resolver: zodResolver(liveEventSchema),
    });

    const videoForm = useForm<VideoFormValues>({
        resolver: zodResolver(videoSchema),
    });

    const { fields, append, remove, move } = useFieldArray({
        control: galleryForm.control,
        name: "items"
    });

    // Effect to load all data from Firestore on component mount
    useEffect(() => {
        if (!isLoggedIn) return;

        const fetchData = async () => {
            setIsLoading(true);
            const [
                bookingsData,
                contactsData,
                galleryData,
                heroImagesData,
                portfolioImagesData,
                liveEventsData,
                videosData,
                servicesData,
                aboutData,
                usersData
            ] = await Promise.all([
                getData('bookings'),
                getData('contacts'),
                getGalleryData(),
                getData('heroImages'),
                getData('portfolioImages'),
                getData('liveEvents'),
                getData('videos'),
                getData('services'),
                getData('siteContent'),
                getUsers()
            ]);

            setBookings(bookingsData.length > 0 ? bookingsData : defaultBookings);
            setContacts(contactsData.length > 0 ? contactsData : defaultContacts);

            const loadedGallery = galleryData as GalleryData || defaultGallery;
            setGallery(loadedGallery);
            const allItems = Object.values(loadedGallery).flatMap(cat => cat.items);
            galleryForm.reset({ items: allItems });

            const newHomeContent = {
                heroImages: heroImagesData.length > 0 ? heroImagesData as any : defaultHomeContent.heroImages,
                portfolioImages: portfolioImagesData.length > 0 ? portfolioImagesData as any : defaultHomeContent.portfolioImages,
            };
            setHomeContent(newHomeContent);
            setCurrentPortfolioItems(newHomeContent.portfolioImages.map((p: { id?: string }) => ({ ...p, id: p.id || generateUniqueId() })));

            setLiveEvents(liveEventsData.length > 0 ? liveEventsData as any : defaultLiveEvents);
            setVideos(videosData.length > 0 ? videosData as any : defaultVideos);

            // Services section
            if (Array.isArray(servicesData) && servicesData.length > 0) {
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
                const validServices = servicesData.filter(isService);
                if (validServices.length > 0) {
                    setServices(validServices);
                }
            }

            // About section
            if (Array.isArray(aboutData) && aboutData.length > 0) {
                const isAboutContent = (item: any): item is AboutContent => {
                    if (!item || typeof item !== 'object') return false;
                    if (!('id' in item) || !('about' in item)) return false;
                    if (typeof item.id !== 'string') return false;
                    if (Array.isArray(item.about)) {
                        return item.about.every((p: unknown) => typeof p === 'string');
                    }
                    return typeof item.about === 'string';
                };
                const aboutObjs = aboutData.filter(isAboutContent);
                if (aboutObjs.length > 0) {
                    const aboutObj = aboutObjs[0];
                    if (Array.isArray(aboutObj.about)) {
                        setAboutContent(aboutObj.about);
                    } else if (typeof aboutObj.about === 'string') {
                        setAboutContent([aboutObj.about]);
                    }
                }
            }

            // Users
            if (Array.isArray(usersData)) {
                setUsers(usersData);
            }

            setIsLoading(false);
        };

        fetchData();
    }, [isLoggedIn, galleryForm]);

    useEffect(() => {
        if (homeContent) {
            const portfolioImagesWithIds = homeContent.portfolioImages.map((img) => ({
                ...img,
                id: img.id || generateUniqueId(),
            }));
            setCurrentPortfolioItems(portfolioImagesWithIds);
            setPortfolioOrderChanged(false);
        }
    }, [homeContent]);

    useEffect(() => {
        if (editingEvent) {
            eventForm.reset(editingEvent);
        } else {
            eventForm.reset({ title: '', description: '', youtubeUrl: '' });
        }
    }, [editingEvent, eventForm]);

    useEffect(() => {
        if (editingVideo) {
            videoForm.reset(editingVideo);
        } else {
            videoForm.reset({ title: '', description: '', youtubeUrl: '' });
        }
    }, [editingVideo, videoForm]);

    useEffect(() => {
        if (!isAuthLoading && !isLoggedIn) {
            window.location.href = '/auth';
        }
        // Redirect non-admins to their dashboard
        if (!isAuthLoading && isLoggedIn && role !== 'admin') {
            window.location.href = '/dashboard';
        }
    }, [isLoggedIn, role, isAuthLoading]);

    if (isAuthLoading || isLoading) {
        return (
            <main className="min-h-screen bg-background py-16 md:py-24 flex items-center justify-center">
                <div className="container mx-auto px-4 md:px-6">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin" />
                </div>
            </main>
        )
    }

    async function onSeoSubmit(data: SeoFormValues) {
        setIsLoadingSeo(true);
        setSeoResult(null);
        try {
            const response = await fetch('/api/ai/seo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Failed to fetch');
            const result = await response.json();
            setSeoResult(result);
        } catch (error) {
            console.error('SEO Enhancement Error:', error);
            toast({ title: 'Error', description: 'Failed to get SEO suggestions.', variant: 'destructive' });
        } finally {
            setIsLoadingSeo(false);
        }
    }

    const onGallerySubmit = async (data: GalleryFormValues) => {
        const newGallery: GalleryData = { ...defaultGallery };
        Object.keys(newGallery).forEach(key => {
            newGallery[key as keyof GalleryData].items = [];
        });

        data.items.forEach(item => {
            if (newGallery[item.category]) {
                newGallery[item.category].items.push({ ...item, alt: item.alt || 'Gallery item' });
            }
        });

        const result = await saveGalleryData(newGallery);
        if (result.success) {
            setGallery(newGallery);
            toast({ title: 'Success', description: 'Gallery has been updated!' });
        } else {
            toast({ title: 'Error', description: 'Failed to update gallery.', variant: 'destructive' });
        }
    };

    const handleFileUpload = async (file: File, callback: (url: string, name: string) => void) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            const result = event.target?.result as string;
            const path = `gallery/${file.name}_${Date.now()}`;
            const uploadResult = await uploadFile(path, result);
            if (uploadResult.success && uploadResult.url) {
                callback(uploadResult.url, file.name);
            } else {
                toast({ title: 'Upload Failed', description: uploadResult.error, variant: 'destructive' });
            }
        };
        reader.readAsDataURL(file);
    };

    const addGalleryItemFromFile = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        toast({ title: 'Uploading...', description: 'Please wait while the image is uploaded.' });
        handleFileUpload(files[0], (url, name) => {
            append({
                id: generateUniqueId(),
                type: 'image',
                src: url,
                alt: name,
                category: 'weddings', // Default category
                aspectRatio: 'horizontal',
            });
            toast({ title: 'Success', description: 'Image added to gallery items. Please save to confirm.' });
        });
    };

    const handleHeroImageUpload = (files: FileList | null, index: number) => {
        if (!files || files.length === 0) return;
        toast({ title: 'Uploading...', description: 'Please wait while the image is uploaded.' });
        handleFileUpload(files[0], async (url, name) => {
            const newImages = [...homeContent.heroImages];
            newImages[index] = { ...newImages[index], src: url, alt: name };
            const result = await saveOrderedData('heroImages', newImages);
            if (result.success) {
                setHomeContent(prev => ({ ...prev, heroImages: newImages }));
                toast({ title: 'Success', description: `Hero image ${index + 1} updated.` });
            } else {
                toast({ title: 'Error', description: 'Failed to update hero image.', variant: 'destructive' });
            }
        });
    };

    const handlePortfolioImageDelete = async (id: string) => {
        const newImages = currentPortfolioItems.filter(img => img.id !== id);
        const result = await saveOrderedData('portfolioImages', newImages);
        if (result.success) {
            setCurrentPortfolioItems(newImages);
            setHomeContent(prev => ({ ...prev, portfolioImages: newImages }));
            toast({ title: 'Success', description: 'Portfolio image removed.' });
        } else {
            toast({ title: 'Error', description: 'Failed to remove portfolio image.', variant: 'destructive' });
        }
    };

    const handlePortfolioImageUpload = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        toast({ title: 'Uploading...', description: 'Please wait while the image is uploaded.' });
        handleFileUpload(files[0], (url, name) => {
            const newImage = { id: generateUniqueId(), src: url, alt: name };
            const newImages = [...currentPortfolioItems, newImage];
            setCurrentPortfolioItems(newImages);
            toast({ title: 'Success', description: 'New portfolio image added. Save order to confirm.' });
            setPortfolioOrderChanged(true);
        });
    };

    const savePortfolioOrder = async () => {
        const result = await saveOrderedData('portfolioImages', currentPortfolioItems);
        if (result.success) {
            setHomeContent(prev => ({ ...prev, portfolioImages: currentPortfolioItems }));
            setPortfolioOrderChanged(false);
            toast({ title: 'Success', description: `Portfolio images reordered.` });
        } else {
            toast({ title: 'Error', description: 'Failed to save portfolio order.', variant: 'destructive' });
        }
    }

    const handleNewEvent = () => {
        setEditingEvent(null);
        eventForm.reset({ title: '', description: '', youtubeUrl: '' });
        setIsEventDialogOpen(true);
    }

    const handleEditEvent = (event: LiveEvent) => {
        setEditingEvent(event);
        setIsEventDialogOpen(true);
    }

    const handleDeleteEvent = async (eventId: string) => {
        const result = await deleteData('liveEvents', eventId);
        if (result.success) {
            const updatedEvents = liveEvents.filter(e => e.id !== eventId);
            setLiveEvents(updatedEvents);
            toast({ title: 'Success', description: 'Live event deleted.' });
        } else {
            toast({ title: 'Error', description: 'Failed to delete live event.', variant: 'destructive' });
        }
    }

    const onEventFormSubmit = async (data: LiveEventFormValues) => {
        const id = editingEvent ? editingEvent.id : generateUniqueId();
        const eventData = { ...data, id };

        const result = await saveData('liveEvents', id, eventData);
        if (result.success) {
            let updatedEvents;
            if (editingEvent) {
                updatedEvents = liveEvents.map(e => e.id === id ? eventData : e);
                toast({ title: 'Success', description: 'Live event updated.' });
            } else {
                updatedEvents = [...liveEvents, eventData];
                toast({ title: 'Success', description: 'New live event created.' });
            }
            setLiveEvents(updatedEvents);
            setIsEventDialogOpen(false);
            setEditingEvent(null);
        } else {
            toast({ title: 'Error', description: 'Failed to save live event.', variant: 'destructive' });
        }
    }

    const handleNewVideo = () => {
        setEditingVideo(null);
        videoForm.reset({ title: '', description: '', youtubeUrl: '' });
        setIsVideoDialogOpen(true);
    };

    const handleEditVideo = (video: Video) => {
        setEditingVideo(video);
        setIsVideoDialogOpen(true);
    };

    const handleDeleteVideo = async (videoId: string) => {
        const result = await deleteData('videos', videoId);
        if (result.success) {
            const updatedVideos = videos.filter(v => v.id !== videoId);
            setVideos(updatedVideos);
            toast({ title: 'Success', description: 'Video deleted.' });
        } else {
            toast({ title: 'Error', description: 'Failed to delete video.', variant: 'destructive' });
        }
    };

    const onVideoFormSubmit = async (data: VideoFormValues) => {
        const id = editingVideo ? editingVideo.id : generateUniqueId();
        const videoData = { ...data, id };

        const result = await saveData('videos', id, videoData);
        if (result.success) {
            let updatedVideos;
            if (editingVideo) {
                updatedVideos = videos.map(v => v.id === id ? videoData : v);
                toast({ title: 'Success', description: 'Video updated.' });
            } else {
                updatedVideos = [...videos, videoData];
                toast({ title: 'Success', description: 'New video created.' });
            }
            setVideos(updatedVideos);
            setIsVideoDialogOpen(false);
            setEditingVideo(null);
        } else {
            toast({ title: 'Error', description: 'Failed to save video.', variant: 'destructive' });
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast({ title: "Copied!", description: "Link copied to clipboard." });
        }, (err) => {
            toast({ title: "Error", description: "Failed to copy link.", variant: "destructive" });
        });
    }

    const handleBookingAction = async (bookingId: string, status: 'Approved' | 'Rejected') => {
        const booking = bookings.find(b => b.id === bookingId);
        if (!booking) return;

        const updatedBooking = { ...booking, status };
        const result = await saveData('bookings', bookingId, updatedBooking);

        if (result.success) {
            const newBookings = bookings.map(b => b.id === bookingId ? updatedBooking : b);
            setBookings(newBookings);

            // Send email notification
            try {
                const response = await fetch('/api/notify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: booking.email,
                        subject: `Booking ${status}: ${booking.eventType} on ${booking.eventDate}`,
                        text: `Dear ${booking.name},\n\nYour booking for ${booking.eventType} on ${booking.eventDate} has been ${status.toLowerCase()}.\n\nBest regards,\nBhavani Digitals Team`
                    })
                });

                if (!response.ok) throw new Error('Failed to send notification');

                toast({
                    title: 'Success',
                    description: `Booking ${status.toLowerCase()} and notification sent.`
                });
            } catch (error) {
                console.error('Failed to send notification:', error);
                toast({
                    title: 'Partial Success',
                    description: `Booking ${status.toLowerCase()} but failed to send notification.`,
                    variant: 'destructive'
                });
            }
        } else {
            toast({
                title: 'Error',
                description: `Failed to ${status.toLowerCase()} booking.`,
                variant: 'destructive'
            });
        }
    };

    const handleDeleteBooking = async (bookingId: string) => {
        const result = await deleteData('bookings', bookingId);
        if (result.success) {
            const newBookings = bookings.filter(b => b.id !== bookingId);
            setBookings(newBookings);
            toast({ title: 'Success', description: 'Booking deleted.' });
        } else {
            toast({ title: 'Error', description: 'Failed to delete booking.', variant: 'destructive' });
        }
    };

    return (
        <>

            <main className="min-h-screen bg-background py-16 md:py-24">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="mb-12">
                        <h1 className="font-headline text-4xl md:text-5xl text-foreground">Admin Dashboard</h1>
                        <p className="font-body mt-2 text-lg text-muted-foreground">Manage your business operations.</p>
                    </div>

                    <Tabs defaultValue="bookings" className="w-full">
                        <TabsList className="flex flex-wrap h-auto w-full bg-secondary p-1">
                            <TabsTrigger value="bookings" className="flex-1 min-w-[100px]">Bookings</TabsTrigger>
                            <TabsTrigger value="contacts" className="flex-1 min-w-[100px]">Contacts</TabsTrigger>
                            <TabsTrigger value="gallery" className="flex-1 min-w-[100px]">Gallery</TabsTrigger>
                            <TabsTrigger value="home-content" className="flex-1 min-w-[100px]">Home Page</TabsTrigger>
                            <TabsTrigger value="content" className="flex-1 min-w-[100px]">Content</TabsTrigger>
                            <TabsTrigger value="live-events" className="flex-1 min-w-[100px]">Live Events</TabsTrigger>
                            <TabsTrigger value="films" className="flex-1 min-w-[100px]">Films</TabsTrigger>
                            <TabsTrigger value="users" className="flex-1 min-w-[100px]">Users</TabsTrigger>
                            <TabsTrigger value="seo-tools" className="flex-1 min-w-[100px]">SEO</TabsTrigger>
                        </TabsList>

                        <TabsContent value="bookings" className="mt-8">
                            <Card>
                                <CardHeader><CardTitle>Manage Bookings</CardTitle><CardDescription>Review and manage booking inquiries.</CardDescription></CardHeader>
                                <CardContent>
                                    <div className="md:hidden space-y-4">
                                        {bookings.map((booking) => (
                                            <Card key={booking.id} className="bg-muted/50">
                                                <CardHeader>
                                                    <CardTitle className="text-lg">{booking.name}</CardTitle>
                                                    <div>
                                                        <Badge variant={
                                                            booking.status === 'Approved' ? 'default' :
                                                                booking.status === 'Rejected' ? 'destructive' : 'outline'
                                                        }>{booking.status}</Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="text-sm space-y-2">
                                                    <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> <span>{booking.eventDate} ({booking.eventType})</span></div>
                                                    <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> <a href={`mailto:${booking.email}`} className="text-primary hover:underline">{booking.email}</a></div>
                                                    <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> <a href={`tel:${booking.phone}`} className="text-primary hover:underline">{booking.phone}</a></div>
                                                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> <span>{booking.venue}</span></div>
                                                    <p className="pt-2 text-muted-foreground">{booking.notes}</p>
                                                </CardContent>
                                                <CardFooter className="flex justify-end gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => handleBookingAction(booking.id, 'Approved')}>Approve</Button>
                                                    <Button size="sm" variant="destructive" onClick={() => handleBookingAction(booking.id, 'Rejected')}>Reject</Button>
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </div>
                                    <div className="hidden md:block overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Client Name</TableHead>
                                                    <TableHead>Event Date</TableHead>
                                                    <TableHead>Type</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>Phone</TableHead>
                                                    <TableHead>Venue</TableHead>
                                                    <TableHead>Notes</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {bookings.map((booking) => (
                                                    <TableRow key={booking.id}>
                                                        <TableCell className="font-medium">{booking.name}</TableCell>
                                                        <TableCell>{booking.eventDate}</TableCell>
                                                        <TableCell>{booking.eventType}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center">
                                                                <Badge variant={
                                                                    booking.status === 'Approved' ? 'default' :
                                                                        booking.status === 'Rejected' ? 'destructive' : 'outline'
                                                                }>{booking.status}</Badge>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{booking.email}</TableCell>
                                                        <TableCell>{booking.phone}</TableCell>
                                                        <TableCell>{booking.venue}</TableCell>
                                                        <TableCell className="max-w-[300px]">
                                                            <div className="whitespace-pre-wrap break-words text-sm">{booking.notes}</div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex flex-col gap-2 min-w-[120px]">
                                                                <Button size="sm" variant="outline" onClick={() => handleBookingAction(booking.id, 'Approved')}>Approve</Button>
                                                                <Button size="sm" variant="destructive" onClick={() => handleBookingAction(booking.id, 'Rejected')}>Reject</Button>
                                                                <Button size="sm" variant="secondary" onClick={() => handleDeleteBooking(booking.id)}>Delete</Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="contacts" className="mt-8">
                            <Card>
                                <CardHeader><CardTitle>Contact Form Submissions</CardTitle><CardDescription>View messages from the contact page.</CardDescription></CardHeader>
                                <CardContent>
                                    <div className="flex h-[600px] border rounded-md overflow-hidden bg-background">
                                        {/* Contact List */}
                                        <div className={`w-full md:w-1/3 border-r flex flex-col ${selectedContact ? 'hidden md:flex' : 'flex'}`}>
                                            <div className="p-4 border-b bg-muted/30">
                                                <h3 className="font-semibold">Inbox ({contacts.length})</h3>
                                            </div>
                                            <div className="flex-1 overflow-y-auto">
                                                {contacts.length === 0 ? (
                                                    <div className="p-8 text-center text-muted-foreground">No messages</div>
                                                ) : (
                                                    contacts.map((contact) => (
                                                        <div
                                                            key={contact.id}
                                                            className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${selectedContact?.id === contact.id ? 'bg-muted' : ''}`}
                                                            onClick={() => setSelectedContact(contact)}
                                                        >
                                                            <div className="flex justify-between items-start mb-1">
                                                                <span className="font-medium truncate pr-2">{contact.name}</span>
                                                                {/* Date date would go here if available */}
                                                            </div>
                                                            <div className="text-sm font-medium truncate mb-1">{contact.subject}</div>
                                                            <div className="text-xs text-muted-foreground line-clamp-2">{contact.message}</div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        {/* Contact Detail */}
                                        <div className={`w-full md:w-2/3 bg-white dark:bg-zinc-950 flex flex-col ${selectedContact ? 'flex' : 'hidden md:flex'}`}>
                                            {selectedContact ? (
                                                <>
                                                    <div className="p-4 border-b flex items-center gap-3 bg-muted/10">
                                                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedContact(null)}>
                                                            <ArrowLeft className="h-4 w-4" />
                                                        </Button>
                                                        <div className="flex-1">
                                                            <h2 className="text-xl font-semibold">{selectedContact.subject}</h2>
                                                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                                                <span className="font-medium text-foreground">{selectedContact.name}</span>
                                                                <span>&lt;{selectedContact.email}&gt;</span>
                                                            </div>
                                                        </div>
                                                        <Button variant="outline" size="sm" asChild>
                                                            <a href={`mailto:${selectedContact.email}`}>Reply</a>
                                                        </Button>
                                                    </div>
                                                    <div className="flex-1 p-6 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                                                        {selectedContact.message}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                                                    <Mail className="h-16 w-16 mb-4 opacity-20" />
                                                    <p>Select a message to read</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="gallery" className="mt-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Manage Gallery</CardTitle>
                                    <CardDescription>Add, edit, reorder, and delete images and videos from your portfolio.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Form {...galleryForm}>
                                        <form onSubmit={galleryForm.handleSubmit(onGallerySubmit)}>
                                            <div className="space-y-4">
                                                {fields.map((field, index) => (
                                                    <Card key={field.id} className="p-4 bg-muted/50">
                                                        <div className="flex gap-4 items-start">
                                                            <div className="flex-shrink-0 w-32 h-24 bg-background rounded-md flex items-center justify-center">
                                                                {field.type === 'image' ? (
                                                                    <Image src={field.src} alt={field.alt || 'Gallery image'} width={128} height={96} className="object-cover rounded-md h-full w-full" />
                                                                ) : (
                                                                    <Image src={`https://img.youtube.com/vi/${field.src}/mqdefault.jpg`} alt={field.alt || "YouTube video thumbnail"} width={128} height={96} className="object-cover rounded-md h-full w-full" />
                                                                )}
                                                            </div>
                                                            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                <FormField
                                                                    control={galleryForm.control}
                                                                    name={`items.${index}.type`}
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel>Type</FormLabel>
                                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                                <FormControl>
                                                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                                                </FormControl>
                                                                                <SelectContent>
                                                                                    <SelectItem value="image">Image</SelectItem>
                                                                                    <SelectItem value="video">Video</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                                <FormField
                                                                    control={galleryForm.control}
                                                                    name={`items.${index}.src`}
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel>Image URL / YouTube ID</FormLabel>
                                                                            <FormControl><Input {...field} /></FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                                <FormField
                                                                    control={galleryForm.control}
                                                                    name={`items.${index}.category`}
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel>Category</FormLabel>
                                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                                <FormControl>
                                                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                                                </FormControl>
                                                                                <SelectContent>
                                                                                    {Object.keys(gallery).map(key => (
                                                                                        <SelectItem key={key} value={key}>{gallery[key as keyof typeof gallery].name}</SelectItem>
                                                                                    ))}
                                                                                </SelectContent>
                                                                            </Select>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                                <FormField
                                                                    control={galleryForm.control}
                                                                    name={`items.${index}.aspectRatio`}
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel>Aspect Ratio (Images)</FormLabel>
                                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                                <FormControl>
                                                                                    <SelectTrigger><SelectValue placeholder="Select ratio" /></SelectTrigger>
                                                                                </FormControl>
                                                                                <SelectContent>
                                                                                    <SelectItem value="horizontal">Horizontal</SelectItem>
                                                                                    <SelectItem value="vertical">Vertical</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            </div>
                                                            <Button variant="destructive" size="icon" onClick={() => remove(index)} className="mt-6"><Trash2 className="h-4 w-4" /></Button>
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>

                                            <div className="flex justify-between items-center mt-6">
                                                <div className="flex gap-2">
                                                    <Button type="button" variant="outline" onClick={() => append({ id: generateUniqueId(), type: 'image', src: 'https://picsum.photos/1200/800', alt: 'New placeholder image', category: 'weddings', aspectRatio: 'horizontal' })}>
                                                        <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                                                    </Button>
                                                    <div className="relative">
                                                        <Button type="button" variant="outline">
                                                            <FileUp className="mr-2 h-4 w-4" /> Upload Image
                                                        </Button>
                                                        <Input type="file" accept="image/*" onChange={(e) => addGalleryItemFromFile(e.target.files)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                                                    </div>
                                                </div>
                                                <Button type="submit">Save Gallery</Button>
                                            </div>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="home-content" className="mt-8">
                            <Card>
                                <CardHeader><CardTitle>Manage Home Page Content</CardTitle><CardDescription>Update the hero slideshow and portfolio section.</CardDescription></CardHeader>
                                <CardContent className="space-y-8">
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg">Hero Slideshow Images</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {homeContent.heroImages.map((image, index) => (
                                                <Card key={image.id} className="p-4">
                                                    <Image src={image.src} alt={image.alt} width={400} height={225} className="rounded-lg object-cover w-full aspect-video" />
                                                    <div className="relative mt-2">
                                                        <Button variant="outline" className="w-full"><UploadCloud className="mr-2 h-4 w-4" /> Change Image {index + 1}</Button>
                                                        <Input type="file" accept="image/*" onChange={(e) => handleHeroImageUpload(e.target.files, index)} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-semibold text-lg">Portfolio Images</h3>
                                            <div className="relative">
                                                <Button><UploadCloud className="mr-2 h-4 w-4" />Add Portfolio Image</Button>
                                                <Input type="file" accept="image/*" onChange={(e) => handlePortfolioImageUpload(e.target.files)} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            </div>
                                        </div>
                                        {portfolioOrderChanged && (
                                            <div className="flex justify-end">
                                                <Button onClick={savePortfolioOrder}><Check className="mr-2 h-4 w-4" /> Save Order</Button>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                            {currentPortfolioItems.map((image: any, index: number) => (
                                                <div key={image.id || index} className="relative group aspect-[3/4] border rounded-lg overflow-hidden bg-muted">
                                                    <Image src={image.src} alt={image.alt} width={300} height={400} className="object-cover w-full h-full" />

                                                    {/* Overlays */}
                                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-black/40 p-1 rounded-md backdrop-blur-sm">
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="destructive" size="icon" className="h-7 w-7">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete Image?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This action cannot be undone. This will permanently remove the image from your portfolio.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handlePortfolioImageDelete(image.id)} className="bg-destructive hover:bg-destructive/90">
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>

                                                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-black/40 p-1 rounded-md backdrop-blur-sm">
                                                        <Button
                                                            variant="secondary"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            disabled={index === 0}
                                                            onClick={() => {
                                                                const newItems = [...currentPortfolioItems];
                                                                [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
                                                                setCurrentPortfolioItems(newItems);
                                                                setPortfolioOrderChanged(true);
                                                            }}
                                                        >
                                                            <ArrowLeft className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="secondary"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            disabled={index === currentPortfolioItems.length - 1}
                                                            onClick={() => {
                                                                const newItems = [...currentPortfolioItems];
                                                                [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
                                                                setCurrentPortfolioItems(newItems);
                                                                setPortfolioOrderChanged(true);
                                                            }}
                                                        >
                                                            <ArrowRight className="h-4 w-4" />
                                                        </Button>
                                                    </div>

                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs truncate transform translate-y-full group-hover:translate-y-0 transition-transform">
                                                        {image.alt}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="live-events" className="mt-8">
                            <Card>
                                <CardHeader className="flex flex-row justify-between items-center">
                                    <div>
                                        <CardTitle>Manage Live Events</CardTitle>
                                        <CardDescription>Create, edit, and share live stream events.</CardDescription>
                                    </div>
                                    <Button onClick={handleNewEvent}><PlusCircle className="mr-2 h-4 w-4" /> New Event</Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="md:hidden space-y-4">
                                        {liveEvents.length > 0 ? liveEvents.map(event => (
                                            <Card key={event.id} className="bg-muted/50">
                                                <CardHeader>
                                                    <CardTitle className="text-lg">{event.title}</CardTitle>
                                                </CardHeader>
                                                <CardContent className="text-sm space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <a href={`/live/${event.id}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">{`/live/${event.id}`}</a>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(`${window.location.origin}/live/${event.id}`)}>
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                                <CardFooter className="flex justify-end gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => handleEditEvent(event)}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
                                                    <Button size="sm" variant="destructive" onClick={() => handleDeleteEvent(event.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                                                </CardFooter>
                                            </Card>
                                        )) : (
                                            <div className="text-center py-10 text-muted-foreground">No live events created yet.</div>
                                        )}
                                    </div>

                                    <div className="hidden md:block">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Title</TableHead>
                                                    <TableHead>Link</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {liveEvents.length > 0 ? liveEvents.map((event) => (
                                                    <TableRow key={event.id}>
                                                        <TableCell className="font-medium">{event.title}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <a href={`/live/${event.id}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-xs">{typeof window !== 'undefined' ? `${window.location.origin}/live/${event.id}` : ''}</a>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(`${window.location.origin}/live/${event.id}`)}>
                                                                    <Copy className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right space-x-2">
                                                            <Button variant="outline" size="sm" onClick={() => handleEditEvent(event)}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
                                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteEvent(event.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                                                        </TableCell>
                                                    </TableRow>
                                                )) : (
                                                    <TableRow>
                                                        <TableCell colSpan={3} className="text-center h-24">
                                                            No live events created yet.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="films" className="mt-8">
                            <Card>
                                <CardHeader className="flex flex-row justify-between items-center">
                                    <div>
                                        <CardTitle>Manage Cinematic Films</CardTitle>
                                        <CardDescription>Add, edit, and delete cinematic films to showcase on your website.</CardDescription>
                                    </div>
                                    <Button onClick={handleNewVideo}><PlusCircle className="mr-2 h-4 w-4" /> New Film</Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="md:hidden space-y-4">
                                        {videos.length > 0 ? videos.map(video => (
                                            <Card key={video.id} className="bg-muted/50">
                                                <CardHeader>
                                                    <CardTitle className="text-lg">{video.title}</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate text-sm">{video.youtubeUrl}</a>
                                                </CardContent>
                                                <CardFooter className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleEditVideo(video)}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
                                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteVideo(video.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                                                </CardFooter>
                                            </Card>
                                        )) : (
                                            <div className="text-center py-10 text-muted-foreground">No cinematic films added yet.</div>
                                        )}
                                    </div>

                                    <div className="hidden md:block">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Title</TableHead>
                                                    <TableHead>YouTube URL</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {videos.length > 0 ? videos.map((video) => (
                                                    <TableRow key={video.id}>
                                                        <TableCell className="font-medium">{video.title}</TableCell>
                                                        <TableCell>
                                                            <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-xs">{video.youtubeUrl}</a>
                                                        </TableCell>
                                                        <TableCell className="text-right space-x-2">
                                                            <Button variant="outline" size="sm" onClick={() => handleEditVideo(video)}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
                                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteVideo(video.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                                                        </TableCell>
                                                    </TableRow>
                                                )) : (
                                                    <TableRow>
                                                        <TableCell colSpan={3} className="text-center h-24">
                                                            No films added yet.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="content" className="mt-8">
                            <div className="grid gap-8">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>About Section Content</CardTitle>
                                        <CardDescription>Edit the content that appears in the About section of the home page.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {aboutContent.map((paragraph, index) => (
                                                <div key={index} className="flex gap-2 items-start">
                                                    <div className="flex-1 space-y-2">
                                                        <Label>Paragraph {index + 1}</Label>
                                                        <Textarea
                                                            value={paragraph}
                                                            onChange={(e) => {
                                                                const newContent = [...aboutContent];
                                                                newContent[index] = e.target.value;
                                                                setAboutContent(newContent);
                                                            }}
                                                            onBlur={async () => {
                                                                await saveData('siteContent', 'about', { id: 'about', about: aboutContent });
                                                                toast({ title: 'Saved', description: 'About content updated.' });
                                                            }}
                                                            rows={4}
                                                            className="resize-none"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-2 pt-8">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            disabled={index === 0}
                                                            onClick={async () => {
                                                                const newContent = [...aboutContent];
                                                                [newContent[index - 1], newContent[index]] = [newContent[index], newContent[index - 1]];
                                                                setAboutContent(newContent);
                                                                await saveData('siteContent', 'about', { id: 'about', about: newContent });
                                                            }}
                                                        >
                                                            <ArrowUp className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            disabled={index === aboutContent.length - 1}
                                                            onClick={async () => {
                                                                const newContent = [...aboutContent];
                                                                [newContent[index + 1], newContent[index]] = [newContent[index], newContent[index + 1]];
                                                                setAboutContent(newContent);
                                                                await saveData('siteContent', 'about', { id: 'about', about: newContent });
                                                            }}
                                                        >
                                                            <ArrowDown className="h-4 w-4" />
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete Paragraph?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to remove this paragraph from the About section?
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={async () => {
                                                                        const newContent = aboutContent.filter((_, i) => i !== index);
                                                                        setAboutContent(newContent);
                                                                        await saveData('siteContent', 'about', { id: 'about', about: newContent });
                                                                        toast({ title: 'Deleted', description: 'Paragraph removed.' });
                                                                    }} className="bg-destructive hover:bg-destructive/90">
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </div>
                                            ))}
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setAboutContent([...aboutContent, "New paragraph"]);
                                                }}
                                            >
                                                <PlusCircle className="mr-2 h-4 w-4" /> Add Paragraph
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Services</CardTitle>
                                        <CardDescription>Edit your service offerings that appear on the home page.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-between items-center mb-4">
                                            <Button
                                                onClick={async () => {
                                                    const newService = {
                                                        id: generateUniqueId(),
                                                        title: "New Service",
                                                        icon: "Heart",
                                                        description: "Description of the new service.",
                                                        order: services.length // Add to end
                                                    };
                                                    // Update local state only
                                                    setServices([...services, newService]);
                                                    toast({ title: 'Service Added', description: 'Click Save Changes to persist.' });
                                                }}
                                            >
                                                <PlusCircle className="mr-2 h-4 w-4" /> Add Service
                                            </Button>
                                            <Button onClick={async () => {
                                                // Save all services with current order
                                                const orderedServices = services.map((s, i) => ({ ...s, order: i }));
                                                // We can use saveOrderedData to batch save
                                                // But saveOrderedData expects an array and uses batch.set locally?
                                                // Let's check dataService.ts - yes, saveOrderedData(collection, data).
                                                const result = await saveOrderedData('services', orderedServices);
                                                if (result.success) {
                                                    toast({ title: 'Success', description: 'Services saved successfully.' });
                                                } else {
                                                    toast({ title: 'Error', description: 'Failed to save services.', variant: 'destructive' });
                                                }
                                            }}>
                                                <Save className="mr-2 h-4 w-4" /> Save Changes
                                            </Button>
                                        </div>
                                        <div className="space-y-4">
                                            {services.map((service, index) => (
                                                <Card key={service.id} className="bg-muted/50 relative group">
                                                    {/* Desktop Actions (Top Right) */}
                                                    <div className="hidden md:flex absolute right-2 top-2 gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 p-1 rounded-md z-10">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            disabled={index === 0}
                                                            onClick={async () => {
                                                                const newServices = [...services];
                                                                [newServices[index - 1], newServices[index]] = [newServices[index], newServices[index - 1]];
                                                                setServices(newServices);
                                                            }}
                                                        >
                                                            <ArrowUp className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            disabled={index === services.length - 1}
                                                            onClick={async () => {
                                                                const newServices = [...services];
                                                                [newServices[index + 1], newServices[index]] = [newServices[index], newServices[index + 1]];
                                                                setServices(newServices);
                                                            }}
                                                        >
                                                            <ArrowDown className="h-4 w-4" />
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete Service?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to delete this service? This cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={async () => {
                                                                        const result = await deleteData('services', service.id);
                                                                        if (result.success) {
                                                                            const newServices = services.filter(s => s.id !== service.id);
                                                                            setServices(newServices);
                                                                            toast({ title: 'Deleted', description: 'Service removed.' });
                                                                        } else {
                                                                            toast({ title: 'Error', description: 'Failed to delete service.', variant: 'destructive' });
                                                                        }
                                                                    }} className="bg-destructive hover:bg-destructive/90">
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>

                                                    <CardContent className="pt-6">
                                                        <div className="grid gap-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <Label>Title</Label>
                                                                    <Input
                                                                        value={service.title}
                                                                        onChange={(e) => {
                                                                            const newServices = [...services];
                                                                            newServices[index] = { ...service, title: e.target.value };
                                                                            setServices(newServices);
                                                                        }}
                                                                        onBlur={() => { }} // Save removed
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label>Icon</Label>
                                                                    <Select
                                                                        value={service.icon}
                                                                        onValueChange={async (value) => {
                                                                            const newServices = [...services];
                                                                            const updatedService = { ...service, icon: value };
                                                                            newServices[index] = updatedService;
                                                                            setServices(newServices);
                                                                        }}
                                                                    >
                                                                        <SelectTrigger>
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {Object.keys(iconMap).map((iconName) => (
                                                                                <SelectItem key={iconName} value={iconName}>
                                                                                    {iconName}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Description</Label>
                                                                <Textarea
                                                                    value={service.description}
                                                                    onChange={(e) => {
                                                                        const newServices = [...services];
                                                                        newServices[index] = { ...service, description: e.target.value };
                                                                        setServices(newServices);
                                                                    }}
                                                                    className="resize-none"
                                                                />
                                                            </div>

                                                            {/* Mobile Actions (Bottom Row) */}
                                                            <div className="md:hidden flex justify-end gap-2 pt-2 border-t mt-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    disabled={index === 0}
                                                                    onClick={() => {
                                                                        const newServices = [...services];
                                                                        [newServices[index - 1], newServices[index]] = [newServices[index], newServices[index - 1]];
                                                                        setServices(newServices);
                                                                    }}
                                                                >
                                                                    <ArrowUp className="h-4 w-4 mr-1" /> Move Up
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    disabled={index === services.length - 1}
                                                                    onClick={() => {
                                                                        const newServices = [...services];
                                                                        [newServices[index + 1], newServices[index]] = [newServices[index], newServices[index + 1]];
                                                                        setServices(newServices);
                                                                    }}
                                                                >
                                                                    <ArrowDown className="h-4 w-4 mr-1" /> Move Down
                                                                </Button>
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button variant="destructive" size="sm">
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Delete Service?</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                Are you sure?
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction onClick={async () => {
                                                                                const result = await deleteData('services', service.id);
                                                                                if (result.success) {
                                                                                    const newServices = services.filter(s => s.id !== service.id);
                                                                                    setServices(newServices);
                                                                                    toast({ title: 'Deleted', description: 'Service removed.' });
                                                                                }
                                                                            }} className="bg-destructive hover:bg-destructive/90">
                                                                                Delete
                                                                            </AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="users" className="mt-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Users className="text-primary" /> User Management</CardTitle>
                                    <CardDescription>Manage user roles and permissions.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="md:hidden space-y-4">
                                        {users.map((user) => (
                                            <Card key={user.uid} className="bg-muted/50">
                                                <CardHeader>
                                                    <CardTitle className="text-lg flex items-center gap-2">
                                                        {user.photoURL ? (
                                                            <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full" />
                                                        ) : (
                                                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                                {user.displayName ? user.displayName[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : 'U')}
                                                            </div>
                                                        )}
                                                        {user.displayName || user.email?.split('@')[0] || 'User'}
                                                    </CardTitle>
                                                    <CardDescription>{user.email}</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                                                        {user.role === 'admin' ? 'Admin' : 'User'}
                                                    </Badge>
                                                </CardContent>
                                                <CardFooter>
                                                    {user.role === 'admin' ? (
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={async () => {
                                                                const result = await updateUserRole(user.uid, 'user');
                                                                if (result.success) {
                                                                    setUsers(users.map(u => u.uid === user.uid ? { ...u, role: 'user' } : u));
                                                                    toast({ title: 'Success', description: `${user.displayName || user.email} is now a User.` });
                                                                } else {
                                                                    toast({ title: 'Error', description: 'Failed to update role.', variant: 'destructive' });
                                                                }
                                                            }}
                                                        >
                                                            <ShieldOff className="mr-2 h-4 w-4" /> Revoke Admin
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={async () => {
                                                                const result = await updateUserRole(user.uid, 'admin');
                                                                if (result.success) {
                                                                    setUsers(users.map(u => u.uid === user.uid ? { ...u, role: 'admin' } : u));
                                                                    toast({ title: 'Success', description: `${user.displayName || user.email} is now an Admin.` });
                                                                } else {
                                                                    toast({ title: 'Error', description: 'Failed to update role.', variant: 'destructive' });
                                                                }
                                                            }}
                                                        >
                                                            <Shield className="mr-2 h-4 w-4" /> Make Admin
                                                        </Button>
                                                    )}
                                                </CardFooter>
                                            </Card>
                                        ))}
                                        {users.length === 0 && (
                                            <p className="text-center text-muted-foreground py-8">No users found.</p>
                                        )}
                                    </div>
                                    <div className="hidden md:block overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>User</TableHead>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>Role</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {users.map((user) => (
                                                    <TableRow key={user.uid}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                {user.photoURL ? (
                                                                    <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full" />
                                                                ) : (
                                                                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                                        {user.displayName ? user.displayName[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : 'U')}
                                                                    </div>
                                                                )}
                                                                <span className="font-medium">{user.displayName || user.email?.split('@')[0] || 'User'}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{user.email}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                                                                {user.role === 'admin' ? 'Admin' : 'User'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {user.role === 'admin' ? (
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={async () => {
                                                                        const result = await updateUserRole(user.uid, 'user');
                                                                        if (result.success) {
                                                                            setUsers(users.map(u => u.uid === user.uid ? { ...u, role: 'user' } : u));
                                                                            toast({ title: 'Success', description: `${user.displayName || user.email} is now a User.` });
                                                                        } else {
                                                                            toast({ title: 'Error', description: 'Failed to update role.', variant: 'destructive' });
                                                                        }
                                                                    }}
                                                                >
                                                                    <ShieldOff className="mr-2 h-4 w-4" /> Revoke Admin
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={async () => {
                                                                        const result = await updateUserRole(user.uid, 'admin');
                                                                        if (result.success) {
                                                                            setUsers(users.map(u => u.uid === user.uid ? { ...u, role: 'admin' } : u));
                                                                            toast({ title: 'Success', description: `${user.displayName || user.email} is now an Admin.` });
                                                                        } else {
                                                                            toast({ title: 'Error', description: 'Failed to update role.', variant: 'destructive' });
                                                                        }
                                                                    }}
                                                                >
                                                                    <Shield className="mr-2 h-4 w-4" /> Make Admin
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        {users.length === 0 && (
                                            <p className="text-center text-muted-foreground py-8">No users found. Users will appear here after they sign up.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="seo-tools" className="mt-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Wand2 className="text-primary" /> SEO Enhancement Tool</CardTitle>
                                    <CardDescription>Analyze content to get SEO keyword suggestions.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <Form {...seoForm}>
                                            <form onSubmit={seoForm.handleSubmit(onSeoSubmit)} className="space-y-4">
                                                <FormField
                                                    control={seoForm.control}
                                                    name="websiteContent"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Website Content</FormLabel>
                                                            <FormControl>
                                                                <Textarea {...field} rows={10} placeholder="Paste your website text here..." />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <Button type="submit" disabled={isLoadingSeo} className="w-full">
                                                    {isLoadingSeo ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : 'Get SEO Suggestions'}
                                                </Button>
                                            </form>
                                        </Form>
                                        <div className="space-y-4">
                                            <h3 className="font-semibold">Suggestions</h3>
                                            {isLoadingSeo ? (
                                                <div className="flex items-center justify-center h-48 rounded-lg border border-dashed">
                                                    <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                                                </div>
                                            ) : seoResult ? (
                                                <div className="space-y-4 rounded-lg border p-4 bg-muted/50 h-full">
                                                    <div>
                                                        <h4 className="font-bold">Keywords:</h4>
                                                        <p className="text-sm text-muted-foreground">{seoResult.keywords}</p>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold">Guidance:</h4>
                                                        <p className="text-sm text-muted-foreground">{seoResult.guidance}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center h-48 rounded-lg border border-dashed">
                                                    <p className="text-sm text-muted-foreground">SEO suggestions will appear here.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs >
                </div >
            </main >

            <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingEvent ? 'Edit Live Event' : 'Create New Live Event'}</DialogTitle>
                        <DialogDescription>
                            Fill in the details for your live stream. The link will be generated automatically.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...eventForm}>
                        <form onSubmit={eventForm.handleSubmit(onEventFormSubmit)} className="space-y-4">
                            <FormField
                                control={eventForm.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Event Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., John & Jane's Wedding" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={eventForm.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="A short description of the live event." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={eventForm.control}
                                name="youtubeUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full YouTube URL</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://www.youtube.com/watch?v=..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setIsEventDialogOpen(false)}>Cancel</Button>
                                <Button type="submit">Save Event</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingVideo ? 'Edit Film' : 'Add New Film'}</DialogTitle>
                        <DialogDescription>
                            Fill in the details for your film showcase.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...videoForm}>
                        <form onSubmit={videoForm.handleSubmit(onVideoFormSubmit)} className="space-y-4">
                            <FormField
                                control={videoForm.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Film Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Cinematic Highlights" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={videoForm.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="A short description of the film." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={videoForm.control}
                                name="youtubeUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full YouTube URL</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://www.youtube.com/watch?v=..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setIsVideoDialogOpen(false)}>Cancel</Button>
                                <Button type="submit">Save Film</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>


        </>
    );
}
