import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

export default function MultiSelect({
  label,
  options = [],
  value = [],
  onChange,
  placeholder = "Select options",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  /* Close on outside click */
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleOption(option) {
    if (value.find(v => v.permission_id === option.permission_id)) {
      onChange(value.filter(v => v.permission_id !== option.permission_id));
    } else {
      onChange([...value, option]);
    }
  }

  const filteredOptions = options.filter(
    opt => !value.find(v => v.permission_id === opt.permission_id)
  );

  return (
    <div className="w-full relative" ref={ref}>
      {label && (
        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
          {label}
        </label>
      )}

      {/* TRIGGER (same pattern as CustomSelect) */}
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

          {value.map(v => (
            <span
              key={v.permission_id}
              className="flex items-center gap-1
                bg-blue-100 text-blue-700
                px-3 py-1 rounded-full text-xs font-bold"
              onClick={e => e.stopPropagation()}
            >
              {v.module}
              <X
                size={12}
                className="cursor-pointer"
                onClick={e => {
                  e.stopPropagation();
                  toggleOption(v);
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

      {/* DROPDOWN */}
      {open && filteredOptions.length > 0 && (
        <div
          className="
            absolute z-50 w-full mt-2
            bg-white border border-gray-200
            rounded-xl shadow-lg
            max-h-48 overflow-auto
          "
        >
          {filteredOptions.map(opt => (
            <div
              key={opt.permission_id}
              onClick={() => toggleOption(opt)}
              className="px-4 py-2 text-sm cursor-pointer hover:bg-blue-50"
            >
              {opt.module}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
