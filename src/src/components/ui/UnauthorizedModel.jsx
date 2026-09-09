// UnauthorizedModal.jsx
const UnauthorizedModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xl w-full max-w-sm text-center">
                <h2 className="text-lg font-semibold mb-4 text-red-600">Access Denied</h2>
                <p className="text-sm text-gray-700 mb-6">
                    You are <strong>not authorized</strong> to access this panel.
                </p>
                <div className="flex justify-center">
                    <button
                        onClick={onClose}
                        className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 text-sm sm:text-base"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UnauthorizedModal;
