import DefaultPfp from "/default-pfp.png";
import { Link } from "react-router-dom";

interface Props {
  listing: {
    listing_id: number;
    title: string;
    price: number;
    description: string;
    images: { url: string }[];
    seller: {
      username: string;
      avatar_url: string | null;
    };
  };
}

function ListingCard({ listing }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
      <Link to={`/listings/${listing.listing_id}`}>
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
          {listing.images && listing.images.length > 0 ? (
            <img
              src={listing.images[0].url}
              alt={listing.title}
              className="object-cover w-full h-48"
            />
          ) : (
            <div className="flex items-center justify-center h-48 bg-gray-100">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {listing.title}
          </h3>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            ${listing.price.toFixed(2)}
          </p>
          <p className="mt-1 text-sm text-gray-500 truncate">
            {listing.description}
          </p>
        </div>
      </Link>
      <div className="p-4 pt-0 flex items-center">
        {listing.seller.avatar_url ? (
          <img
            src={listing.seller.avatar_url}
            alt={""}
            className="h-6 w-6 rounded-full"
          />
        ) : (
          <img src={DefaultPfp} alt={""} className="h-6 w-6 rounded-full" />
        )}
        <Link
          to={`/profile/${listing.seller.username}`}
          className="ml-2 text-sm font-semibold text-gray-700 hover:underline transition duration-300"
        >
          {listing.seller.username}
        </Link>
      </div>
    </div>
  );
}
export default ListingCard;
