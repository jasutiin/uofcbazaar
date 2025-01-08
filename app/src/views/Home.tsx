import { useState, useEffect, useCallback } from "react";
import SearchBar from "../components/Searchbar.tsx";
import ListingCard from "../components/ListingCard.tsx";
import {
  Heart,
  Menu,
  BookText,
  Armchair,
  Plug,
  Shirt,
  CarFront,
  House,
  FileText,
  Users,
  X,
  ChevronsDown,
} from "lucide-react";
import { useAuth } from "../hooks/AuthContext.tsx";

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

type PriceRange = {
  min: string;
  max: string;
};

const Home = () => {
  const [query, setQuery] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<PriceRange>({
    min: "",
    max: "",
  });
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const auth = useAuth();

  const fetchListings = useCallback(
    async (currentPage: number) => {
      try {
        const params = new URLSearchParams();

        if (selectedCategories.length > 0) {
          selectedCategories.forEach((category: string) => {
            params.append("categories", category);
          });
        }

        if (priceRange.min) {
          params.append("minPrice", priceRange.min);
        }
        if (priceRange.max) {
          params.append("maxPrice", priceRange.max);
        }

        const pageSize = 10;
        params.append("page", currentPage.toString());
        params.append("pageSize", pageSize.toString());

        const headers = auth?.token
          ? { Authorization: `Bearer ${auth.token}` }
          : {};

        const url = `/api/listings?${params.toString()}`;
        const response = await fetch(url, {
          method: "GET",
          headers,
        });
        if (!response.ok) throw new Error("Failed to fetch listings");
        const data = await response.json();

        const newListings = data.listings || [];

        // If any page has fewer than 10 listings, prob no more listings to fetch
        setHasMore(newListings.length === pageSize);

        setListings((prevListings: Listing[]) =>
          currentPage === 1 ? newListings : [...prevListings, ...newListings],
        );
      } catch (err) {
        // @ts-ignore: type
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [selectedCategories, priceRange, auth],
  );

  useEffect(() => {
    // Reset page and fetch listings when filters change
    setPage(1);
    fetchListings(1);
  }, [selectedCategories, priceRange, fetchListings]);

  const loadMoreListings = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchListings(nextPage);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev: string[]) =>
      prev.includes(category)
        ? prev.filter((cat) => cat != category)
        : [...prev, category],
    );
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minValue = e.target.value;
    setPriceRange((prev: PriceRange) => {
      if (Number(minValue) > Number(prev.max) && prev.max !== "") {
        setError("Min price must be less than Max price.");
      } else {
        setError("");
      }
      return { ...prev, min: minValue };
    });
  };

  const handleSearchResults = (results: Listing[]) => {
    setListings(results);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maxValue = e.target.value;
    setPriceRange((prev: PriceRange) => {
      if (Number(maxValue) < Number(prev.min) && prev.min !== "") {
        setError("Max price must be greater than Min price.");
      } else {
        setError("");
      }
      return { ...prev, max: maxValue };
    });
  };

  const categories = [
    ...(auth?.token
      ? [
          {
            label: "Following",
            icon: <Heart />,
          },
        ]
      : []),
    {
      label: "Books",
      icon: <BookText />,
    },
    {
      label: "Furniture",
      icon: <Armchair />,
    },
    {
      label: "Electronics",
      icon: <Plug />,
    },
    {
      label: "Clothing",
      icon: <Shirt />,
    },
    {
      label: "Vehicles",
      icon: <CarFront />,
    },
    {
      label: "Housing",
      icon: <House />,
    },
    {
      label: "Course Materials",
      icon: <FileText />,
    },
    {
      label: "Tutor Services",
      icon: <Users />,
    },
  ];

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setPriceRange({ min: "", max: "" });
  };

  const hasActiveFilters =
    selectedCategories.length > 0 || priceRange.min || priceRange.max;

  const ActiveFilters = () => {
    if (!hasActiveFilters) return null;

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category: string) => (
              <span
                key={category}
                className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm"
              >
                {category}
                <button
                  onClick={() => toggleCategory(category)}
                  className="ml-2 text-gray-500 hover:text-gray-700 flex items-center"
                >
                  <X className="text-black w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        )}
        {(priceRange.min || priceRange.max) && (
          <span className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm">
            Price: {priceRange.min || "0"} - {priceRange.max || "∞"}
            <button
              onClick={() => setPriceRange({ min: "", max: "" })}
              className="ml-2 text-gray-500 hover:text-gray-700 flex items-center"
            >
              <X className="text-black w-4 h-4" />
            </button>
          </span>
        )}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear all
          </button>
        )}
      </div>
    );
  };

  const FiltersContent = () => (
    <>
      <SearchBar
        query={query}
        setQuery={setQuery}
        onSearchResults={handleSearchResults}
      />
      <div className="space-y-2 mt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Categories</h2>
          {selectedCategories.length > 0 && (
            <button
              onClick={() => setSelectedCategories([])}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear
            </button>
          )}
        </div>
        {categories.map((category) => (
          <button
            key={category.label}
            onClick={() => {
              toggleCategory(category.label);
              setIsFilterOpen(false);
            }}
            className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 hover:bg-gray-100 transition-colors ${
              selectedCategories.includes(category.label) ? "bg-gray-100" : ""
            }`}
          >
            <span className="text-xl">{category.icon}</span>
            <span className="text-gray-700">{category.label}</span>
          </button>
        ))}
      </div>
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Price Range</h2>
          {(priceRange.min || priceRange.max) && (
            <button
              onClick={() => setPriceRange({ min: "", max: "" })}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#E32A27] rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-500 font-medium">Loading listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col lg:flex-row overflow-hidden">
      <div className="lg:hidden bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">UofCBazaar</h1>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700"
          >
            {isFilterOpen ? (
              <div className="flex items-center">
                <X className="text-black w-5 h-5" />
                Close
              </div>
            ) : (
              <div className="flex items-center">
                <Menu className="text-black w-5 h-5 mr-2" />
                Filters
              </div>
            )}
          </button>
        </div>
        {hasActiveFilters && <ActiveFilters />}
      </div>

      <div
        className={`lg:hidden fixed inset-0 bg-white z-50 transition-transform duration-300 transform ${
          isFilterOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="p-4 h-full overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Filters</h2>
            <button
              onClick={() => setIsFilterOpen(false)}
              className="text-gray-500 text-xl"
            >
              <X className="text-black w-6 h-6" />
            </button>
          </div>
          <FiltersContent />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={handleMinChange}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={handleMaxChange}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="hidden lg:block w-80 bg-white p-4 border-r border-gray-200 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">UofCBazaar</h1>
        <FiltersContent />
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceRange.min}
            onChange={handleMinChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={handleMaxChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            <div className="hidden lg:block mb-6">
              <ActiveFilters />
            </div>
            {error ? (
              <div className="text-red-500 text-center py-8">{error}</div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  {listings.map((listing: Listing) => (
                    <ListingCard key={listing.listing_id} listing={listing} />
                  ))}
                </div>

                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={loadMoreListings}
                      disabled={loading}
                      className="flex items-center px-6 py-3 bg-[#E32A27] text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        "Loading..."
                      ) : (
                        <>
                          <ChevronsDown className="mr-2" />
                          Load More Listings
                        </>
                      )}
                    </button>
                  </div>
                )}

                {!hasMore && listings.length > 0 && (
                  <div className="text-center text-gray-500 mt-8">
                    No more listings to load
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
