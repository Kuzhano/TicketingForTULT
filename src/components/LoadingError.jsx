
export default function LoadingError({
  loading,
  error,
  onRetry,
}) {
  if (loading) {
    return (
      <div
        role="status"
        className="bg-white border rounded-xl p-5 text-gray-600"
      >
        <p className="animate-pulse">
          Memuat data tiket...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="bg-red-50 border border-red-200 rounded-xl p-5"
      >
        <p className="text-red-700 mb-3">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return null;
}
