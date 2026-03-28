"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getSession } from "@/lib/auth";
import { messageStorage } from "@/lib/storage";
import { nanoid, formatDate } from "@/lib/utils";
import type { Message } from "@/types";
import { toast } from "sonner";
import {
  LayoutDashboard, User, FileText, MessageSquare, Briefcase,
  Send, Shield, Info
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CandidateMessages() {
  const locale = useLocale();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [userId, setUserId] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const navItems = [
    { label: "Dashboard", href: `/${locale}/candidate`, icon: LayoutDashboard },
    { label: "My Profile", href: `/${locale}/candidate/profile`, icon: User },
    { label: "Documents", href: `/${locale}/candidate/documents`, icon: FileText },
    { label: "Messages", href: `/${locale}/candidate/messages`, icon: MessageSquare },
    { label: "Job Matches", href: `/${locale}/candidate/matches`, icon: Briefcase },
  ];

  const loadMessages = (uid: string) => {
    const msgs = messageStorage.getByCandidateId(uid);
    setMessages(msgs.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()));
    msgs.filter((m) => !m.isRead && m.sender === "msc_admin").forEach((m) => messageStorage.markRead(m.id));
  };

  useEffect(() => {
    const session = getSession();
    if (!session || !["candidate", "apprentice", "skilled_worker"].includes(session.role)) {
      router.push(`/${locale}/login`);
      return;
    }
    setUserId(session.userId);
    loadMessages(session.userId);
  }, [locale, router]);

  const sendMessage = () => {
    if (!newMessage.trim() || !userId) return;
    setSending(true);
    const msg: Message = {
      id: nanoid(),
      candidateId: userId,
      sender: "candidate",
      content: newMessage.trim(),
      isRead: false,
      sentAt: new Date().toISOString(),
    };
    messageStorage.send(msg);
    loadMessages(userId);
    setNewMessage("");
    setSending(false);
    toast.success("Message sent to MSC team!");
  };

  return (
    <DashboardLayout navItems={navItems} title="Messages" role="candidate">
      <div className="max-w-3xl space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
          <p className="text-sm text-gray-500 mt-1">Communicate directly with the MSC recruitment team.</p>
        </div>

        {/* Privacy Notice */}
        <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700">
            <strong>Private messaging:</strong> Your messages are only visible to the MSC team. No direct communication with employers is possible — this protects your privacy and ensures fair placement.
          </p>
        </div>

        {/* Chat Area */}
        <Card className="flex flex-col" style={{ minHeight: "400px" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              MSC Recruitment Team
              <Badge variant="success" className="text-xs">Online</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            <ScrollArea className="flex-1 pr-2" style={{ maxHeight: "350px" }}>
              {messages.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs mt-1">Send a message to the MSC team — we typically respond within 24 hours.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-2",
                        msg.sender === "candidate" ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.sender === "msc_admin" && (
                        <div className="w-8 h-8 rounded-full gradient-msc flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white text-xs font-bold">M</span>
                        </div>
                      )}
                      <div className={cn(
                        "max-w-xs sm:max-w-sm rounded-2xl px-4 py-3",
                        msg.sender === "candidate"
                          ? "bg-blue-600 text-white rounded-tr-sm"
                          : "bg-gray-100 text-gray-900 rounded-tl-sm"
                      )}>
                        {msg.sender === "msc_admin" && (
                          <div className="text-xs font-semibold mb-1 text-blue-600">MSC Team</div>
                        )}
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <p className={cn(
                          "text-xs mt-1",
                          msg.sender === "candidate" ? "text-blue-200" : "text-gray-400"
                        )}>
                          {formatDate(msg.sentAt, locale)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="flex gap-2 pt-3 border-t">
              <Textarea
                placeholder="Type your message to the MSC team..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                rows={2}
                className="resize-none"
              />
              <Button
                variant="msc"
                size="icon"
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                className="flex-shrink-0 self-end"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
