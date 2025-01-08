import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ImagePlus, Trash2, Lock } from "lucide-react";
import { useAuth } from "../hooks/AuthContext.tsx";

function EditListingForm() {
  const auth = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    category: "",
    files: [] as File[],
  });
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [success, setSuccess] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`/api/listings/${id}`);
        if (!response.ok) throw new Error("Failed to fetch listing details");
        const data = await response.json();
        setFormData({
          title: data.listing.title,
          price: data.listing.price,
          description: data.listing.description,
          category: data.listing.category,
          files: [],
        });
        setPreviewImages(
          data.listing.images.map((img: { url: string }) => img.url),
        );
      } catch (err) {
        // @ts-ignore: type
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    const validImageTypes = ["image/jpeg", "image/png", "image/webp"];

    const validFiles = selectedFiles.filter((file) =>
      validImageTypes.includes(file.type),
    );

    if (validFiles.length !== selectedFiles.length) {
      setError(
        "Some files were not added. Only JPEG, PNG, and WebP images are allowed.",
      );
    }

    const updatedFiles = [...formData.files, ...validFiles];
    setFormData((prev) => ({ ...prev, files: updatedFiles }));

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setPreviewImages((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (indexToRemove: number) => {
    setPreviewImages((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.files.length === 0 && previewImages.length === 0) {
      setError("Please upload at least one image");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("price", formData.price);
    data.append("description", formData.description);
    data.append("category", formData.category);

    previewImages.forEach((imageUrl: string) => {
      data.append("existingImages", imageUrl);
    });

    formData.files.forEach((file) => data.append("files", file));

    try {
      setIsUploading(true);
      const response = await fetch(`/api/listings/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        body: data,
      });

      if (response.ok) {
        setSuccess(true);
        navigate(`/listings/${id}`);
      } else {
        const error = await response.json();
        // @ts-ignore: type
        setError(error.message);
      }
    } catch (_) {
      // @ts-ignore: type
      setError("An unexpected error occurred");
    } finally {
      setIsUploading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <h1 className="text-2xl font-bold text-green-800">
          Listing Updated Successfully!
        </h1>
        <p className="text-green-600 mt-2">
          Your item has been updated on the marketplace
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#E32A27] rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-500 font-medium">
            Loading listing information...
          </p>
        </div>
      </div>
    );
  }

  if (!auth.token)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <Lock className="mx-auto mb-4 text-red-500" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You must be logged in to edit listings.
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

  return (
    <div className="h-full overflow-auto md:pt-10">
      <div className="max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl w-full mx-auto p-6 bg-white rounded-lg shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
              {previewImages.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {previewImages.length < 10 && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gray-200 h-24 rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                >
                  <ImagePlus />
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-center text-gray-500 text-sm">
              Upload up to 10 images (JPEG, PNG, WebP)
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              name="title"
              placeholder="Product Title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              name="price"
              placeholder="Price"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <textarea
            name="description"
            placeholder="Detailed product description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Category</option>
            <option value="Books">Books</option>
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
            <option value="Clothing">Clothing</option>
            <option value="Vehicles">Vehicles</option>
            <option value="Housing">Housing</option>
            <option value="Course-materials">Course Materials</option>
            <option value="Tutor-services">Tutor Services</option>
          </select>

          <button
            type="submit"
            disabled={isUploading}
            className="w-full px-4 py-3 text-white bg-black rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isUploading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Updating...
              </>
            ) : (
              "Update Listing"
            )}
          </button>
          {error && <div className="text-red-500 text-center">{error}</div>}
        </form>
      </div>
    </div>
  );
}

export default EditListingForm;
