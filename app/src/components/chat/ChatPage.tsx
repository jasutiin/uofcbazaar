import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import { useChat } from '../../hooks/ChatContext.tsx';
import { useAuth } from '../../hooks/AuthContext.tsx';
import { Message } from '../../types/chat.ts';
import { useParams } from 'react-router-dom';

const DEFAULT_AVATAR = '/default-pfp.png';

interface Props {
  onChatSelect?: (chat_id: string | null) => void;
}

function ChatPage({ onChatSelect }: Props) {
  const { id } = useParams();
  const { chat, sendMessage, selectChat, setChat } = useChat();
  const { username, ucid } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }, [chat?.messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [newMessage]);

  useEffect(() => {
    if (onChatSelect && id) onChatSelect(id);
    const fetchChat = async () => {
      setLoading(true);
      if (id) {
        try {
          await selectChat(id);
        } finally {
          setLoading(false);
        }
      } else {
        setChat(null);
        setLoading(false);
      }
    };

    fetchChat();
  }, [id]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chat || newMessage.trim() === '') return;

    try {
      await sendMessage({
        chat_id: chat.chat_id,
        sender_user_id: ucid,
        message_text: newMessage,
      });
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isSellerLoggedIn = username === chat?.seller_username;
  const otherUsername = isSellerLoggedIn
    ? chat?.buyer_username
    : chat?.seller_username;
  const otherAvatar = isSellerLoggedIn
    ? chat?.buyer_avatar_url || DEFAULT_AVATAR
    : chat?.seller_avatar_url || DEFAULT_AVATAR;

  return (
    <div className="relative flex-grow flex flex-col h-full">
      {loading && (
        <div className="absolute inset-0 bg-gray-50 z-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-[#E32A27] rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-500 font-medium">Loading chat...</p>
          </div>
        </div>
      )}

      {chat && (
        <>
          <div className="flex items-center p-4 border-b">
            <button
              onClick={() => {
                if (onChatSelect) onChatSelect(null);
              }}
              className="block md:hidden text-gray-500 mr-3"
            >
              <ArrowLeft />
            </button>
            <img
              src={otherAvatar}
              alt={`${otherUsername}'s avatar`}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full mr-3 object-cover"
            />
            <h2 className="text-xl font-semibold">{otherUsername}</h2>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-3 no-scrollbar bg-gray-50">
            {chat.messages.map((message: Message, index: number) => (
              <div
                key={index}
                className={`flex ${
                  message.sender_user_id === ucid
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`
                    max-w-[250px] md:max-w-sm p-2 md:p-3 rounded-xl shadow-sm 
                    ${
                      message.sender_user_id === ucid
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-black border'
                    } 
                    break-words text-sm md:text-base
                  `}
                >
                  {message.message_text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-4 border-t bg-white flex items-center space-x-2"
          >
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-grow p-2 border rounded-lg resize-none max-h-[120px] overflow-y-auto text-sm"
              rows={1}
              onKeyDown={handleKeyDown}
            />

            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-blue-500 text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
            >
              <Send size={20} />
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default ChatPage;
