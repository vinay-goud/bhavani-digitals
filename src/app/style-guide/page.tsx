
'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Wand2 } from 'lucide-react';
import { generatePhotographyStyleGuide } from '@/ai/flows/generate-photography-style-guide';


import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsLoggedIn } from '@/hooks/useAuth';

const styleGuideSchema = z.object({
  shootType: z.string().min(1, { message: "Please select a shoot type." }),
  desiredVisuals: z.string().min(10, { message: "Please describe the desired visuals." }),
  brandGuidelines: z.string().optional(),
  trendInspirations: z.string().optional(),
});

type StyleGuideValues = z.infer<typeof styleGuideSchema>;

const MarkdownRenderer = ({ content }: { content: string }) => {
  const formattedContent = content
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-headline mt-6 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-headline mt-8 mb-4 border-b pb-2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-headline mt-10 mb-6 border-b-2 pb-2">$1</h1>')
    .replace(/^\* (.*$)/gim, '<li class="ml-6 mb-1">$1</li>')
    .replace(/<\/li>\n<li/gim, '</li><li')
    .replace(/(<li>[\s\S]*?<\/li>)/gi, '<ul class="list-disc pl-4 mb-4">$1</ul>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => line.startsWith('<') ? line : `<p>${line}</p>`)
    .join('');

  return <div dangerouslySetInnerHTML={{ __html: formattedContent }} />;
};

export default function StyleGuidePage() {
  const { toast } = useToast();
  const { isLoggedIn, isLoading: isAuthLoading } = useIsLoggedIn();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedGuide, setGeneratedGuide] = useState<string | null>(null);

  const form = useForm<StyleGuideValues>({
    resolver: zodResolver(styleGuideSchema),
    defaultValues: {
      shootType: "wedding",
      desiredVisuals: "Elegant and timeless, with a mix of candid moments and classic portraits. Soft, natural light is preferred.",
      brandGuidelines: "",
      trendInspirations: "",
    },
  });

  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      window.location.href = '/auth';
    }
  }, [isLoggedIn, isAuthLoading]);

  async function onSubmit(data: StyleGuideValues) {
    setIsLoading(true);
    setGeneratedGuide(null);
    try {
      const result = await generatePhotographyStyleGuide(data);
      setGeneratedGuide(result.styleGuide);
    } catch (error) {
      console.error("Error generating style guide:", error);
      toast({
        title: "Error",
        description: "Failed to generate the style guide. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isAuthLoading || !isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
      <main className="min-h-screen bg-background py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <Card className="bg-secondary/30">
                <CardHeader>
                  <CardTitle className="font-headline text-3xl md:text-4xl flex items-center gap-2">
                    <Wand2 className="h-8 w-8 text-primary" />
                    Style Guide Assistant
                  </CardTitle>
                  <CardDescription className="font-body text-lg">
                    Generate a photography style guide for your shoot with the power of AI.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField control={form.control} name="shootType" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shoot Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select shoot type" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="wedding">Wedding</SelectItem>
                              <SelectItem value="pre-wedding">Pre-Wedding</SelectItem>
                              <SelectItem value="fashion">Fashion</SelectItem>
                              <SelectItem value="portrait">Portrait</SelectItem>
                              <SelectItem value="product">Product</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="desiredVisuals" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Desired Visuals & Mood</FormLabel>
                          <FormControl>
                            <Textarea rows={4} placeholder="e.g., Bright, airy, and romantic with a focus on natural light and candid emotions." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="brandGuidelines" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand Guidelines (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="e.g., Logo should be placed bottom-right. Adhere to a specific color palette." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="trendInspirations" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trend Inspirations (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="e.g., Inspired by film photography, vintage aesthetics, or specific Instagram trends." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <Button type="submit" disabled={isLoading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : "Generate Style Guide"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
            <div className="lg:mt-0">
              <Card className="h-full bg-secondary/30 sticky top-24">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">Generated Style Guide</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[65vh] pr-4">
                    {isLoading && (
                      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="mt-4">Our AI is crafting your guide...</p>
                      </div>
                    )}
                    {generatedGuide && <div className="font-body text-foreground"><MarkdownRenderer content={generatedGuide} /></div>}
                    {!isLoading && !generatedGuide && (
                      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-center">
                        <Wand2 className="h-12 w-12 text-primary/50" />
                        <p className="mt-4">Your generated style guide will appear here.</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
