
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { saveData } from "@/services/dataService";

const bookingFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  eventType: z.string().min(1, { message: "Please select an event type." }),
  otherEventType: z.string().optional(),
  eventDates: z.array(z.date()).min(1, { message: "At least one date is required." }),
  city: z.string().min(2, { message: "City is required." }),
  functionDetails: z.string().min(10, { message: "Please provide function details." }),
  venue: z.string().min(3, { message: "Venue must be at least 3 characters." }),
  services: z.array(z.string()).optional(),
  videoType: z.array(z.string()).optional(),
  scopeOfCoverage: z.string().optional(),
  approximateBudget: z.string().optional(),
  requiresTwoTeams: z.string().optional(),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export default function BookingPage() {
  const { toast } = useToast();
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
  });

  async function onSubmit(data: BookingFormValues) {
    const id = `booking_${Date.now()}`;
    const bookingData = {
      ...data,
      id,
      status: 'Pending',
      eventDates: data.eventDates?.map(date => format(date, "yyyy-MM-dd")),
      createdAt: new Date().toISOString(),
    };

    const result = await saveData('bookings', id, bookingData);

    if (result.success) {
      toast({
        title: "Booking Request Sent!",
        description: "Thank you! We've received your request and will get back to you shortly.",
      });
      form.reset({ name: '', email: '', phone: '', venue: '', notes: '' });
    } else {
      toast({
        title: "Submission Failed",
        description: "There was an error sending your request. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <Card className="max-w-2xl mx-auto bg-secondary/30">
            <CardHeader>
              <CardTitle className="font-headline text-3xl md:text-4xl text-center">Book Your Event</CardTitle>
              <CardDescription className="font-body text-center text-lg">
                Fill out the form below to inquire about our availability for your special day.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="(123) 456-7890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField control={form.control} name="eventType" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Type</FormLabel>
                        <Select onValueChange={(value) => {
                          field.onChange(value);
                          if (value !== 'other') {
                            form.setValue('otherEventType', '');
                          }
                        }} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an event type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="wedding">Wedding</SelectItem>
                            <SelectItem value="reception">Reception</SelectItem>
                            <SelectItem value="pre-wedding">Pre-Wedding Shoot</SelectItem>
                            <SelectItem value="engagement">Engagement</SelectItem>
                            <SelectItem value="sangeet">Sangeet</SelectItem>
                            <SelectItem value="mehendi">Mehendi</SelectItem>
                            <SelectItem value="haldi">Haldi</SelectItem>
                            <SelectItem value="birthday">Birthday</SelectItem>
                            <SelectItem value="saree-ceremony">Saree Ceremony</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    {form.watch('eventType') === 'other' && (
                      <FormField control={form.control} name="otherEventType" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specify Event Type</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your event type" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}
                    {(form.watch('eventType') === 'wedding' || form.watch('eventType') === 'reception') && (
                      <>
                        <FormField control={form.control} name="eventDates" render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Event Dates</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full min-h-[2.5rem] h-auto pl-3 text-left font-normal break-words whitespace-normal",
                                      !field.value?.length && "text-muted-foreground"
                                    )}
                                  >
                                    <div className="flex-1 overflow-hidden">
                                      {field.value?.length ? (
                                        <span className="inline-block">
                                          {field.value.map(date => format(date, "dd MMM yyyy")).join(", ")}
                                        </span>
                                      ) : (
                                        <span>Select dates</span>
                                      )}
                                    </div>
                                    <CalendarIcon className="ml-2 h-4 w-4 flex-shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="multiple"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="services" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Services Required</FormLabel>
                            <div className="space-y-2">
                              {[
                                { id: 'traditional', label: 'Traditional Photography' },
                                { id: 'candid', label: 'Candid Photography' },
                                { id: 'drone', label: 'Drone Shots' },
                                { id: 'traditional-video', label: 'Traditional Videography' },
                                { id: 'cinematic-video', label: 'Cinematic Video' },
                                { id: 'haldi', label: 'Haldi Ceremony' },
                                { id: 'pre-wedding', label: 'Pre-Wedding Shoot' },
                                { id: 'led-wall', label: 'LED Wall' },
                                { id: 'live-video', label: 'Live Video' }
                              ].map((service) => (
                                <div key={service.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={service.id}
                                    checked={field.value?.includes(service.id)}
                                    onCheckedChange={(checked) => {
                                      const values = field.value || [];
                                      if (checked) {
                                        field.onChange([...values, service.id]);
                                      } else {
                                        field.onChange(values.filter(v => v !== service.id));
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={service.id}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {service.label}
                                  </label>
                                </div>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="scopeOfCoverage" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Scope of Coverage</FormLabel>
                            <Select onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select coverage scope" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="bride">Bride Side Only</SelectItem>
                                <SelectItem value="groom">Groom Side Only</SelectItem>
                                <SelectItem value="both">Both Sides</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </>
                    )}
                  </div>
                  <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Hyderabad, Bengaluru" {...field} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground">Mention all the cities where you need our services</p>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="venue" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Venue / Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Taj Krishna, Hyderabad" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="functionDetails" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Function Details</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g., 15th Dec - 9 am to 12 pm Haldi, 5 pm to 10 pm Sangeet
16th Dec - 6 pm to 11 pm Wedding Ceremony" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground">Please mention if your wedding rituals/events will go on all night</p>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="approximateBudget" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Approximate Budget (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 1-2 lakhs" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="requiresTwoTeams" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Would you require two teams?</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="not-sure">Not Sure</SelectItem>
                        </SelectContent>
                      </Select>
                      {field.value === 'yes' && (
                        <div className="mt-2 p-4 bg-secondary/50 rounded-lg">
                          <p className="text-sm font-medium">Do I need two teams?</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            If any of your functions are happening simultaneously/in parallel at two venues then you do require two teams. 
                            For example, if the Bride's haldi and the Groom's haldi are happening simultaneously at different venues and you want coverage of both.
                          </p>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any other details or special requests..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg">Submit Request</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
