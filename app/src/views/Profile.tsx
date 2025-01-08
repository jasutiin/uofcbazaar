import { useEffect, useRef, ChangeEvent, useState } from "react";
import { useAuth } from "../hooks/AuthContext.tsx";
import { useParams, useNavigate } from "react-router-dom";
import DefaultPfp from "/default-pfp.png";
import ListingCard from "../components/ListingCard.tsx";
import { Pencil, Camera, Lock } from "lucide-react";
import DeleteListingModal from "../components/DeleteListingModal.tsx";

interface UserProfile {
  fullName: string;
  bio: string;
  avatar: string;
}

interface Listing {
  listing_id: number;
  title: string;
  price: number;
  description: string;
  images: { url: string }[];
  seller: {
    username: string;
    avatar_url: string | null;
  };
}

function Profile() {
  const { username } = useParams<{ username: string }>();
  const auth = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isSuccessful, setIsSuccessful] = useState<boolean>(false);
  const [profile, setProfile] = useState<UserProfile>({
    fullName: "",
    bio: "",
    avatar: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsProfileLoading(true);
      try {
        const response = await fetch(`/api/profile/${username}`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        setProfile(data);
        setError("");
      } catch (err) {
        // @ts-ignore: type
        setError(err.msg);
      }
    };

    if (!username) return;
    fetchProfile();
  }, [username, auth.token]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch(`/api/listings/user/${username}`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch listings");
        }

        const data = await response.json();
        setListings(data.listings);
        setError("");
      } catch (_) {
        setError("Failed to fetch listings");
      } finally {
        setIsProfileLoading(false);
      }
    };

    if (!username) return;
    fetchListings();
  }, [username, auth.token]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile((prev: UserProfile) => ({
        ...prev,
        avatar: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
    setIsSuccessful(false);
  };

  const handleUploadAvatar = async () => {
    if (!image) return;

    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("avatar", image);
    try {
      const response = await fetch("/api/profile/avatar", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload image");
      }
      setIsSuccessful(true);
    } catch (error) {
      // @ts-ignore: type
      setError(error.message);
      setImage(null);
      setProfile((prev: UserProfile) => ({
        ...prev,
        avatar: "",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setProfile((prev: UserProfile) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          fullName: profile.fullName,
          bio: profile.bio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save profile");
      }

      setIsSuccessful(true);
      setIsEditing(false);
    } catch (_) {
      setError("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteListing = async (listingId: number) => {
    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to delete listing:", errorData);
        if (response.status === 404) {
          // If the listing is not found, remove it from the state
          setListings((prevListings: Listing[]) => {
            const updatedListings = prevListings.filter(
              (listing) => listing.listing_id !== listingId,
            );
            return updatedListings;
          });
        }
        throw new Error(errorData.message || "Failed to delete listing");
      }

      // Remove the deleted listing from the state
      setListings((prevListings: Listing[]) => {
        const updatedListings = prevListings.filter(
          (listing) => listing.listing_id !== listingId,
        );
        return updatedListings;
      });
    } catch (err) {
      // @ts-ignore: type
      setError(err.message);
    }
  };

  if (!auth.token)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <Lock className="mx-auto mb-4 text-red-500" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You must be logged in to access the profile page.
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

  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#E32A27] rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-500 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="bg-white rounded-xl shadow-sm sm:shadow-lg overflow-hidden">
          {auth.username === username && !isEditing && (
            <div className="p-4 flex justify-end">
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 transition-colors"
              >
                <Pencil className="mr-1 w-5 h-5" />
                Edit Profile
              </button>
            </div>
          )}

          <div className="px-4 pb-6 sm:p-6">
            <div className="flex items-start flex-row gap-6">
              <div className="flex flex-col items-center">
                <div
                  className={`relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden border-2 border-gray-200 shadow-md
                    ${isEditing ? "cursor-pointer group" : ""}`}
                  onClick={isEditing ? handleImageClick : undefined}
                >
                  <img
                    className="w-full h-full object-cover"
                    src={profile.avatar || DefaultPfp}
                    alt="Profile"
                  />
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="text-[#E32A27] w-8 h-8" />
                    </div>
                  )}
                </div>

                <input
                  className="hidden"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />

                {isEditing && image && (
                  <button
                    onClick={handleUploadAvatar}
                    disabled={isLoading || isSuccessful}
                    className={`
                      mt-4 rounded-lg px-4 py-2 text-sm font-medium text-white w-full sm:w-auto
                      ${
                        isLoading || isSuccessful
                          ? "bg-gray-400"
                          : "bg-[#E32A27] hover:bg-[#cb2522] active:transform active:scale-95"
                      }
                    `}
                  >
                    {isLoading
                      ? "Uploading..."
                      : isSuccessful
                        ? "Uploaded!"
                        : "Upload Image"}
                  </button>
                )}
              </div>

              <div className="flex-1 w-full">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={profile.fullName}
                        onChange={handleProfileChange}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E32A27]/20"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={profile.bio}
                        onChange={handleProfileChange}
                        rows={4}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E32A27]/20 resize-none"
                        placeholder="Tell us about yourself"
                      />
                    </div>

                    {error && (
                      <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                        {error}
                      </div>
                    )}

                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className={`
                        w-full sm:w-auto px-6 py-2.5 rounded-lg font-medium text-white
                        ${
                          isSaving
                            ? "bg-gray-400"
                            : "bg-[#E32A27] hover:bg-[#cb2522] active:transform active:scale-95"
                        }
                      `}
                    >
                      {isSaving ? "Saving..." : "Save Profile"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 text-center sm:text-left">
                    <div>
                      <h2 className="text-sm font-medium text-gray-500">
                        Full Name
                      </h2>
                      <p className="text-lg font-semibold text-gray-900">
                        {profile.fullName || "No name set"}
                      </p>
                    </div>
                    <div>
                      <h2 className="text-sm font-medium text-gray-500">Bio</h2>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {profile.bio || "No bio yet"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm sm:shadow-lg p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              {auth.username !== username ? (
                <div>{username}'s Listings</div>
              ) : (
                <div>Your Listings</div>
              )}
            </h2>
            <span className="text-sm text-gray-500">
              {listings.length} {listings.length === 1 ? "item" : "items"}
            </span>
          </div>

          {listings.length === 0 ? (
            <p>No listings found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((listing: Listing) => (
                <div key={listing.listing_id} className="relative">
                  <ListingCard listing={listing} />
                  {auth.username === username && (
                    <DeleteListingModal
                      listingId={listing.listing_id}
                      onDelete={handleDeleteListing}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
