import {
  useContext,
  createContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface JWTPayload {
  username: string;
  ucid: string;
}

interface AuthContextType {
  username: string | null;
  ucid: string | null;
  token: string | null;
  login: (username: string, password: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsername] = useState<string | null>(null);
  const [ucid, setUcid] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedToken = localStorage.getItem("jwtToken");

    if (savedToken) {
      const decodedToken = jwtDecode(savedToken) as JWTPayload;
      setToken(savedToken);
      setUsername(decodedToken.username);
      setUcid(decodedToken.ucid);
    }
  }, []);

  const login = async (
    username: string,
    password: string,
    setError: (error: string) => void,
  ) => {
    try {
      const response = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const res = await response.json();

      if (response.ok) {
        const decodedToken = jwtDecode(res.token) as JWTPayload;
        setToken(res.token);
        setUsername(decodedToken.username);
        setUcid(decodedToken.ucid);

        localStorage.setItem("jwtToken", res.token);

        navigate("/");
      } else {
        setError(res.message);
      }
    } catch (_) {
      setError("An error occurred during login. Please try again.");
    }
  };

  const logout = () => {
    setUsername(null);
    setUcid(null);
    setToken(null);

    localStorage.removeItem("jwtToken");
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ username, ucid, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
