
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Mail, MapPin, Phone, MessageCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";


import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveData } from "@/services/dataService";
import ContactMap from "@/components/ui/contact-map";

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  subject: z.string().min(3, { message: "Subject must be at least 3 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
  });

  async function onSubmit(data: ContactFormValues) {
    const id = `contact_${Date.now()}`;
    const contactData = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };

    const result = await saveData('contacts', id, contactData);

    if (result.success) {
      toast({
        title: "Message Sent!",
        description: "Thank you for reaching out. We will get back to you soon.",
      });
      form.reset({ name: '', email: '', subject: '', message: '' });
    } else {
      toast({
        title: "Submission Failed",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <>
      <main className="min-h-screen bg-background py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h1 className="font-headline text-4xl md:text-5xl text-foreground">Contact Us</h1>
            <p className="font-body mt-2 text-lg text-muted-foreground">
              We'd love to hear from you. Let's talk about your big day!
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            <div className="lg:col-span-2 space-y-8">
              <Card className="bg-secondary/30">
                <CardHeader className="flex flex-row items-center gap-4">
                  <MapPin className="h-8 w-8 text-primary" />
                  <CardTitle className="font-headline text-2xl">Our Studio</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-body">Bhavani Digitals Studio, Varni, Nizamabad, Telangana - 503201 </p>
                  <div className="mt-4 aspect-video w-full rounded-lg overflow-hidden h-[300px] md:h-auto">
                    <ContactMap />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-secondary/30">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Phone className="h-8 w-8 text-primary" />
                  <CardTitle className="font-headline text-2xl">Direct Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 font-body">
                  <a href="tel:+91998919255" className="flex items-center gap-3 hover:text-primary"><Phone className="h-5 w-5" /> +91 998919255</a>
                  <a href="mailto:murali.photo.09@gmail.com" className="flex items-center gap-3 hover:text-primary"><Mail className="h-5 w-5" /> murali.photo.09@gmail.com</a>
                  <a href="https://wa.me/+91998919255" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary"><MessageCircle className="h-5 w-5" /> Chat on WhatsApp</a>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-3">
              <Card className="bg-secondary/30 h-full">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">Send us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Your Name" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="Your Email" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem><FormLabel>Phone</FormLabel><FormControl><Input type="tel" placeholder="Your Phone Number" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="subject" render={({ field }) => (
                        <FormItem><FormLabel>Subject</FormLabel><FormControl><Input placeholder="Inquiry about..." {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="message" render={({ field }) => (
                        <FormItem><FormLabel>Message</FormLabel><FormControl><Textarea rows={5} placeholder="Your message..." {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg">Send Message</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
