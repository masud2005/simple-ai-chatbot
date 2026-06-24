"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plus, MessageSquare, Trash2, PanelLeftClose, PanelRightClose } from "lucide-react";
import { cn } from "@/lib/utils";
import { Conversation } from "@/types/chat";
import { format, isToday, isYesterday } from "date-fns";

export default function Sidebar() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // fetch conversations from the backend
  const fetchConversations = async () => {
    try {
      const res = await fetch("http://localhost:5000/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.sort((a: Conversation, b: Conversation) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    }
  };


  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
    fetchConversations();

    // Custom event listener to refetch conversations when a new one is created
    const handleConversationCreated = () => fetchConversations();
    window.addEventListener("conversation_created", handleConversationCreated);

    return () => {
      window.removeEventListener("conversation_created", handleConversationCreated);
    };
  }, []);

  const createNewChat = async () => {
    try {
      const res = await fetch("http://localhost:5000/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Chat" }),
      });
      if (res.ok) {
        const newConv = await res.json();
        setConversations((prev) => [newConv, ...prev]);
        router.push(`/c/${newConv.id}`);
      }
    } catch (error) {
      console.error("Failed to create new chat", error);
    }
  };

  const deleteChat = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await fetch(`http://localhost:5000/conversations/${id}`, { method: "DELETE" });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (pathname === `/c/${id}`) {
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to delete chat", error);
    }
  };

  const formatGroupTitle = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d, yyyy");
  };

  // Group conversations by date
  const groupedConversations = conversations.reduce((acc, conv) => {
    const groupTitle = formatGroupTitle(conv.createdAt);
    if (!acc[groupTitle]) acc[groupTitle] = [];
    acc[groupTitle].push(conv);
    return acc;
  }, {} as Record<string, Conversation[]>);

  if (!isOpen) {
    return (
      <aside className="w-16 border-r bg-card flex flex-col h-screen shrink-0 transition-all duration-300 items-center py-4 z-20">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          title="Open Sidebar"
        >
          <PanelRightClose size={20} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-72 border-r bg-card flex flex-col h-screen shrink-0 transition-all duration-300">
      <div className="p-4 flex items-center justify-between">
        <button
          onClick={createNewChat}
          className="flex-1 flex items-center gap-2 rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          New Chat
        </button>
        <button
          onClick={() => setIsOpen(false)}
          className="ml-2 p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <PanelLeftClose size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 pt-0">
        {Object.entries(groupedConversations).map(([group, convs]) => (
          <div key={group} className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-2 uppercase tracking-wider">
              {group}
            </h3>
            <div className="space-y-1">
              {convs.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/c/${conv.id}`}
                  className={cn(
                    "group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                    pathname === `/c/${conv.id}`
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <MessageSquare size={16} className="shrink-0" />
                    <span className="truncate">{conv.title || "New Chat"}</span>
                  </div>
                  <button
                    onClick={(e) => deleteChat(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-all p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
