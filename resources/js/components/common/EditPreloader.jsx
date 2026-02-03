/* Edit Preloader */
export default function EditPreloader() {

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
        <p className="text-sm font-medium text-gray-600">Loading data...</p>
      </div>
    </div>
  );
}
