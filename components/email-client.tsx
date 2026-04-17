"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Copy,
  RefreshCw,
  Mail,
  Shield,
  ChevronDown,
  Inbox,
  Clock,
  Paperclip,
  CheckCircle2,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmailAddress {
  email: string;
  login: string;
  domain: string;
}

interface MessagePreview {
  id: number;
  from: string;
  subject: string;
  date: string;
}

interface MessageFull extends MessagePreview {
  htmlBody: string;
  textBody: string;
  attachments: Array<{ filename: string; contentType: string; size: number }>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
}

function getInitials(from: string): string {
  const name = from.replace(/<.*>/, "").trim();
  const parts = name.split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getAvatarColor(from: string): string {
  const colors = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
    "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-600",
    "from-indigo-500 to-blue-600",
  ];
  let hash = 0;
  for (let i = 0; i < from.length; i++) hash += from.charCodeAt(i);
  return colors[hash % colors.length];
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

interface SidebarProps {
  emailAddress: EmailAddress | null;
  loading: boolean;
  countdown: number;
  messageCount: number;
  onGenerate: () => void;
  onRefresh: () => void;
  onCopy: () => void;
}

function Sidebar({
  emailAddress,
  loading,
  countdown,
  messageCount,
  onGenerate,
  onRefresh,
  onCopy,
}: SidebarProps) {
  const progress = (countdown / 30) * 100;

  return (
    <div className="w-72 shrink-0 flex flex-col h-full bg-[#0c0c1a] border-r border-white/[0.06]">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-900/30">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white tracking-tight">TempDrop</p>
          <p className="text-[10px] text-white/30 leading-none mt-0.5">Disposable inbox</p>
        </div>
      </div>

      <Separator className="bg-white/[0.06]" />

      {/* Email Address Box */}
      <div className="p-4">
        <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2 font-medium">
          Your inbox
        </p>
        <div className="relative rounded-xl bg-white/[0.04] border border-white/[0.08] p-3 group">
          {/* Glow on hover */}
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-violet-500/5 to-purple-500/5 pointer-events-none" />

          {loading || !emailAddress ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-white/[0.06]" />
              <Skeleton className="h-3 w-2/3 bg-white/[0.04]" />
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-mono text-violet-300 truncate font-medium">
                    {emailAddress.login}
                  </p>
                  <p className="text-xs font-mono text-white/40 truncate">
                    @{emailAddress.domain}
                  </p>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={onCopy}
                        className="shrink-0 w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-violet-500/20 hover:text-violet-300 text-white/40 transition-all flex items-center justify-center"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Copy address</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Auto-refresh timer */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-white/30 uppercase tracking-widest font-medium">
            Auto-refresh
          </span>
          <span className="text-[10px] font-mono text-white/40">
            {countdown}s
          </span>
        </div>
        <div className="h-0.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-1000 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Separator className="bg-white/[0.06]" />

      {/* Stats */}
      <div className="px-4 py-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5 text-center">
          <p className="text-lg font-bold text-white">{messageCount}</p>
          <p className="text-[10px] text-white/30">Messages</p>
        </div>
        <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5 text-center">
          <p className="text-lg font-bold text-white">∞</p>
          <p className="text-[10px] text-white/30">Storage</p>
        </div>
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="p-4 space-y-2">
        <Button
          onClick={onRefresh}
          variant="outline"
          className="w-full border-white/[0.08] bg-white/[0.03] text-white/70 hover:bg-white/[0.07] hover:text-white hover:border-white/[0.12] h-9 text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Check inbox
        </Button>
        <Button
          onClick={onGenerate}
          disabled={loading}
          className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 h-9 text-xs shadow-lg shadow-violet-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-3.5 h-3.5" />
          {loading ? "Generating..." : "New address"}
        </Button>
      </div>

      <div className="px-4 pb-4">
        <p className="text-[10px] text-white/20 text-center leading-relaxed">
          Emails auto-delete after 1 hour.
          <br />
          No registration required.
        </p>
      </div>
    </div>
  );
}

// ─── Message List ─────────────────────────────────────────────────────────────

interface MessageListProps {
  messages: MessagePreview[];
  loading: boolean;
  selectedId: number | null;
  onSelect: (id: number) => void;
}

function MessageList({ messages, loading, selectedId, onSelect }: MessageListProps) {
  return (
    <div className="w-80 shrink-0 flex flex-col h-full border-r border-white/[0.06]">
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Inbox className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-semibold text-white">Inbox</span>
          {messages.length > 0 && (
            <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/20 text-[10px] px-1.5 py-0">
              {messages.length}
            </Badge>
          )}
        </div>
        <button className="text-white/30 hover:text-white/60 transition-colors">
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      <Separator className="bg-white/[0.06]" />

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-3 space-y-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Skeleton className="w-8 h-8 rounded-lg bg-white/[0.06]" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-3/4 bg-white/[0.06]" />
                    <Skeleton className="h-2.5 w-1/2 bg-white/[0.04]" />
                  </div>
                </div>
                <Skeleton className="h-2.5 w-full bg-white/[0.04]" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-white/20" />
            </div>
            <p className="text-sm font-medium text-white/40 mb-1">No messages yet</p>
            <p className="text-xs text-white/20 leading-relaxed">
              Send an email to your temporary address and it will appear here
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => onSelect(msg.id)}
                className={cn(
                  "w-full text-left p-3 rounded-xl transition-all group",
                  selectedId === msg.id
                    ? "bg-violet-500/15 border border-violet-500/25"
                    : "hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06]"
                )}
              >
                <div className="flex items-start gap-2.5">
                  {/* Avatar */}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0 text-[11px] font-bold text-white",
                      getAvatarColor(msg.from)
                    )}
                  >
                    {getInitials(msg.from)}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* From + time */}
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span
                        className={cn(
                          "text-xs font-semibold truncate",
                          selectedId === msg.id ? "text-violet-200" : "text-white/80"
                        )}
                      >
                        {msg.from.replace(/<.*>/, "").trim() || msg.from}
                      </span>
                      <span className="text-[10px] text-white/25 shrink-0 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {timeAgo(msg.date)}
                      </span>
                    </div>

                    {/* Subject */}
                    <p
                      className={cn(
                        "text-xs truncate leading-relaxed",
                        selectedId === msg.id ? "text-white/60" : "text-white/40"
                      )}
                    >
                      {msg.subject || "(No subject)"}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// ─── Message Viewer ───────────────────────────────────────────────────────────

interface MessageViewerProps {
  message: MessageFull | null;
  loading: boolean;
  login: string;
  domain: string;
  onBack?: () => void;
}

function MessageViewer({ message, loading, onBack }: MessageViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && message?.htmlBody) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8" />
              <style>
                * { box-sizing: border-box; }
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                  font-size: 14px;
                  line-height: 1.6;
                  color: #e2e8f0;
                  background: transparent;
                  margin: 0;
                  padding: 0;
                  word-break: break-word;
                }
                a { color: #a78bfa; }
                img { max-width: 100%; height: auto; }
                table { max-width: 100%; }
              </style>
            </head>
            <body>${message.htmlBody}</body>
          </html>
        `);
        doc.close();
      }
    }
  }, [message?.htmlBody]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col h-full">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <Skeleton className="h-5 w-2/3 bg-white/[0.06] mb-3" />
          <div className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-full bg-white/[0.06]" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-32 bg-white/[0.06]" />
              <Skeleton className="h-3 w-48 bg-white/[0.04]" />
            </div>
          </div>
        </div>
        <div className="flex-1 p-6 space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton
              key={i}
              className={cn(
                "h-3 bg-white/[0.04]",
                i % 3 === 2 ? "w-2/3" : "w-full"
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
            <Mail className="w-9 h-9 text-white/15" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
            <Shield className="w-3 h-3 text-violet-400" />
          </div>
        </div>
        <h3 className="text-base font-semibold text-white/50 mb-2">
          Select a message
        </h3>
        <p className="text-sm text-white/25 leading-relaxed max-w-xs">
          Choose an email from your inbox to read it here
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full min-w-0">
      {/* Email header */}
      <div className="px-6 py-4 border-b border-white/[0.06] shrink-0">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to inbox
          </button>
        )}
        <h2 className="text-base font-semibold text-white mb-3 leading-snug">
          {message.subject || "(No subject)"}
        </h2>

        <div className="flex items-start gap-3">
          <div
            className={cn(
              "w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center shrink-0 text-sm font-bold text-white",
              getAvatarColor(message.from)
            )}
          >
            {getInitials(message.from)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-white/80 truncate">
                {message.from.replace(/<.*>/, "").trim() || message.from}
              </p>
              <span className="text-xs text-white/30 shrink-0">
                {new Date(message.date).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <p className="text-xs text-white/30 truncate mt-0.5">
              {message.from.match(/<(.+)>/)?.[1] || message.from}
            </p>
          </div>
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.attachments.map((att, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs text-white/50"
              >
                <Paperclip className="w-3 h-3" />
                <span className="truncate max-w-[120px]">{att.filename}</span>
                <span className="text-white/25">
                  {(att.size / 1024).toFixed(1)}KB
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Email body */}
      <ScrollArea className="flex-1">
        <div className="px-6 py-5">
          {message.htmlBody ? (
            <iframe
              ref={iframeRef}
              className="w-full border-0 min-h-[400px]"
              style={{ height: "600px" }}
              sandbox="allow-same-origin"
              title="Email content"
            />
          ) : (
            <pre className="text-sm text-white/60 whitespace-pre-wrap font-sans leading-relaxed">
              {message.textBody || "No content"}
            </pre>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Main EmailClient ─────────────────────────────────────────────────────────

export function EmailClient() {
  const [emailAddress, setEmailAddress] = useState<EmailAddress | null>(null);
  const [messages, setMessages] = useState<MessagePreview[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<MessageFull | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loadingEmail, setLoadingEmail] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [mobileView, setMobileView] = useState<"list" | "viewer">("list");

  const generateEmail = useCallback(async () => {
    setLoadingEmail(true);
    setMessages([]);
    setSelectedMessage(null);
    setSelectedId(null);
    try {
      const res = await fetch("/api/generate");
      if (!res.ok) throw new Error("Failed to generate email");
      const data: EmailAddress = await res.json();
      if (!data.login || !data.domain) throw new Error("Invalid response");
      setEmailAddress(data);
    } catch {
      toast({ title: "Error", description: "Failed to generate email address.", variant: "destructive" });
    } finally {
      setLoadingEmail(false);
    }
  }, []);

  const fetchMessages = useCallback(async (addr: EmailAddress) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(
        `/api/messages?login=${encodeURIComponent(addr.login)}&domain=${encodeURIComponent(addr.domain)}`
      );
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages((prev) => {
          if (data.length > prev.length && prev.length > 0) {
            toast({
              title: "New email arrived!",
              description: `${data[0].from}: ${data[0].subject || "(No subject)"}`,
            });
          }
          return data;
        });
      }
    } catch {
      // silent fail on poll
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const fetchMessage = useCallback(async (id: number) => {
    if (!emailAddress) return;
    setLoadingMessage(true);
    setSelectedId(id);
    setMobileView("viewer");
    try {
      const res = await fetch(
        `/api/message?login=${encodeURIComponent(emailAddress.login)}&domain=${encodeURIComponent(emailAddress.domain)}&id=${id}`
      );
      const data = await res.json();
      setSelectedMessage(data);
    } catch {
      toast({ title: "Error", description: "Failed to load message.", variant: "destructive" });
    } finally {
      setLoadingMessage(false);
    }
  }, [emailAddress]);

  const copyEmail = useCallback(() => {
    if (!emailAddress) return;
    navigator.clipboard.writeText(emailAddress.email).then(() => {
      toast({
        title: (
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Copied!
          </span>
        ) as unknown as string,
        description: `${emailAddress.email} copied to clipboard`,
      });
    });
  }, [emailAddress]);

  // Initial load
  useEffect(() => {
    generateEmail();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh countdown
  useEffect(() => {
    if (!emailAddress) return;
    setCountdown(30);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          fetchMessages(emailAddress);
          return 30;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [emailAddress, fetchMessages]);

  // Fetch messages when email changes
  useEffect(() => {
    if (emailAddress) fetchMessages(emailAddress);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailAddress]);

  return (
    <TooltipProvider>
      <div className="flex h-screen w-screen bg-[#0e0e1c] text-white overflow-hidden">
        {/* Sidebar — hidden on small screens when viewing a message */}
        <div
          className={cn(
            "md:flex flex-col",
            mobileView === "viewer" ? "hidden" : "flex"
          )}
        >
          <Sidebar
            emailAddress={emailAddress}
            loading={loadingEmail}
            countdown={countdown}
            messageCount={messages.length}
            onGenerate={generateEmail}
            onRefresh={() => emailAddress && fetchMessages(emailAddress)}
            onCopy={copyEmail}
          />
        </div>

        {/* Message list — hidden on small screens when viewing a message */}
        <div
          className={cn(
            "md:flex flex-col",
            mobileView === "viewer" ? "hidden" : "flex"
          )}
        >
          <MessageList
            messages={messages}
            loading={loadingMessages && messages.length === 0}
            selectedId={selectedId}
            onSelect={fetchMessage}
          />
        </div>

        {/* Message viewer */}
        <div
          className={cn(
            "flex-1 flex flex-col min-w-0",
            mobileView === "list" ? "hidden md:flex" : "flex"
          )}
        >
          <MessageViewer
            message={selectedMessage}
            loading={loadingMessage}
            login={emailAddress?.login ?? ""}
            domain={emailAddress?.domain ?? ""}
            onBack={
              mobileView === "viewer"
                ? () => setMobileView("list")
                : undefined
            }
          />
        </div>

        {/* Ambient background glow */}
        <div
          className="fixed inset-0 pointer-events-none"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 10% 50%, rgba(124,58,237,0.06) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 90% 20%, rgba(139,92,246,0.04) 0%, transparent 70%)",
          }}
        />
      </div>
    </TooltipProvider>
  );
}
