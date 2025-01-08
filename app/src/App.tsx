import { useState } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Outlet,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./hooks/AuthContext.tsx";
import { ChatProvider } from "./hooks/ChatContext.tsx";
import { NotificationProvider } from "./hooks/NotificationContext.tsx";

import Navbar from "./components/Navbar.tsx";
import Home from "./views/Home.tsx";
import Sell from "./views/Sell.tsx";
import Auth from "./views/Auth.tsx";
import Profile from "./views/Profile.tsx";
import Chat from "./views/Chat.tsx";
import Listing from "./views/Listing.tsx";
import MapEmbed from "./views/Map.tsx";
import EditListingForm from "./views/EditListingForm.tsx";
import Notifications from "./views/Notifications.tsx";
import ChatPage from "./components/chat/ChatPage.tsx";
import Page404 from "./views/404Page.tsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="/auth/*" element={<Auth />} />
      <Route path="/listings/:id" element={<Listing />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/profile/:username" element={<Profile />} />
      <Route path="/sell" element={<Sell />} />
      <Route path="/chat" element={<Chat />}>
        <Route path=":id" element={<ChatPage />} />
      </Route>
      <Route path="/map" element={<MapEmbed />} />
      <Route path="/listing/:id/edit" element={<EditListingForm />} />
      <Route path="*" element={<Page404 />} />
    </Route>,
  ),
);

function Layout() {
  const location = useLocation();
  const [isNotificationSidebarOpen, setIsNotificationSidebarOpen] =
    useState<boolean>(false);

  const isAuthRoute = location.pathname.startsWith("/auth");
  return (
    <AuthProvider>
      <ChatProvider>
        <NotificationProvider>
          <div className="h-screen max-h-screen flex flex-col overflow-hidden relative">
            {!isAuthRoute && (
              <>
                <div className="flex-none">
                  <Navbar
                    onNotifClick={() =>
                      setIsNotificationSidebarOpen(!isNotificationSidebarOpen)
                    }
                  />
                </div>
                <Notifications
                  isOpen={isNotificationSidebarOpen}
                  onClose={() => setIsNotificationSidebarOpen(false)}
                />
              </>
            )}
            <div className="flex-1 overflow-hidden">
              <Outlet />
            </div>
          </div>
        </NotificationProvider>
      </ChatProvider>
    </AuthProvider>
  );
}

function App() {
  return <RouterProvider router={router} />;
}

export default App;
