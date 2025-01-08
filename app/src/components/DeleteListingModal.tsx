import { useState } from "react";
import { Trash2, X } from "lucide-react";

interface DeleteListingModalProps {
  listingId: number;
  onDelete: (listingId: number) => Promise<void>;
}

function DeleteListingModal({ listingId, onDelete }: DeleteListingModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenModal = () => setIsOpen(true);
  const handleCloseModal = () => setIsOpen(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await onDelete(listingId);
      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={handleOpenModal}
        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 transition-colors"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 p-6 relative">
        <button
          onClick={handleCloseModal}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Delete Listing
        </h2>

        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this listing? This action cannot be
          undone and will permanently remove the listing.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={handleCloseModal}
            disabled={isDeleting}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`
              px-4 py-2 rounded-lg text-white transition-colors
              ${
                isDeleting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }
            `}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteListingModal;
