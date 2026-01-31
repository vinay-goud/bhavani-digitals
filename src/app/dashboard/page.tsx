'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
    const { user, role, isLoading, signOut } = useAuth();

    useEffect(() => {
        if (!isLoading && !user) {
            window.location.href = '/auth';
        }
        // Redirect admins to the admin panel
        if (!isLoading && role === 'admin') {
            window.location.href = '/admin';
        }
    }, [user, role, isLoading]);

    if (isLoading || !user) {
        return (
            <main className="min-h-screen bg-background py-16 md:py-24 flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin" />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background py-16 md:py-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mb-12">
                    <h1 className="font-headline text-4xl md:text-5xl text-foreground">Welcome Back!</h1>
                    <p className="font-body mt-2 text-lg text-muted-foreground">
                        Your personal client portal
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* User Info Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            {user.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    alt="Profile"
                                    className="h-16 w-16 rounded-full object-cover"
                                />
                            ) : (
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-8 w-8 text-primary" />
                                </div>
                            )}
                            <div>
                                <CardTitle>{user.displayName || 'User'}</CardTitle>
                                <CardDescription>{user.email}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full" onClick={signOut}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign Out
                            </Button>
                        </CardContent>
                    </Card>

                    {/* My Bookings Card (Placeholder) */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                My Bookings
                            </CardTitle>
                            <CardDescription>View your upcoming events</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                You have no upcoming bookings. Contact us to schedule your event!
                            </p>
                            <Button className="mt-4 w-full" asChild>
                                <a href="/booking">Book Now</a>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Quick Actions Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Explore our services</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full" asChild>
                                <a href="/gallery">View Gallery</a>
                            </Button>
                            <Button variant="outline" className="w-full" asChild>
                                <a href="/cinematic-films">Cinematic Films</a>
                            </Button>
                            <Button variant="outline" className="w-full" asChild>
                                <a href="/contact">Contact Us</a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}
