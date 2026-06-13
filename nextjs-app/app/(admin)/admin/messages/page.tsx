"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { MessageSquare, Search, Phone, Mail } from "lucide-react";
import { getAllMessages } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Message } from "@/types";

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAllMessages()
      .then((res) => setMessages(res.data.messages || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = messages.filter((m) => {
    const text = `${m.firstName} ${m.lastName} ${m.email} ${m.message}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground text-sm">Patient contact messages and inquiries</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search messages..." className="pl-9" value={search}
          onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((msg) => (
            <Card key={msg._id} className="card-hover">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm shrink-0">
                      {msg.firstName[0]}{msg.lastName[0]}
                    </div>
                    <div>
                      <p className="font-semibold">{msg.firstName} {msg.lastName}</p>
                      <div className="flex flex-wrap gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />{msg.email}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />{msg.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {formatDate(msg.createdAt)}
                  </Badge>
                </div>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed bg-muted/50 rounded-lg p-3">
                  {msg.message}
                </p>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No messages yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
