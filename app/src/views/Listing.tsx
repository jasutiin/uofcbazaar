import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import DefaultPfp from "/default-pfp.png";
import Carousel from "../components/Carousel.tsx";
import { useChat } from "../hooks/ChatContext.tsx";
import { useAuth } from "../hooks/AuthContext.tsx";
import { MessageCircle, Heart, ArrowLeft, Pencil } from "lucide-react";
import LoginModal from "../components/LoginModal.tsx";

function Listing() {
  const { id } = useParams();
  const auth = useAuth();
  const chat = useChat();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`/api/listings/${id}`);
        if (!response.ok) throw new Error("Failed to fetch listing details");
        const data = await response.json();
        setListing(data.listing);

        if (auth.token) {
          const response1 = await fetch(`/api/listings/${id}/follow`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          });
          if (!response1.ok) throw new Error("Failed to fetch follow");
          const data1 = await response1.json();
          setIsLiked(data1.follow);
        }
      } catch (err) {
        // @ts-ignore: type
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id, auth.token]);

  const handleInitiateChat = async () => {
    if (!auth.token) {
      setIsLoginModalOpen(true);
      return;
    }

    try {
      const response = await fetch("/api/chat/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          seller_username: listing.seller.username,
          buyer_username: auth.username,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create or fetch chat");
      }

      const chatData = await response.json();

      chat.selectChat(chatData.chat_id);
      chat.fetchChats();

      navigate("/chat/:id");
    } catch (error) {
      console.error("Error initiating chat:", error);
    }
  };

  const handleLike = async () => {
    if (!auth.token) {
      setIsLoginModalOpen(true);
      return;
    }

    try {
      const response = await fetch(`/api/listings/${id}/follow`, {
        method: isLiked ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update follow status.");
      }
      setIsLiked(!isLiked);
    } catch (err) {
      // @ts-ignore: type
      setError(err.message);
    }
  };

  const handleLoginRedirect = () => {
    setIsLoginModalOpen(false);
    navigate("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#E32A27] rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-500 font-medium">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 text-2xl mb-4">
            Oops! Something went wrong.
          </p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col h-full overflow-auto">
        <div className="container mx-auto flex-grow py-6 px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-center mb-6">
            <Link
              to="/"
              className="inline-flex items-center mr-auto text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="mr-2 w-5 h-5" />
              Back to Listings
            </Link>

            {listing.user_id === auth.ucid && (
              <Link
                to={`/listing/${id}/edit`}
                className="inline-flex items-center justify-end rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 transition-colors"
              >
                <Pencil className="mr-1 w-5 h-5" />
                Edit Listing
              </Link>
            )}
          </div>

          <div className="relative grid md:grid-cols-2 gap-6 lg:gap-8 bg-white rounded-xl md:rounded-2xl shadow-lg">
            <div className="w-full h-full">
              <Carousel images={listing.images} />
            </div>

            <div className="p-4 pt-0 md:p-6 flex flex-col justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2 md:mb-4">
                  {listing.title}
                </h1>
                <p className="text-3xl font-semibold text-red-600 mb-4 md:mb-6">
                  ${parseInt(listing.price).toFixed(2)}
                </p>

                <div className="mb-4 md:mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Description
                  </h2>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {listing.description}
                  </p>
                </div>
              </div>

              <div className="bg-gray-100 rounded-xl p-3 md:p-4 flex items-center">
                <img
                  src={listing.seller.avatar_url || DefaultPfp}
                  alt={listing.seller.username}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full mr-3 md:mr-4 object-cover"
                />

                <div className="flex-grow">
                  <Link
                    to={`/profile/${listing.seller.username}`}
                    className="text-base md:text-lg font-medium text-gray-900 hover:text-red-600 transition-colors"
                  >
                    {listing.seller.username}
                  </Link>
                  <p className="text-xs md:text-sm text-gray-500">Seller</p>
                </div>

                <div className="flex space-x-2 md:space-x-4">
                  <button
                    onClick={handleLike}
                    className={`p-1.5 md:p-2 rounded-full transition-colors ${
                      isLiked
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-200 text-gray-600 hover:bg-red-100 hover:text-red-600"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${isLiked ? "" : "text-black"}`}
                      fill={isLiked ? "#E32A27" : "none"}
                    />
                  </button>

                  <div
                    className="p-1.5 md:p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors cursor-pointer"
                    onClick={handleInitiateChat}
                  >
                    <MessageCircle className="w-5 h-5 text-black" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLoginRedirect}
      />
    </>
  );
}

export default Listing;
