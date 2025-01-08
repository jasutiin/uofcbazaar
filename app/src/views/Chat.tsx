import { useState, useEffect } from "react";
import ChatList from "../components/chat/ChatList.tsx";
import ChatPage from "../components/chat/ChatPage.tsx";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext.tsx";
import { useChat } from "../hooks/ChatContext.tsx";

const Chat = () => {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const auth = useAuth();
  const chat = useChat();

  useEffect(() => {
    if (!auth.token) {
      setLoading(false);
      return;
    }

    const fetchChats = async () => {
      setLoading(true);
      try {
        await chat.fetchChats(auth.token);
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [auth.token]);

  if (!auth.token)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <Lock className="mx-auto mb-4 text-red-500" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You must be logged in to access the chat page.
          </p>
          <button
            onClick={() => navigate("/auth/login")}
            className="w-full bg-black text-white py-3 rounded-md hover:bg-red-600 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#E32A27] rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-500 font-medium">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex md:hidden w-full">
        {activeChatId ? (
          <ChatPage onChatSelect={setActiveChatId} />
        ) : (
          <ChatList onChatSelect={setActiveChatId} />
        )}
      </div>

      <div className="hidden md:flex w-full">
        <ChatList onChatSelect={setActiveChatId} />
        <ChatPage onChatSelect={setActiveChatId} />
      </div>
    </div>
  );
};

export default Chat;
