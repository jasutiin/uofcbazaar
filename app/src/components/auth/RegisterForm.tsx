import { useState, ChangeEvent, FormEvent } from "react";
// @ts-ignore: path
import Logo from "../../assets/LogoDark.png";
import UCalgary from "/UCalgary.png";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    username: "",
    ucid: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData: FormData) => ({ ...prevData, [name]: value }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (formData.ucid.length != 8) {
      setError("UCID must be 8 digits");
      return false;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@ucalgary\.ca$/;

    if (!emailRegex.test(formData.email)) {
      setError("Email address must be a valid UofC email address");
      return false;
    }
    return true;
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch(`/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          ucid: formData.ucid,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        navigate("/auth/login");
      } else {
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (_) {
      setError("An error occurred during registration. Please try again.");
    }
  };

  return (
    <form
      className="flex flex-col md:flex-row h-screen bg-gray-50 overflow-auto pb-4 md:pb-0"
      onSubmit={handleRegister}
    >
      <div className="md:w-3/5 md:block hidden relative">
        <img className="h-full object-cover" src={UCalgary} alt="Ucalgary" />
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
          <img className="h-80 w-80" src={Logo} alt="Logo" />
        </div>
      </div>
      <div className="md:w-2/5 relative flex flex-col items-center md:justify-center">
        <Link
          to="/"
          className="absolute top-0 left-4 mt-4 ml-4 md:ml-0 text-gray-600 hover:text-gray-900 inline-flex items-center transition-colors"
        >
          <ArrowLeft className="mr-2 w-5 h-5" />
          Back to Listings
        </Link>
        <h1 className="text-3xl md:mb-8 mb-2 font-bold md:mt-0 mt-12">
          Create Your Account
        </h1>
        <img className="h-40 w-40 md:hidden" src={Logo} alt="Logo" />
        {[
          { label: "Username", name: "username", type: "text" },
          { label: "UCID", name: "ucid", type: "number" },
          { label: "Email", name: "email", type: "email" },
          { label: "Password", name: "password", type: "password" },
          {
            label: "Confirm Password",
            name: "confirmPassword",
            type: "password",
          },
        ].map(({ label, name, type }) => (
          <div key={name} className="mt-4 flex flex-col md:w-72">
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
          Register
        </button>
        <p className="mt-6 text-center">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/auth/login")}
            className="text-[#FFB929] cursor-pointer"
          >
            Login here
          </span>
        </p>
      </div>
    </form>
  );
}

export default RegisterPage;
