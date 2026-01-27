export default function Input({ label, error, ...props }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
        {label}
      </label>

      <input
        {...props}
        className={`
          w-full px-5 py-4 rounded-2xl text-sm font-medium outline-none
          ${error
            ? "bg-red-50 border border-red-500 focus:ring-red-200"
            : "bg-gray-50 border border-transparent focus:border-blue-500 focus:ring-blue-50"}
          focus:ring-4
        `}
      />

      {error && (
        <p className="text-xs font-bold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
