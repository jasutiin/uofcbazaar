import { useAuth } from "../../hooks/AuthContext.tsx";
import { useChat } from "../../hooks/ChatContext.tsx";
import { useNavigate } from "react-router-dom";
import { MessageCircle, CheckCircle2 } from "lucide-react";
import { Chat } from "../../types/chat.ts";

const DEFAULT_AVATAR = "/default-pfp.png";

interface Props {
  chat: Chat;
}

function ChatListItem({ chat }: Props) {
  const { selectChat, activeChat } = useChat();
  const { username } = useAuth();
  const navigate = useNavigate();

  const isSellerLoggedIn = username === chat.seller_username;
  const otherUsername = isSellerLoggedIn
    ? chat.buyer_username
    : chat.seller_username;
  const avatarUrl = isSellerLoggedIn
    ? chat.buyer_avatar_url || DEFAULT_AVATAR
    : chat.seller_avatar_url || DEFAULT_AVATAR;

  const isActive = activeChat?.chat_id === chat.chat_id;

  const handleClick = () => {
    selectChat(chat.chat_id);
    navigate(`/chat/${chat.chat_id}`);
  };

  const truncateMessage = (message: string, maxLength: number = 30) => {
    return message.length > maxLength
      ? `${message.slice(0, maxLength)}...`
      : message;
  };

  return (
    <div
      onClick={handleClick}
      className={`
        flex items-center p-3 cursor-pointer border-b transition-all duration-200 
        ${
          isActive
            ? "bg-blue-50 border-l-4 border-blue-500"
            : "hover:bg-gray-100"
        }
        relative
      `}
    >
      <div className="relative mr-3">
        <img
          src={avatarUrl}
          alt={`${otherUsername}'s avatar`}
          className="w-12 h-12 rounded-full object-cover"
        />
      </div>

      <div className="flex-grow overflow-hidden pr-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-800 truncate">
            {otherUsername}
          </h3>
          {chat.last_message && (
            <span className="text-xs text-gray-500">
              {new Date(chat.last_message.message_datetime).toLocaleTimeString(
                [],
                {
                  hour: "2-digit",
                  minute: "2-digit",
                },
              )}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1">
          {chat.last_message && (
            <>
              {chat.last_message.sender_user_id === username ? (
                <CheckCircle2
                  size={16}
                  className="text-blue-500 flex-shrink-0"
                />
              ) : (
                <MessageCircle
                  size={16}
                  className="text-gray-400 flex-shrink-0"
                />
              )}
              <p className="text-sm text-gray-500 truncate">
                {truncateMessage(chat.last_message.message_text)}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatListItem;
