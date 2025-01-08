interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const LoginModal = ({ isOpen, onClose, onLogin }: Props) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Login Required</h2>
        <p className="text-gray-600 mb-6">Please log in to use this feature.</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onLogin}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
