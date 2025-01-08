export type Chat = {
  chat_id: string;
  buyer_user_id: string;
  buyer_username: string;
  buyer_avatar_url: string | null;
  seller_id: string;
  seller_username: string;
  seller_avatar_url: string | null;
  messages: Message[];
  last_message: Message | null;
};

export type Message = {
  message_id: number;
  chat_id: string;
  sender_user_id: string;
  message_datetime: string;
  message_text: string;
};

export type ChatListItem = {
  chat_id: string;
  buyer_user_id: string;
  seller_user_id: string;
};
