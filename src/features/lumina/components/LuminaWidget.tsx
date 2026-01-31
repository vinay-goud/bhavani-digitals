'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useChat } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, Mic, Sparkles, MapPin, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LocationCard } from './artifacts/LocationCard';

// Suggestions matching the Lumina Page
const SUGGESTIONS = [
    { icon: MapPin, label: 'Find locations', prompt: 'Find the best outdoor photoshoot spots in Hyderabad' },
    { icon: Lightbulb, label: 'Get tips', prompt: 'Tips for golden hour wedding photography' },
];

export default function LuminaWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const { messages, sendMessage, status } = useChat();
    const isLoading = status === 'submitted' || status === 'streaming';

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, status]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
        }
    }, [input]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input;
        setInput('');
        if (inputRef.current) inputRef.current.style.height = 'auto';

        await sendMessage({
            role: 'user',
            content: userMessage,
        } as any, {
            body: { model: 'gemini-2.5-flash' }
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    const pathname = usePathname();

    // Hide on /lumina page (handle trailing slash and case variations)
    if (pathname?.toLowerCase().startsWith('/lumina')) return null;

    // Closed State - Floating Button
    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                aria-label="Open Lumina Chat"
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    zIndex: 2147483647,
                    width: '56px',
                    height: '56px',
                    minWidth: '56px',
                    minHeight: '56px',
                    borderRadius: '50%'
                }}
                className="bg-primary text-primary-foreground shadow-xl hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-primary/30 flex items-center justify-center transition-all duration-200"
            >
                <MessageCircle className="h-7 w-7" />
            </button>
        );
    }

    // Open State - Chat Window
    return (
        <div
            style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                zIndex: 2147483647,
                display: 'flex',
                flexDirection: 'column',
                width: '380px',
                height: '600px',
                maxWidth: 'calc(100vw - 48px)',
                maxHeight: 'calc(100vh - 120px)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                borderRadius: '16px',
                overflow: 'hidden',
            }}
            className="bg-background border border-border"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
                <div className="flex items-center gap-3">
                    <div
                        style={{
                            width: '40px',
                            height: '40px',
                            minWidth: '40px',
                            maxWidth: '40px',
                            minHeight: '40px',
                            maxHeight: '40px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}
                    >
                        <Sparkles style={{ width: '20px', height: '20px' }} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Lumina AI</h3>
                        <div className="flex items-center gap-1.5 text-primary-foreground/90 text-xs font-medium">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                            </span>
                            Online
                        </div>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 rounded-full hover:bg-white/20 text-primary-foreground"
                >
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 bg-muted/20">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-8 px-2">
                        <div
                            style={{
                                width: '56px',
                                height: '56px',
                                minWidth: '56px',
                                minHeight: '56px',
                                flexShrink: 0,
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            className="bg-primary/10"
                        >
                            <Sparkles className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                            <p className="font-semibold text-base text-foreground">Hi! I'm Lumina</p>
                            <p className="text-xs text-muted-foreground mt-1">Your AI photography assistant</p>
                        </div>
                        {/* Suggestion Cards - Same style as main page */}
                        <div className="w-full space-y-2 pt-2">
                            {SUGGESTIONS.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => setInput(s.prompt)}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-background hover:border-primary/50 transition-all text-left"
                                >
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                                        <s.icon className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground">{s.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3 pb-4">

                        {messages.map((m: any) => (
                            <div
                                key={m.id}
                                className={cn(
                                    "flex flex-col gap-1",
                                    m.role === 'user' ? "items-end" : "items-start"
                                )}
                            >
                                <div className={cn(
                                    "px-3 py-2.5 text-sm max-w-[85%] leading-relaxed prose prose-sm dark:prose-invert max-w-none",
                                    m.role === 'user'
                                        ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm [&_*]:text-primary-foreground"
                                        : "bg-background border border-border text-foreground rounded-2xl rounded-tl-sm"
                                )}>


                                    {/* Extract text from parts (AI SDK v6) or fallback to content */}
                                    {m.parts?.filter((p: any) => p.type === 'text').map((p: any, i: number) => (
                                        <ReactMarkdown key={i} remarkPlugins={[remarkGfm]}>
                                            {p.text}
                                        </ReactMarkdown>
                                    ))}
                                    {/* Fallback for old content format */}
                                    {!m.parts?.length && m.content && (
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {m.content}
                                        </ReactMarkdown>
                                    )}
                                </div>

                                {m.toolInvocations?.map((tool: any) => {
                                    if (tool.toolName === 'get_places') {
                                        if (!('result' in tool)) {
                                            return (
                                                <div key={tool.toolCallId} className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-2 rounded-lg mt-1">
                                                    <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full" />
                                                    Finding...
                                                </div>
                                            );
                                        }
                                        const result = tool.result;
                                        if (result.found && result.places) {
                                            return (
                                                <div key={tool.toolCallId} className="w-full mt-2 space-y-2">
                                                    {result.places.map((place: any) => (
                                                        <LocationCard key={place.id} place={place} />
                                                    ))}
                                                </div>
                                            );
                                        }
                                        return <div key={tool.toolCallId} className="text-xs text-destructive mt-1">No locations found.</div>;
                                    }
                                    return null;
                                })}

                                {/* Handle tool invocations in parts (AI SDK v6 UIMessageStream) */}
                                {/* v6 uses type: 'tool-{toolName}' format, e.g. 'tool-get_places' */}
                                {m.parts?.filter((p: any) => p.type?.startsWith('tool-')).map((part: any, idx: number) => {
                                    // In v6, part.toolInvocation contains the tool data if present
                                    // Otherwise, the part itself might have result/state
                                    const tool = part.toolInvocation || part;
                                    const toolName = tool.toolName || part.type?.replace('tool-', '');

                                    if (toolName === 'get_places') {
                                        // AI SDK v6 uses 'output' not 'result'
                                        const result = tool.output || part.output || tool.result || part.result;

                                        if (!result) {
                                            return (
                                                <div key={`tool-${idx}`} className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-2 rounded-lg mt-1">
                                                    <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full" />
                                                    Finding locations...
                                                </div>
                                            );
                                        }

                                        if (result.found && result.places) {
                                            return (
                                                <div key={`tool-${idx}`} className="w-full mt-2 space-y-2">
                                                    {result.places.map((place: any) => (
                                                        <LocationCard key={place.id} place={place} />
                                                    ))}
                                                </div>
                                            );
                                        }
                                        return <div key={`tool-${idx}`} className="text-xs text-destructive mt-1">No locations found.</div>;
                                    }
                                    return null;
                                })}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-1">
                                <span className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        )}
                        <div ref={scrollRef} className="h-1" />
                    </div>
                )}
            </ScrollArea>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-border bg-background">
                <div className="flex items-end gap-2 bg-muted rounded-xl p-2">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me anything..."
                        rows={1}
                        className="flex-1 bg-transparent border-0 resize-none py-2 px-2 text-sm focus:outline-none placeholder:text-muted-foreground max-h-24 min-h-[36px] text-foreground"
                    />
                    {input.trim() ? (
                        <Button
                            type="submit"
                            size="icon"
                            disabled={isLoading}
                            className="h-9 w-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 rounded-lg text-muted-foreground hover:text-primary shrink-0"
                        >
                            <Mic className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                <p className="text-[9px] text-center text-muted-foreground mt-1.5">
                    AI can make mistakes.
                </p>
            </form>
        </div>
    );
}
