import { AlertTriangle, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Page404() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-8">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="flex justify-center mb-6">
          <AlertTriangle
            className="text-red-500"
            size={100}
            strokeWidth={1.5}
          />
        </div>

        <h1 className="text-4xl font-bold text-gray-800">
          Oops! Page Not Found
        </h1>

        <p className="text-gray-600 text-lg">
          The page you're looking for seems to have gone on an unexpected
          shopping trip.
        </p>

        <div className="flex justify-center">
          <button
            onClick={() => navigate("/")}
            className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded hover:bg-gray-700 transition-colors duration-300"
          >
            <Home size={20} />
            <span>Go Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Page404;
