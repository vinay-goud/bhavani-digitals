
import Link from "next/link";
import { Camera, Mail, MapPin, Phone, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground py-12">
      <div className="container mx-auto grid grid-cols-1 gap-8 px-4 md:grid-cols-3 md:px-6">
        <div className="flex flex-col items-start gap-4">
          <Link href="/" className="flex items-center gap-2" prefetch={false}>
            <Camera className="h-8 w-8 text-primary" />
            <span className="font-headline text-2xl font-bold">
              Bhavani Digitals
            </span>
          </Link>
          <p className="font-body text-sm max-w-sm">
            Capturing your precious moments with elegance and creativity. Specializing in wedding photography and videography.
          </p>
        </div>
        <div className="grid gap-4">
          <h3 className="font-headline text-lg font-semibold">Quick Links</h3>
          <nav className="grid grid-cols-1 gap-2 font-body text-sm">
            <Link href="/" className="hover:text-primary" prefetch={false}>Home</Link>
            <Link href="/gallery" className="hover:text-primary" prefetch={false}>Gallery</Link>
            <Link href="/films" className="hover:text-primary" prefetch={false}>Films</Link>
            <Link href="/booking" className="hover:text-primary" prefetch={false}>Booking</Link>
            <Link href="/contact" className="hover:text-primary" prefetch={false}>Contact Us</Link>
          </nav>
        </div>
        <div className="grid gap-4">
          <h3 className="font-headline text-lg font-semibold">Get in Touch</h3>
          <ul className="space-y-2 font-body text-sm">
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>123 Wedding Lane, Celebration City, 12345</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <a href="tel:+1234567890" className="hover:text-primary">+1 (234) 567-890</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <a href="mailto:contact@bhavanidigitals.com" className="hover:text-primary">contact@bhavanidigitals.com</a>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Chat on WhatsApp</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto mt-8 border-t border-muted pt-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Bhavani Digitals. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
