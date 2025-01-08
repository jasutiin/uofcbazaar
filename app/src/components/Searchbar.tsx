import { useRef, useState } from "react";
import { Search, X } from "lucide-react";

type Listing = {
  listing_id: string;
  title: string;
  price: string;
  description: string;
  images: { url: string }[];
  seller: {
    username: string;
    avatar_url: string | null;
  };
};

interface SearchBarProps {
  query: string;
  setQuery: (query: string) => void;
  onSearchResults: (results: Listing[]) => void;
}

const SearchBar = ({ query, setQuery, onSearchResults }: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearchClick = async (searchQuery?: string) => {
    const inputValue = (
      searchQuery ||
      inputRef.current?.value.trim() ||
      ""
    ).trim();

    if (inputValue === "") {
      // If query is empty, fetch all listings
      try {
        const response = await fetch(`/api/listings`);
        if (!response.ok) {
          throw new Error("Failed to fetch listings");
        }
        const data = await response.json();
        onSearchResults(data.listings);
        setQuery("");
        return;
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred",
        );
        onSearchResults([]);
        return;
      }
    }

    setQuery(inputValue);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/search?query=${encodeURIComponent(inputValue)}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }

      const data = await response.json();
      onSearchResults(data.listings);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
      onSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      handleSearchClick();
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <Search
            className={`w-5 h-5 ${
              isLoading ? "text-gray-400 animate-pulse" : "text-gray-500"
            }`}
          />
        </div>

        <input
          ref={inputRef}
          type="text"
          placeholder="Looking for something specific?"
          defaultValue={query}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearchClick();
            }
          }}
          className="
            w-full 
            pl-12 
            pr-12 
            py-3 
            text-base 
            text-gray-900 
            bg-white 
            border 
            border-gray-300 
            rounded-full 
            focus:ring-2 
            focus:ring-red-500 
            focus:border-transparent
            transition-all
            duration-300
            ease-in-out
          "
        />

        {query && (
          <button
            onClick={clearSearch}
            className="
              absolute 
              right-4 
              top-1/2 
              -translate-y-1/2 
              text-gray-500 
              hover:text-gray-700
              transition-colors
              duration-200
            "
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {error && (
        <div className="text-red-500 text-sm mt-2 text-center">{error}</div>
      )}
    </div>
  );
};

export default SearchBar;
