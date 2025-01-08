import UploadForm from "../components/UploadForm.tsx";
import { useAuth } from "../hooks/AuthContext.tsx";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Sell() {
  const auth = useAuth();
  const navigate = useNavigate();

  if (!auth.token)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <Lock className="mx-auto mb-4 text-red-500" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You must be logged in to access the sell page.
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
    <div className="bg-gray-50 h-full overflow-auto md:pt-10">
      <UploadForm token={auth.token} />
    </div>
  );
}

export default Sell;
