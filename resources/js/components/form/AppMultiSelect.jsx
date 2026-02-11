import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

export default function AppMultiSelect({
  label,
  options = [],
  value = [],
  onChange,
  placeholder = "Select options",
  required = false,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef();

  /* Close dropdown on outside click */
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (optionValue) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const selectedOptions = options.filter(opt =>
    value.includes(opt.value)
  );

  return (
    <div className="w-full relative" ref={containerRef}>
      {label && (
        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`
          w-full min-h-[56px]
          flex items-center justify-between
          px-5 py-4 rounded-xl text-sm transition
          ${
            open
              ? "bg-white border border-blue-500 ring-2 ring-blue-100"
              : "bg-gray-50 border border-transparent hover:bg-gray-100"
          }
        `}
      >
        <div className="flex flex-wrap gap-2 max-w-[90%]">
          {value.length === 0 && (
            <span className="text-gray-400 font-medium">
              {placeholder}
            </span>
          )}

          {selectedOptions.map(opt => (
            <span
              key={opt.value}
              className="flex items-center gap-1
                bg-blue-100 text-blue-700
                px-3 py-1 rounded-full text-xs font-bold"
              onClick={e => e.stopPropagation()}
            >
              {opt.label}
              <X
                size={12}
                className="cursor-pointer"
                onClick={e => {
                  e.stopPropagation();
                  toggleOption(opt.value);
                }}
              />
            </span>
          ))}
        </div>

        <ChevronDown
          size={16}
          className={`transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute z-50 w-full mt-2
            bg-white border border-gray-200
            rounded-xl shadow-lg
            max-h-52 overflow-auto
          "
        >
          {options.map(opt => (
            <div
              key={opt.value}
              onClick={() => toggleOption(opt.value)}
              className={`
                px-4 py-2 text-sm cursor-pointer
                flex items-center justify-between
                hover:bg-blue-50
                ${
                  value.includes(opt.value)
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : ""
                }
              `}
            >
              {opt.label}
              {value.includes(opt.value) && (
                <span className="text-xs font-bold">✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
