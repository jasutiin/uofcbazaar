import NotificationBox from "../components/NotificationBox.tsx";
import { Notification } from "../types/notif.ts";
import { useNotif } from "../hooks/NotificationContext.tsx";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

function Notifications({ isOpen, onClose }: Props) {
  const notif = useNotif();

  const removeNotification = async (id: number) => {
    await notif.deleteNotification(id);
  };

  return (
    <div
      className={`fixed mt-24 md:mr-4 right-0 h-full md:h-[calc(100%-6.5rem)] w-full md:w-[400px] z-[100] transition-all duration-300 ease-in-out ${
        isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className="bg-white shadow-lg h-full overflow-y-auto rounded-xl">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-medium">Notifications</h2>
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => {
              onClose();
              notif.setHasNotif(false);
            }}
          >
            Close
          </button>
        </div>

        {notif.notifications.length === 0 ? (
          <div className="flex justify-center mt-4 text-gray-500">
            No notifications available
          </div>
        ) : (
          <ul className="space-y-4 p-4">
            {notif.notifications.map((notification: Notification) => (
              <NotificationBox
                key={notification.id}
                notification={notification}
                onRemove={removeNotification}
                onClose={onClose}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Notifications;
