import { Context, RouterContext } from "@oak/oak";
import db from "../db.ts";
import { getUserInfoFromAuthHeader } from "../utils.ts";

export class ChatController {
  async createChat(ctx: Context) {
    const { seller_username, buyer_username } = await ctx.request.body.json();

    try {
      const { data: buyerUser, error: buyerError } = await db
        .from("users")
        .select("ucid")
        .eq("username", buyer_username)
        .single();

      const { data: sellerUser, error: sellerError } = await db
        .from("users")
        .select("ucid")
        .eq("username", seller_username)
        .single();

      if (buyerError || sellerError) {
        ctx.response.status = 404;
        ctx.response.body = {
          message: "User not found",
          buyerError,
          sellerError,
        };
        return;
      }

      const { data: existingChat, error: existingChatError } = await db
        .from("chat")
        .select("*")
        .eq("buyer_user_id", buyerUser.ucid)
        .eq("seller_user_id", sellerUser.ucid)
        .single();

      if (existingChatError && existingChatError.code === "PGRST116") {
        const { data: newChat, error: createError } = await db
          .from("chat")
          .insert({
            buyer_user_id: buyerUser.ucid,
            seller_user_id: sellerUser.ucid,
          })
          .select();

        if (createError) {
          ctx.response.status = 500;
          ctx.response.body = {
            message: "Error creating chat",
            error: createError,
          };
          return;
        }

        ctx.response.status = 201;
        ctx.response.body = {
          chat_id: newChat[0].chat_id,
          message: "Chat created",
        };
        return;
      }

      if (existingChatError) {
        ctx.response.status = 500;
        ctx.response.body = {
          message: "Error finding chat",
          error: existingChatError,
        };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = {
        chat_id: existingChat.chat_id,
        message: "Chat found",
      };
    } catch (error) {
      console.error("Unexpected error in chat creation:", error);
      ctx.response.status = 500;
      ctx.response.body = {
        message: "Unexpected error in createChat",
      };
    }
  }

  async getChat(ctx: RouterContext<"/api/chat/:id">) {
    try {
      const chat_id = ctx.params.id;

      const { data: chatDetails, error: chatError } = await db
        .from("chat")
        .select("chat_id, buyer_user_id, seller_user_id")
        .eq("chat_id", chat_id)
        .single();

      if (chatError) {
        console.error("Error fetching chat details:", chatError.message);
        ctx.response.status = 500;
        ctx.response.body = {
          error: "Internal Server Error fetching chat details",
        };
        return;
      }

      if (!chatDetails) {
        console.error("Chat not found for ID:", chat_id);
        ctx.response.status = 404;
        ctx.response.body = { error: "Chat not found" };
        return;
      }

      const { data: buyer, error: buyerError } = await db
        .from("users")
        .select("username, avatar_url")
        .eq("ucid", chatDetails.buyer_user_id)
        .single();

      const { data: seller, error: sellerError } = await db
        .from("users")
        .select("username, avatar_url")
        .eq("ucid", chatDetails.seller_user_id)
        .single();

      if (buyerError || sellerError) {
        ctx.response.status = 404;
        ctx.response.body = {
          message: "Users not found",
          buyerError,
          sellerError,
        };
        return;
      }

      const { data: messages, error: messagesError } = await db
        .from("message")
        .select("*")
        .eq("chat_id", chat_id)
        .order("message_datetime", { ascending: true });

      if (messagesError) {
        console.error("Error fetching messages:", messagesError.message);
        ctx.response.status = 500;
        ctx.response.body = {
          error: "Internal Server Error fetching messages",
        };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = {
        chat_id: chatDetails.chat_id,
        buyer_user_id: chatDetails.buyer_user_id,
        buyer_username: buyer.username,
        buyer_avatar_url: buyer.avatar_url,
        seller_id: chatDetails.seller_user_id,
        seller_username: seller.username,
        seller_avatar_url: seller.avatar_url,
        messages,
      };
    } catch (error) {
      console.error("Error in getChat middleware:", error);
      ctx.response.status = 500;
      ctx.response.body = { error: "Internal Server Error in getChat" };
    }
  }

  async getChats(ctx: Context) {
    try {
      let user = null;
      try {
        user = await getUserInfoFromAuthHeader(ctx.request.headers);
      } catch (_) {
        ctx.response.status = 401;
        ctx.response.body = { message: "Invalid token" };
        return;
      }
      if (!user) {
        ctx.response.status = 401;
        ctx.response.body = {
          message: "Authorization header missing or invalid",
        };
        return;
      }
      const { ucid } = user;

      const { data: chats, error: chatsError } = await db
        .from("chat")
        .select("chat_id, buyer_user_id, seller_user_id")
        .or(`buyer_user_id.eq.${ucid},seller_user_id.eq.${ucid}`);

      if (chatsError) {
        console.error("Error fetching chats:", chatsError);
        ctx.response.status = 500;
        ctx.response.body = { error: "Internal Server Error fetching chats" };
        return;
      }

      if (chats.length === 0) {
        ctx.response.status = 200;
        ctx.response.body = [];
        return;
      }

      const { data: buyerUsernames, error: buyerError } = await db
        .from("users")
        .select("username, avatar_url, ucid")
        .in(
          "ucid",
          chats.map((chat) => chat.buyer_user_id),
        );

      const { data: sellerUsernames, error: sellerError } = await db
        .from("users")
        .select("username, avatar_url, ucid")
        .in(
          "ucid",
          chats.map((chat) => chat.seller_user_id),
        );

      if (buyerError || sellerError) {
        console.error("Error fetching usernames:", buyerError || sellerError);
        ctx.response.status = 500;
        ctx.response.body = { error: "Error in fetching usernames" };
        return;
      }

      if (!Array.isArray(buyerUsernames) || !Array.isArray(sellerUsernames)) {
        console.error("Buyer or seller usernames are not arrays.");
        ctx.response.status = 500;
        ctx.response.body = { error: "Invalid data format for usernames" };
        return;
      }

      const { data: lastMessages, error: lastMessagesError } = await db
        .from("message")
        .select("*")
        .in(
          "chat_id",
          chats.map((chat) => chat.chat_id),
        )
        .order("message_datetime", { ascending: false })
        .limit(1);

      if (lastMessagesError) {
        console.error("Error fetching last messages:", lastMessagesError);
        ctx.response.status = 500;
        ctx.response.body = {
          error: "Internal Server Error fetching last messages",
        };
        return;
      }

      const responseChats = chats.map((chat) => {
        const buyer = buyerUsernames.find(
          (user) => user.ucid === chat.buyer_user_id,
        );
        const seller = sellerUsernames.find(
          (user) => user.ucid === chat.seller_user_id,
        );

        const lastMessage = lastMessages.find(
          (msg) => msg.chat_id === chat.chat_id,
        );

        return {
          ...chat,
          buyer_username: buyer ? buyer.username : null,
          buyer_avatar_url: buyer ? buyer.avatar_url : null,
          seller_username: seller ? seller.username : null,
          seller_avatar_url: seller ? seller.avatar_url : null,
          last_message: lastMessage
            ? {
                message_text: lastMessage.message_text,
                sender_user_id: lastMessage.sender_user_id,
                message_datetime: lastMessage.message_datetime,
              }
            : null,
        };
      });

      ctx.response.status = 200;
      ctx.response.body = responseChats;
    } catch (error) {
      console.error("Error in getChats:", error);
      ctx.response.status = 500;
      ctx.response.body = { error: "Internal Server Error in getChats" };
    }
  }

  async sendMessage(ctx: Context) {
    const { chat_id, sender_user_id, message_text } =
      await ctx.request.body.json();

    if (!message_text || !sender_user_id) {
      ctx.response.status = 400;
      ctx.response.body = {
        error: "Message content and sender ID are required",
      };
      return;
    }

    try {
      const { data: chatData, error: chatError } = await db
        .from("chat")
        .select("buyer_user_id, seller_user_id")
        .eq("chat_id", chat_id)
        .single();

      if (chatError) {
        console.error("Error retrieving chat data:", chatError.message);
        ctx.response.status = 500;
        ctx.response.body = { error: "Failed to retrieve chat information" };
        return;
      }

      const receiver_user_id =
        chatData.buyer_user_id === sender_user_id
          ? chatData.seller_user_id
          : chatData.buyer_user_id;

      const { data: senderData, error: senderError } = await db
        .from("users")
        .select("username")
        .eq("ucid", sender_user_id)
        .single();

      if (senderError || !senderData) {
        console.error(
          "Error retrieving sender username:",
          senderError ? senderError.message : "User not found",
        );
        ctx.response.status = 500;
        ctx.response.body = { error: "Failed to retrieve sender username" };
        return;
      }

      const { data: receiverData, error: receiverError } = await db
        .from("users")
        .select("username")
        .eq("ucid", receiver_user_id)
        .single();

      if (receiverError || !receiverData) {
        console.error(
          "Error retrieving receiver username:",
          receiverError ? receiverError.message : "User not found",
        );
        ctx.response.status = 500;
        ctx.response.body = { error: "Failed to retrieve receiver username" };
        return;
      }

      const { data: messageResult, error: insertError } = await db
        .from("message")
        .insert([
          {
            chat_id,
            sender_user_id,
            message_text,
            message_datetime: new Date(),
          },
        ])
        .single();

      if (insertError) {
        console.error("Error inserting message:", insertError.message);
        ctx.response.status = 500;
        ctx.response.body = { error: "Failed to send message" };
        return;
      }

      const { error: notificationError } = await db
        .from("notifications")
        .insert([
          {
            user_id: receiver_user_id,
            message: `You have a new message from ${senderData.username}`,
            type: "chat",
            link: `/chat/${chat_id}`,
            timestamp: new Date(),
            is_read: false,
          },
        ]);

      if (notificationError) {
        console.error(
          "Error inserting notification:",
          notificationError.message,
        );
        ctx.response.status = 500;
        ctx.response.body = { error: "Failed to send notification" };
        return;
      }

      ctx.response.status = 201;
      ctx.response.body = {
        message:
          "Message sent successfully, and notification created for receiver",
        data: messageResult,
      };
    } catch (error) {
      console.error("Error sending message:", error);
      ctx.response.status = 500;
      ctx.response.body = { error: "Failed to send message" };
    }
  }
}
