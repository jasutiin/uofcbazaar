import React, { useState, useRef } from "react";
import { ImagePlus, Trash2 } from "lucide-react";

interface Props {
  token: string;
}

function UploadForm({ token }: Props) {
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      alert(
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

    // Validation
    if (formData.files.length === 0) {
      alert("Please upload at least one image");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("price", formData.price);
    data.append("description", formData.description);
    data.append("category", formData.category);

    formData.files.forEach((file) => data.append("files", file));

    try {
      setIsUploading(true);
      const response = await fetch(`/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        const errorText = await response.text();
        alert(`Failed to upload product: ${errorText}`);
      }
    } catch (error) {
      console.error("Error uploading product:", error);
      alert("An unexpected error occurred");
    } finally {
      setIsUploading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <h1 className="text-2xl font-bold text-green-800">
          Product Uploaded Successfully!
        </h1>
        <p className="text-green-600 mt-2">
          Your item is now live on the marketplace
        </p>
      </div>
    );
  }

  return (
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
              Uploading...
            </>
          ) : (
            "Upload Product"
          )}
        </button>
      </form>
    </div>
  );
}

export default UploadForm;
