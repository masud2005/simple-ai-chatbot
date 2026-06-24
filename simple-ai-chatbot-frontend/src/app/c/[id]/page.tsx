import ChatLayout from "@/components/chat/ChatLayout";

async function getMessages(id: string) {
  try {
    const res = await fetch(`http://localhost:5000/messages/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const messages = await getMessages(id);

  return <ChatLayout conversationId={id} initialMessages={messages} />;
}
