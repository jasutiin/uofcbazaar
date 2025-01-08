import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/AuthContext.tsx";
// @ts-ignore: path
import Logo from "../assets/LogoDark.png";
import { Menu, CircleUser, BellDot, Bell, X } from "lucide-react";
import { useNotif } from "../hooks/NotificationContext.tsx";

interface Props {
  onNotifClick: () => void;
}

function Navbar({ onNotifClick }: Props) {
  const notif = useNotif();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef(null);
  const auth = useAuth();
  const location = useLocation();

  const navItems = auth.token
    ? [
        { name: "Home", to: "/" },
        { name: "Sell", to: "/sell" },
        { name: "Chat", to: "/chat" },
        { name: "Campus Map", to: "/map" },
      ]
    : [
        { name: "Home", to: "/" },
        { name: "Campus Map", to: "/map" },
      ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    auth.logout();
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
  };

  const handleNotificationClick = () => {
    notif.setHasNotif(false);
    onNotifClick();
  };

  return (
    <nav className="mx-3">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img className="h-27 w-28" src={Logo} alt="Logo" />
        </Link>

        <div className="hidden md:flex flex-grow justify-center">
          {navItems.map((item) => (
            <Link
              key={item.name}
              className={`inline-block text-black text-lg mx-3 transition duration-300 ${
                location.pathname === item.to
                  ? "text-red-600"
                  : "hover:text-orange-400"
              }`}
              to={item.to}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center">
          <div className="hidden md:flex items-center space-x-4">
            {auth.token ? (
              <>
                <button
                  onClick={handleNotificationClick}
                  className="relative hover:text-orange-400 transition duration-300"
                >
                  {notif.hasNotifications ? (
                    <BellDot className="text-red-500" />
                  ) : (
                    <Bell />
                  )}
                  {notif.hasNotifications && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                      1
                    </span>
                  )}
                </button>

                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center hover:text-orange-400 transition duration-300"
                  >
                    <CircleUser />
                    <h2 className="ml-2">{auth.username}</h2>
                  </button>
                  {isDropdownOpen && (
                    <div
                      ref={dropdownRef}
                      className="absolute right-0 top-full mt-2 w-48 bg-white shadow-lg rounded-lg z-10"
                    >
                      <Link
                        to={`/profile/${auth.username}`}
                        className="block px-3 py-2 text-black hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => auth.logout()}
                        className="block px-3 py-2 text-black hover:bg-gray-100 w-full text-left"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/auth/login"
                className="text-lg hover:text-orange-400 transition duration-300"
              >
                Login
              </Link>
            )}
          </div>

          <div className="flex md:hidden items-center">
            {auth.token && (
              <button
                onClick={handleNotificationClick}
                className="relative hover:text-orange-400 transition duration-300 mr-2"
              >
                {notif.hasNotifications ? (
                  <BellDot className="text-red-500" />
                ) : (
                  <Bell />
                )}
                {notif.hasNotifications && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                    1
                  </span>
                )}
              </button>
            )}

            <button
              className="flex items-center ml-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu />
            </button>
          </div>
        </div>
      </div>

      <div className="h-0.5 -mt-6 bg-red-600"></div>
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-[100] transform transition-transform duration-300 ease-in-out 
          ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-4">
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-black hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                className={`block px-4 py-2 rounded-lg text-gray-700 
                  ${
                    location.pathname === item.to
                      ? "bg-red-50"
                      : "hover:bg-gray-100"
                  } 
                  transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            {auth.token ? (
              <>
                <Link
                  to={`/profile/${auth.username}`}
                  className={`block px-4 py-2 rounded-lg text-gray-700 
                  ${
                    location.pathname === `/profile/${auth.username}`
                      ? "bg-red-50"
                      : "hover:bg-gray-100"
                  } 
                  transition-colors`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/auth/login"
                className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
