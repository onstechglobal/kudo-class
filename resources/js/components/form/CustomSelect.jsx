import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function CustomSelect({
  label,
  options = [],
  value,
  onChange,
  error,
  placeholder = "Select option",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div className="w-full relative" ref={ref}>
      {label && (
        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
          {label}
        </label>
      )}

      {/* Select Box */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-medium outline-none transition cursor-pointer
              ${error
            ? "bg-red-50 border border-red-500 focus:ring-red-200"
            : open
              ? "bg-white border border-blue-500 focus:ring-blue-100"
              : "bg-gray-50 border border-transparent hover:bg-gray-100 focus:border-blue-500 focus:ring-blue-50"
          }
              focus:ring-4
            `}
      >
        <span className={selected ? "text-gray-900 font-medium" : "text-gray-400"}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown (ABSOLUTE) */}
      {open && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-[1.25rem] shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <div
            className="max-h-70 overflow-y-auto"
            style={{
              scrollbarWidth: 'thin', // For Firefox
              scrollbarColor: '#9e9d9b #f1f1f1', // For Firefox
            }}
          >
            {/* Webkit Specific Styles for Chrome/Safari inside the div */}
            <style>{`
            .max-h-60::-webkit-scrollbar {
              width: 6px;
            }
            .max-h-60::-webkit-scrollbar-track {
              background: #f8fafc;
            }
            .max-h-60::-webkit-scrollbar-thumb {
              background: #9e9d9b;
              border-radius: 10px;
            }
          `}</style>

            {options.length > 0 ? (
              options.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`px-5 py-3 text-sm cursor-pointer transition-colors
              ${value === opt.value
                      ? "bg-blue-50 text-blue-700 font-bold"
                      : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                    }
            `}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div className="px-5 py-4 text-sm text-gray-400 text-center italic">
                No options available
              </div>
            )}
          </div>
        </div>
      )}
      {/* ERROR MESSAGE */}
      {error && (
        <p className="text-xs font-bold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
