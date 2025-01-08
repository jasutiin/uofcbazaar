import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import supabase from "../utils/supabase.ts";
import { Chat, ChatListItem, Message } from "../types/chat.ts";

interface ChatContextType {
  chat: Chat | null;
  chatList: ChatListItem[];
  setChat: (newChat: Chat | null) => void;
  fetchChats: (token: string) => void;
  sendMessage: (message: Message) => Promise<void>;
  selectChat: (chatId: string) => void;
}

export const ChatContext = createContext<ChatContextType | undefined>(
  undefined,
);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [chatList, setChatList] = useState<ChatListItem[]>([]);

  useEffect(() => {
    if (!chat) return;

    const channel = supabase
      .channel(`chat:${chat.chat_id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "message",
          filter: `chat_id=eq.${chat.chat_id}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;

          setChat((prevChat: Chat) => {
            if (!prevChat) return null;

            const isDuplicate = prevChat.messages.some(
              (msg) => msg.message_id === newMessage.message_id,
            );

            if (isDuplicate) return prevChat;

            return {
              ...prevChat,
              messages: [...prevChat.messages, newMessage],
            };
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chat?.chat_id]);

  const fetchChats = async (token: string) => {
    try {
      const response = await fetch("/api/chats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch chats");
      const chats = await response.json();
      setChatList(chats);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const selectChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat/${chatId}`);
      if (!response.ok) throw new Error("Failed to fetch chat details");
      const chatDetails = await response.json();
      setChat(chatDetails);
    } catch (error) {
      console.error("Error selecting chat:", error);
    }
  };

  const sendMessage = async (messageData: Message) => {
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      throw err;
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chat,
        setChat,
        fetchChats,
        chatList,
        sendMessage,
        selectChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
