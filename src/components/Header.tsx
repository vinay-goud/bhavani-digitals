
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Menu, X, Moon, Sun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/cinematic-films", label: "Cinematic Films" },
  { href: "/lumina", label: "Lumina AI" },
  { href: "/booking", label: "Book Now" },
  { href: "/contact", label: "Contact" },
];

const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9" />; // Placeholder to prevent layout shift
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} className="relative w-9 h-9">
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

const AuthButton = () => {
  const { user, role, isLoading, signOut } = useAuth();

  if (isLoading) {
    return <div className="h-10 w-20 bg-muted animate-pulse rounded-md" />;
  }

  if (user) {
    return (
      <>
        {role === 'admin' ? (
          <Button asChild>
            <Link href="/admin">Admin</Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={signOut} title="Logout">
          <LogOut className="h-5 w-5" />
        </Button>
      </>
    )
  }

  return (
    <Button asChild>
      <Link href="/auth">Login</Link>
    </Button>
  )
}


export function Header() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isHome = pathname === "/";
  const isTransparent = isHome && !hasScrolled;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide header on specific routes
  if (pathname.startsWith("/auth") || pathname.startsWith("/admin") || pathname.startsWith("/lumina")) {
    return null;
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300",
        isTransparent ? "bg-gradient-to-b from-black/60 to-transparent py-4" : "bg-background/80 backdrop-blur-md shadow-md py-2"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <Camera className={cn("h-8 w-8 transition-colors", isTransparent ? "text-white" : "text-primary")} />
          <span className={cn("font-headline text-2xl font-bold transition-colors", isTransparent ? "text-white" : "text-foreground")}>
            Bhavani Digitals
          </span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "font-body text-lg font-medium transition-colors hover:text-primary",
                isTransparent ? "text-white/90 hover:text-primary" : "text-muted-foreground"
              )}
              prefetch={false}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <Link
              href="/style-guide"
              className={cn(
                "font-body text-lg font-medium transition-colors hover:text-primary",
                isTransparent ? "text-white/90 hover:text-primary" : "text-muted-foreground"
              )}
              prefetch={false}
            >
              Style Guide
            </Link>
          )}
          <div className={cn("flex items-center gap-2 ml-4", isTransparent ? "text-white" : "")}>
            <AuthButton />
            <ThemeToggle />
          </div>
        </nav>
        <div className="md:hidden flex items-center gap-2">
          <div className={isTransparent ? "text-white" : ""}>
            <ThemeToggle />
          </div>
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className={isTransparent ? "text-white hover:bg-white/20" : ""}>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-background p-0 [&>button]:hidden">
              <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
              <SheetDescription className="sr-only">
                A menu of navigation links for the Bhavani Digitals website.
              </SheetDescription>
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b p-4">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                    <Camera className="h-6 w-6 text-primary" />
                    <span className="font-headline text-lg font-bold text-foreground">Bhavani Digitals</span>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                <nav className="flex flex-col gap-4 p-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-lg font-medium transition-colors hover:text-primary text-foreground"
                      onClick={() => setIsMenuOpen(false)}
                      prefetch={false}
                    >
                      {link.label}
                    </Link>
                  ))}
                  {user && (
                    <Link
                      href="/style-guide"
                      className="text-lg font-medium transition-colors hover:text-primary text-foreground"
                      onClick={() => setIsMenuOpen(false)}
                      prefetch={false}
                    >
                      Style Guide
                    </Link>
                  )}
                </nav>
                <div className="mt-auto p-4 border-t">
                  <AuthButton />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
