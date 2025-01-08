import { useState, ChangeEvent, FormEvent } from "react";
// @ts-ignore: path
import Logo from "../../assets/LogoDark.png";
import UCalgary from "/UCalgary.png";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/AuthContext.tsx";
import { ArrowLeft } from "lucide-react";

interface FormData {
  username: string;
  password: string;
}

function LoginForm() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData: FormData) => ({ ...prevData, [name]: value }));
  };

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    auth.login(formData.username, formData.password, setError);
  };

  return (
    <form
      onSubmit={handleLogin}
      className="flex flex-col md:flex-row h-screen bg-gray-50"
    >
      <div className="md:w-3/5 md:block hidden relative">
        <img className="h-full object-cover" src={UCalgary} alt="Ucalgary" />
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
          <img className="h-80 w-80" src={Logo} alt="Logo" />
        </div>
      </div>
      <div className="md:w-2/5 flex flex-col items-center md:justify-center relative">
        <Link
          to="/"
          className="absolute top-0 left-4 mt-4 ml-4 md:ml-0 text-gray-600 hover:text-gray-900 inline-flex items-center transition-colors"
        >
          <ArrowLeft className="mr-2 w-5 h-5" />
          Back to Listings
        </Link>
        <h1 className="text-3xl md:mb-8 mb-4 font-bold md:mt-0 mt-12">
          Welcome back!
        </h1>
        <img className="h-40 w-40 md:hidden" src={Logo} alt="Logo" />
        {[
          { label: "Username", name: "username", type: "text" },
          { label: "Password", name: "password", type: "password" },
        ].map(({ label, name, type }) => (
          <div key={name} className="mt-8 flex flex-col md:w-72">
            <label htmlFor={name}>{label}:</label>
            <input
              className="mt-2 w-full px-3 py-2 border rounded-lg"
              type={type}
              name={name}
              value={formData[name as keyof FormData]}
              onChange={handleChange}
              required
            />
          </div>
        ))}
        {error && (
          <div className="mt-4 text-red-500 text-sm text-center">{error}</div>
        )}
        <button
          type="submit"
          className="bg-[#E32A27] text-white font-bold rounded-xl mt-8 h-12 w-52 drop-shadow-lg transition-all duration-200 hover:bg-[#cb2522]"
        >
          Log In
        </button>
        <p className="mt-6 text-center">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/auth/register")}
            className="text-[#FFB929] cursor-pointer"
          >
            Register here
          </span>
        </p>
      </div>
    </form>
  );
}

export default LoginForm;
