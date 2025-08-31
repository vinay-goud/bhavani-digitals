
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Camera, Menu, X, Moon, Sun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/films", label: "Films" },
  { href: "/booking", label: "Book Now" },
  { href: "/contact", label: "Contact" },
];

const ThemeToggle = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.className = savedTheme;
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.className = newTheme;
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
    const { user, signOut } = useAuth();

    if (user) {
        return (
            <>
                <Button asChild>
                    <Link href="/admin">Admin</Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={signOut} title="Logout">
                    <LogOut className="h-5 w-5"/>
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
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        "text-foreground",
        hasScrolled ? "bg-background/80 backdrop-blur-sm shadow-md" : "bg-transparent"
      )}
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <Camera className="h-8 w-8 text-primary" />
          <span className="font-headline text-2xl font-bold">
            Bhavani Digitals
          </span>
        </Link>
        <nav className="hidden items-center gap-4 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-body text-lg font-medium text-muted-foreground transition-colors hover:text-primary"
              prefetch={false}
            >
              {link.label}
            </Link>
          ))}
          {user && (
             <Link
              href="/style-guide"
              className="font-body text-lg font-medium text-muted-foreground transition-colors hover:text-primary"
              prefetch={false}
            >
              Style Guide
            </Link>
          )}
          <AuthButton />
          <ThemeToggle />
        </nav>
        <div className="md:hidden flex items-center gap-2">
           <ThemeToggle />
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-background p-0">
               <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
               <SheetDescription className="sr-only">
                  A menu of navigation links for the Bhavani Digitals website.
                </SheetDescription>
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b p-4">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                    <Camera className="h-6 w-6 text-primary" />
                    <span className="font-headline text-lg font-bold">Bhavani Digitals</span>
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
                      className="text-lg font-medium transition-colors hover:text-primary"
                      onClick={() => setIsMenuOpen(false)}
                      prefetch={false}
                    >
                      {link.label}
                    </Link>
                  ))}
                   {user && (
                     <Link
                      href="/style-guide"
                      className="text-lg font-medium transition-colors hover:text-primary"
                      onClick={() => setIsMenuOpen(false)}
                      prefetch={false}
                    >
                      Style Guide
                    </Link>
                  )}
                </nav>
                 <div className="mt-auto p-4 border-t">
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/auth" onClick={() => setIsMenuOpen(false)}>Login/Admin</Link>
                    </Button>
                  </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
