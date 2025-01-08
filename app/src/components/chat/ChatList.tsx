import { useEffect } from "react";
import { MessageCircle, Users } from "lucide-react";
import { useChat } from "../../hooks/ChatContext.tsx";
import { useAuth } from "../../hooks/AuthContext.tsx";
import ChatListItem from "./ChatListItem.tsx";
import { Chat } from "../../types/chat.ts";

interface Props {
  onChatSelect: (chat_id: string | null) => void;
}

function ChatList({ onChatSelect }: Props) {
  const { chatList, fetchChats } = useChat();
  const auth = useAuth();

  useEffect(() => {
    if (auth.token) {
      fetchChats(auth.token);
    }
  }, [auth.token]);

  return (
    <div
      className={`
        bg-white shadow-lg transform md:static md:w-96 w-full overflow-auto no-scrollbar
        fixed top-24 inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out
      `}
    >
      <div className="p-4 border-b items-center space-x-3 flex">
        <MessageCircle className="text-blue-500" size={24} />
        <h2 className="text-xl font-semibold text-gray-800">Chats</h2>
      </div>

      <div className="h-full flex flex-col">
        {!chatList || chatList.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-gray-500 space-y-3 p-4">
            <Users size={48} className="text-gray-300" />
            <p className="text-center">No chats available</p>
          </div>
        ) : (
          <div className="flex-grow h-full">
            {chatList.map((chat: Chat) => (
              <div
                key={chat.chat_id}
                onClick={() => onChatSelect(chat.chat_id)}
              >
                <ChatListItem chat={chat} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatList;
