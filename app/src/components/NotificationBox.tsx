import { useNavigate } from "react-router-dom";
import { List, MessageCircle, X, Info, Trash2 } from "lucide-react";
import { Notif, Notification } from "../types/notif.ts";

interface Props {
  notification: Notification;
  onRemove: (id: number) => void;
  onClose: () => void;
}

function NotificationBox({ notification, onRemove, onClose }: Props) {
  const navigate = useNavigate();

  const getIcon = () => {
    const iconClasses = "w-6 h-6 md:w-7 md:h-7";
    const iconColors = {
      [Notif.Edited]: "text-blue-500",
      [Notif.Chat]: "text-green-500",
      [Notif.Deleted]: "text-red-500",
      default: "text-gray-500",
    };

    const colorClass = iconColors[notification.type] || iconColors.default;

    switch (notification.type) {
      case Notif.Edited:
        return <List className={`${iconClasses} ${colorClass}`} />;
      case Notif.Chat:
        return <MessageCircle className={`${iconClasses} ${colorClass}`} />;
      case Notif.Deleted:
        return <Trash2 className={`${iconClasses} ${colorClass}`} />;
      default:
        return <Info className={`${iconClasses} ${colorClass}`} />;
    }
  };

  const handleNavigate = () => {
    if (notification.type !== Notif.Deleted) {
      navigate(notification.link);
      onClose();
    }
  };

  return (
    <div
      className={`w-full max-w-xl mx-auto`}
      onClick={handleNavigate}
      role="button"
      tabIndex={0}
    >
      <div
        className={`p-4 sm:p-5 flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 rounded-[6px] ${notification.type !== Notif.Deleted ? "hover:bg-gray-100 transition-colors duration-200" : ""}`}
      >
        <div className="flex items-center w-full sm:w-auto justify-between sm:block sm:flex-shrink-0">
          <div className="flex items-center space-x-3 sm:block sm:space-x-0">
            {getIcon()}
            <p className="sm:hidden text-gray-900 font-medium truncate ml-2 text-wrap">
              {notification.message}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(notification.id);
            }}
            className="sm:hidden text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-grow w-full sm:min-w-0">
          <p className="hidden sm:block text-gray-900 font-medium truncate text-wrap">
            {notification.message}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(notification.timestamp).toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </p>
        </div>

        <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(notification.id);
            }}
            className="hidden sm:block text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotificationBox;
