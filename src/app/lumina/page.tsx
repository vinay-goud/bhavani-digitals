'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useChat } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Camera,
    MessageSquare,
    Send,
    Plus,
    MapPin,
    Image as ImageIcon,
    Mic,
    Settings,
    Sparkles,
    Menu,
    Layout,
    History,
    Upload,
    Lightbulb,
    Home,
    Film,
    CalendarCheck,
    Phone,
    User,
    LogOut,
    Trash2,
    X,
    Sun,
    Moon,
    ChevronDown,
    Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LocationCard } from '@/features/lumina/components/artifacts/LocationCard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';

// Navigation Links
const NAV_LINKS = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/gallery', label: 'Gallery', icon: Camera },
    { href: '/cinematic-films', label: 'Films', icon: Film },
    { href: '/booking', label: 'Booking', icon: CalendarCheck },
    { href: '/contact', label: 'Contact', icon: Phone },
];

// Tools
const TOOLS = [
    { id: 'auto', label: 'Auto', icon: Sparkles },
    { id: 'maps', label: 'Locations', icon: MapPin },
    { id: 'vision', label: 'Vision', icon: ImageIcon },
    { id: 'plan', label: 'Planner', icon: Layout },
];

// Models
const MODELS = [
    { id: 'gemini-2.5-flash', name: 'Lumina 2.0', description: 'Default • Balanced' },
    { id: 'gemini-2.5-flash-lite', name: 'Lumina 2.0 Lite', description: 'Fast • Efficient' },
    { id: 'gemini-3-pro-preview', name: 'Lumina Pro', description: 'Most Capable • Preview' },
    { id: 'gemini-2.0-flash', name: 'Lumina 1.0', description: 'Standard' },
    { id: 'gemini-2.0-flash-lite', name: 'Lumina 1.0 Lite', description: 'Lightweight' },
];

// Chat History Item Type
interface ChatHistoryItem {
    id: string;
    title: string;
    timestamp: number;
    messages: any[]; // Store the actual messages
}

export default function LuminaPage() {
    const { user, role, signOut } = useAuth();
    const router = useRouter();
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [selectedTool, setSelectedTool] = useState(TOOLS[0]);
    const [selectedModel, setSelectedModel] = useState(MODELS[0]);
    const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);

    const { messages, sendMessage, status, setMessages } = useChat();
    const isLoading = status === 'submitted' || status === 'streaming';

    useEffect(() => setMounted(true), []);

    // Load history from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('lumina_chat_history');
        if (stored) {
            try {
                setChatHistory(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse chat history');
            }
        }
    }, []);

    // Save to history when messages change (after first user message)
    useEffect(() => {
        if (messages.length >= 2) {
            const firstUserMsg = messages.find(m => m.role === 'user');
            if (firstUserMsg) {
                // Extract text from message parts or content
                let title = 'New Chat';
                const msg = firstUserMsg as any;
                if (typeof msg.content === 'string') {
                    title = msg.content.slice(0, 35);
                } else if (Array.isArray(msg.parts)) {
                    const textPart = msg.parts.find((p: any) => p.type === 'text');
                    if (textPart?.text) {
                        title = textPart.text.slice(0, 35);
                    }
                }

                const existingIndex = chatHistory.findIndex(h => h.title.startsWith(title.slice(0, 20)));
                if (existingIndex === -1) {
                    const newItem: ChatHistoryItem = {
                        id: Date.now().toString(),
                        title: title + (title.length >= 35 ? '...' : ''),
                        timestamp: Date.now(),
                        messages: messages, // Store messages
                    };
                    const updated = [newItem, ...chatHistory.slice(0, 9)];
                    setChatHistory(updated);
                    localStorage.setItem('lumina_chat_history', JSON.stringify(updated));
                } else {
                    // Update existing history with new messages
                    const updated = [...chatHistory];
                    updated[existingIndex] = { ...updated[existingIndex], messages };
                    setChatHistory(updated);
                    localStorage.setItem('lumina_chat_history', JSON.stringify(updated));
                }
            }
        }
    }, [messages]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, status]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input;
        setInput('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';

        await sendMessage({
            role: 'user',
            content: userMessage,
        } as any, {
            body: { model: selectedModel.id }
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    const startNewChat = () => {
        setMessages([]);
        setInput('');
    };

    const clearHistory = () => {
        setChatHistory([]);
        localStorage.removeItem('lumina_chat_history');
    };

    const toggleTheme = () => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    };

    const handleSettingsClick = () => {
        if (role === 'admin') {
            router.push('/admin');
        } else if (user) {
            router.push('/dashboard');
        } else {
            router.push('/auth');
        }
    };

    const suggestions = [
        { icon: MapPin, label: 'Find locations', prompt: 'Find the best outdoor photoshoot spots in Hyderabad' },
        { icon: Lightbulb, label: 'Get tips', prompt: 'Tips for golden hour wedding photography' },
        { icon: Layout, label: 'Plan shoot', prompt: 'Plan a 2-day wedding shoot itinerary' },
        { icon: ImageIcon, label: 'Visual ideas', prompt: 'Trending visual styles for pre-wedding shoots' },
    ];

    return (
        <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground">
            {/* Sidebar */}
            <div className={cn(
                "bg-muted/30 border-r border-border flex flex-col transition-all duration-300 ease-in-out fixed inset-y-0 left-0 z-40 md:static md:translate-x-0 bg-background md:bg-muted/30",
                isSidebarOpen ? "w-[260px] translate-x-0" : "-translate-x-full md:w-0 md:overflow-hidden"
            )}>
                {/* Logo */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-lg">Lumina AI</span>
                    </Link>
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* New Chat */}
                <div className="p-3">
                    <Button onClick={() => { startNewChat(); if (window.innerWidth < 768) setIsSidebarOpen(false); }} variant="outline" className="w-full justify-start gap-2 h-10 rounded-xl">
                        <Plus className="h-4 w-4" />
                        <span className="text-sm font-medium">New Chat</span>
                    </Button>
                </div>

                {/* Navigation */}
                <div className="px-3 py-2">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">Navigate</div>
                    <div className="space-y-0.5">
                        {NAV_LINKS.map(link => (
                            <Link key={link.href} href={link.href}>
                                <Button variant="ghost" className="w-full justify-start gap-3 h-9 text-muted-foreground hover:text-foreground hover:bg-muted">
                                    <link.icon className="h-4 w-4" />
                                    <span className="text-sm">{link.label}</span>
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* History */}
                <div className="flex-1 overflow-y-auto px-3 py-2">
                    <div className="flex items-center justify-between px-2 mb-2">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <History className="h-3 w-3" /> History
                        </div>
                        {chatHistory.length > 0 && (
                            <button onClick={clearHistory} className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                                <Trash2 className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                    {chatHistory.length === 0 ? (
                        <p className="text-xs text-muted-foreground/60 px-2 py-4 text-center">No history yet</p>
                    ) : (
                        <div className="space-y-0.5">
                            {chatHistory.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setMessages(item.messages || [])}
                                    className="w-full text-left px-2 py-2 rounded-lg text-sm hover:bg-muted truncate flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate">{item.title}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* User Section */}
                <div className="p-3 border-t border-border space-y-2">
                    {/* Theme Toggle */}
                    {mounted && (
                        <Button variant="ghost" onClick={toggleTheme} className="w-full justify-start gap-3 h-9 text-muted-foreground hover:text-foreground">
                            {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            <span className="text-sm">{resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                        </Button>
                    )}

                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="w-full justify-start gap-3 h-auto py-2 hover:bg-muted">
                                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                                        {user.email?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col items-start text-left overflow-hidden">
                                        <span className="text-sm font-medium truncate max-w-[140px]">{user.email}</span>
                                        <span className="text-[10px] text-muted-foreground">Premium</span>
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48">
                                <DropdownMenuItem onClick={handleSettingsClick} className="gap-2">
                                    <Settings className="h-4 w-4" /> Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={signOut} className="gap-2 text-destructive">
                                    <LogOut className="h-4 w-4" /> Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link href="/auth">
                            <Button variant="default" className="w-full gap-2">
                                <User className="h-4 w-4" /> Sign In
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col relative w-full h-full">
                {/* Header */}
                <header className="h-14 flex items-center justify-between px-4 bg-background border-b border-border">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-muted-foreground hover:text-foreground">
                            <Menu className="h-5 w-5" />
                        </Button>

                        {/* Model Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3 hover:bg-muted font-semibold text-sm md:text-base">
                                    <span className="flex items-center gap-2">
                                        <span className="text-primary">{selectedModel.name}</span>
                                        <span className="text-xs text-muted-foreground font-normal hidden sm:inline px-1.5 py-0.5 bg-muted rounded">
                                            {selectedModel.description.split('•')[0]}
                                        </span>
                                    </span>
                                    <ChevronDown className="h-4 w-4 text-muted-foreground opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-64">
                                <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">Select Model</DropdownMenuLabel>
                                {MODELS.map(model => (
                                    <DropdownMenuItem key={model.id} onClick={() => setSelectedModel(model)} className="gap-3 py-3 cursor-pointer">
                                        <div className={cn(
                                            "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                                            selectedModel.id === model.id ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                                        )}>
                                            <Cpu className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm">{model.name}</div>
                                            <div className="text-xs text-muted-foreground">{model.description}</div>
                                        </div>
                                        {selectedModel.id === model.id && (
                                            <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
                                        )}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* User Avatar (Mobile) */}
                    <div className="md:hidden">
                        {user ? (
                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                                {user.email?.charAt(0).toUpperCase()}
                            </div>
                        ) : (
                            <Link href="/auth">
                                <Button size="sm" variant="outline" className="gap-1.5">
                                    <User className="h-4 w-4" /> Login
                                </Button>
                            </Link>
                        )}
                    </div>
                </header>

                {/* Chat Area */}
                <ScrollArea className="flex-1">
                    <div className="max-w-3xl mx-auto w-full px-4 py-6 min-h-[calc(100vh-10rem)] flex flex-col">
                        {messages.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-500">
                                <div className="space-y-4">
                                    <div className="h-16 w-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
                                        <Sparkles className="h-8 w-8 text-primary" />
                                    </div>
                                    <h1 className="text-3xl font-bold">
                                        Hello{user ? `, ${user.email?.split('@')[0]}` : ''}!
                                    </h1>
                                    <p className="text-muted-foreground max-w-md mx-auto">
                                        I'm running on <span className="font-medium text-primary">{selectedModel.name}</span>.
                                        Ready to help with your photography needs.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                                    {suggestions.map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setInput(s.prompt)}
                                            className="group flex items-start gap-3 p-4 rounded-xl border border-border bg-background hover:border-primary/50 transition-all text-left hover:shadow-sm"
                                        >
                                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                                <s.icon className="h-5 w-5" />
                                            </div>
                                            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">{s.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 pb-10">
                                {messages.map((m: any, idx) => (
                                    <div key={m.id || idx} className={cn("flex gap-4 animate-in slide-in-from-bottom-2 duration-300", m.role === 'user' ? "justify-end" : "justify-start")}>
                                        {m.role !== 'user' && (
                                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                                                <Sparkles className="h-4 w-4 text-primary-foreground" />
                                            </div>
                                        )}

                                        <div className={cn("flex flex-col gap-2 max-w-[85%] md:max-w-[75%]", m.role === 'user' ? "items-end" : "items-start")}>
                                            <div className={cn(
                                                "px-4 py-3 text-[15px] leading-relaxed shadow-sm prose prose-sm dark:prose-invert max-w-none",
                                                m.role === 'user'
                                                    ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm [&_*]:text-primary-foreground"
                                                    : "bg-muted text-foreground rounded-2xl rounded-tl-sm"
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
                                                            <div key={tool.toolCallId} className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-4 py-3 rounded-xl border border-border">
                                                                <div className="flex gap-1">
                                                                    <span className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                                    <span className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                                    <span className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                                </div>
                                                                Finding locations...
                                                            </div>
                                                        );
                                                    }
                                                    const result = tool.result;
                                                    if (result.found && result.places) {
                                                        return (
                                                            <div key={tool.toolCallId} className="w-full mt-2 overflow-x-auto">
                                                                <div className="flex gap-3 pb-3 snap-x">
                                                                    {result.places.map((place: any) => (
                                                                        <div key={place.id} className="snap-center shrink-0 w-[280px]">
                                                                            <LocationCard place={place} />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return <div key={tool.toolCallId} className="text-sm text-destructive mt-1">No locations found.</div>;
                                                }
                                                return null;
                                            })}

                                            {/* Handle tool invocations in parts (AI SDK v6 UIMessageStream) */}
                                            {/* v6 uses type: 'tool-{toolName}' format, e.g. 'tool-get_places' */}
                                            {m.parts?.filter((p: any) => p.type?.startsWith('tool-')).map((part: any, idx: number) => {
                                                const tool = part.toolInvocation || part;
                                                const toolName = tool.toolName || part.type?.replace('tool-', '');

                                                if (toolName === 'get_places') {
                                                    // AI SDK v6 uses 'output' not 'result'
                                                    const result = tool.output || part.output || tool.result || part.result;

                                                    if (!result) {
                                                        return (
                                                            <div key={`tool-${idx}`} className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-4 py-3 rounded-xl border border-border">
                                                                <div className="flex gap-1">
                                                                    <span className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                                    <span className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                                    <span className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                                </div>
                                                                Finding locations...
                                                            </div>
                                                        );
                                                    }

                                                    if (result.found && result.places) {
                                                        return (
                                                            <div key={`tool-${idx}`} className="w-full mt-2 space-y-3">
                                                                {result.places.map((place: any) => (
                                                                    <LocationCard key={place.id} place={place} />
                                                                ))}
                                                            </div>
                                                        );
                                                    }
                                                    return <div key={`tool-${idx}`} className="text-sm text-destructive mt-1">No locations found.</div>;
                                                }
                                                return null;
                                            })}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex gap-4">
                                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                                            <Sparkles className="h-4 w-4 text-primary-foreground" />
                                        </div>
                                        <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5 min-w-[60px]">
                                            <span className="h-2 w-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="h-2 w-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="h-2 w-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} className="h-1" />
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 bg-background border-t border-border">
                    <div className="max-w-3xl mx-auto">
                        <div className="relative flex items-end gap-2 bg-muted rounded-2xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                            {/* Plus Button */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button type="button" size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground shrink-0 hover:bg-background">
                                        <Plus className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    <DropdownMenuItem className="gap-2"><Upload className="h-4 w-4" /> Upload Image</DropdownMenuItem>
                                    <DropdownMenuItem className="gap-2"><MapPin className="h-4 w-4" /> Share Location</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Tools Dropdown - Inside Input */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button type="button" variant="ghost" className="h-10 px-3 rounded-xl text-muted-foreground hover:text-foreground shrink-0 gap-1.5 hover:bg-background">
                                        <selectedTool.icon className="h-4 w-4" />
                                        <span className="text-xs hidden sm:inline">{selectedTool.label}</span>
                                        <ChevronDown className="h-3 w-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    {TOOLS.map(tool => (
                                        <DropdownMenuItem key={tool.id} onClick={() => setSelectedTool(tool)} className="gap-2">
                                            <tool.icon className="h-4 w-4" />
                                            <span>{tool.label}</span>
                                            {selectedTool.id === tool.id && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={`Message ${selectedModel.name}...`}
                                rows={1}
                                className="flex-1 bg-transparent border-0 resize-none py-2.5 px-2 text-sm focus:outline-none placeholder:text-muted-foreground max-h-48 min-h-[44px] text-foreground"
                            />

                            {input.trim() ? (
                                <Button
                                    onClick={handleSubmit}
                                    size="icon"
                                    disabled={isLoading}
                                    className="h-10 w-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 shadow-sm"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button type="button" size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-muted-foreground hover:text-primary shrink-0 hover:bg-background">
                                    <Mic className="h-5 w-5" />
                                </Button>
                            )}
                        </div>
                        <p className="text-[10px] text-center text-muted-foreground mt-2 opacity-70">
                            {selectedModel.name} may produce inaccurate information.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
