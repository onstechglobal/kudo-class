import { ChevronDown } from "lucide-react";

export default function Select({ label, error, children, ...props }) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
        {label}
      </label>

      <div className="relative">
        <select
          {...props}
          className={`
            appearance-none w-full px-5 pr-14 py-4 rounded-2xl
            text-sm font-bold outline-none
            ${error
              ? "bg-red-50 border border-red-500 focus:ring-red-200"
              : "bg-gray-50 border border-transparent focus:border-blue-500 focus:ring-blue-50"}
            focus:ring-4
          `}
        >
          {children}
        </select>

        <ChevronDown
          size={18}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
        />
      </div>

      {error && (
        <p className="text-xs font-bold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
