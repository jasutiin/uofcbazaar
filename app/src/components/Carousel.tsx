import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  images: [
    {
      url: string;
      filename: string;
    },
  ];
}

const Carousel = ({ images }: Props) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex: number) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex: number) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1,
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (!images) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-200">
        <p className="text-gray-600">No images available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-square overflow-hidden rounded-xl group">
      <div className="relative w-full h-full">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute top-0 left-0 w-full h-full transition-all duration-500 ease-in-out ${
              index === currentImageIndex
                ? "opacity-100 translate-x-0"
                : index < currentImageIndex
                  ? "opacity-0 -translate-x-full"
                  : "opacity-0 translate-x-full"
            }`}
          >
            <img
              src={image.url}
              alt={`Listing image ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 
            bg-black/70 hover:bg-black/60 rounded-full p-2 
            transition-all duration-300 z-10"
          >
            <ChevronLeft className="text-white" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 
            bg-black/70 hover:bg-black/60 rounded-full p-2 
            transition-all duration-300 z-10"
          >
            <ChevronRight className="text-white" />
          </button>
        </>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {images.map((_, index: number) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 cursor-pointer ${
                index === currentImageIndex ? "bg-red-500" : "bg-black/70"
              }`}
              onClick={() => goToImage(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;
