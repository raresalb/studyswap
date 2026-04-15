"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, MessageSquare, ArrowLeft } from "lucide-react";
import { getInitials, timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ConversationPartner, MessageData } from "./page";

interface MessagesClientProps {
  conversations: ConversationPartner[];
  currentUserId: string;
}

export function MessagesClient({ conversations, currentUserId }: MessagesClientProps) {
  const [selectedPartner, setSelectedPartner] = useState<ConversationPartner | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  // mobile: "list" | "chat"
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedPartner) return;
    setLoadingMessages(true);
    fetch(`/api/messages?partnerId=${selectedPartner.id}`)
      .then((r) => r.json())
      .then((data) => setMessages(data.messages ?? []))
      .catch(() => setMessages([]))
      .finally(() => setLoadingMessages(false));
  }, [selectedPartner]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function openChat(partner: ConversationPartner) {
    setSelectedPartner(partner);
    setMobileView("chat");
  }

  function backToList() {
    setMobileView("list");
  }

  async function sendMessage() {
    if (!input.trim() || !selectedPartner || sending) return;
    const content = input.trim();
    setInput("");
    setSending(true);

    const optimistic: MessageData = {
      id: `temp-${Date.now()}`,
      content,
      senderId: currentUserId,
      receiverId: selectedPartner.id,
      isRead: false,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: selectedPartner.id, content }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? data.message : m)));
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInput(content);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  // ── Conversation list ──────────────────────────────────────────
  const ConversationList = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border flex-shrink-0">
        <h2 className="font-semibold text-sm">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
              <MessageSquare className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="font-medium text-sm">No conversations yet</p>
            <p className="text-xs text-muted-foreground">Start a conversation from someone's profile</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => openChat(conv)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/60 active:bg-muted transition-colors text-left border-b border-border/50 last:border-0",
                selectedPartner?.id === conv.id && "bg-muted"
              )}
            >
              <div className="relative flex-shrink-0">
                <Avatar className="w-11 h-11">
                  <AvatarImage src={conv.image ?? ""} />
                  <AvatarFallback className="text-xs bg-violet-100 text-violet-700">
                    {getInitials(conv.name ?? "U")}
                  </AvatarFallback>
                </Avatar>
                {conv.unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
                    {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className={cn("text-sm truncate", conv.unreadCount > 0 ? "font-semibold" : "font-medium")}>
                    {conv.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground flex-shrink-0 ml-2">
                    {timeAgo(conv.lastMessageAt)}
                  </span>
                </div>
                <p className={cn("text-xs truncate", conv.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground")}>
                  {conv.lastMessage || "No messages yet"}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );

  // ── Chat panel ────────────────────────────────────────────────
  const ChatPanel = () => (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border flex-shrink-0 bg-card">
        <button
          onClick={backToList}
          className="md:hidden p-1.5 -ml-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        {selectedPartner && (
          <>
            <Avatar className="w-9 h-9 flex-shrink-0">
              <AvatarImage src={selectedPartner.image ?? ""} />
              <AvatarFallback className="text-xs bg-violet-100 text-violet-700">
                {getInitials(selectedPartner.name ?? "U")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{selectedPartner.name}</p>
              {selectedPartner.university && (
                <p className="text-xs text-muted-foreground truncate">{selectedPartner.university}</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {loadingMessages ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                <Skeleton className={`h-10 rounded-2xl ${i % 2 === 0 ? "w-40" : "w-56"}`} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Start the conversation</p>
            <p className="text-xs text-muted-foreground">Say hello to {selectedPartner?.name}</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={cn(
                  "max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm",
                  isMine
                    ? "bg-gradient-to-br from-violet-600 to-blue-500 text-white rounded-br-sm"
                    : "bg-muted rounded-bl-sm"
                )}>
                  <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                  <p className={cn("text-[11px] mt-1", isMine ? "text-white/60" : "text-muted-foreground")}>
                    {timeAgo(msg.createdAt)}{isMine && msg.isRead && " · Read"}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-3 border-t border-border bg-card flex-shrink-0">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${selectedPartner?.name ?? ""}...`}
          disabled={sending}
          className="flex-1 rounded-full bg-muted border-0 focus-visible:ring-1 focus-visible:ring-violet-500 text-sm"
        />
        <button
          onClick={sendMessage}
          disabled={sending || !input.trim()}
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0",
            input.trim()
              ? "bg-gradient-to-br from-violet-600 to-blue-500 text-white shadow-md shadow-violet-500/30"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop: side by side ── */}
      <div className="hidden md:flex border border-border rounded-2xl overflow-hidden bg-card h-[calc(100vh-8rem)]">
        {/* Left: conversation list */}
        <div className="w-72 flex-shrink-0 border-r border-border">
          <ConversationList />
        </div>
        {/* Right: chat */}
        <div className="flex-1 min-w-0">
          {!selectedPartner ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="font-medium">Select a conversation</p>
              <p className="text-sm text-muted-foreground">Choose from the list on the left</p>
            </div>
          ) : (
            <ChatPanel />
          )}
        </div>
      </div>

      {/* ── Mobile: toggle between list and chat ── */}
      <div className="md:hidden flex flex-col bg-card rounded-2xl border border-border overflow-hidden" style={{ height: "calc(100dvh - 7rem)" }}>
        {mobileView === "list" || !selectedPartner ? (
          <ConversationList />
        ) : (
          <ChatPanel />
        )}
      </div>
    </>
  );
}
