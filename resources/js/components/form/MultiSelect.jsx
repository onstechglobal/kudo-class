import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

export default function MultiSelect({ label, options = [], value = [], onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  /* Close dropdown on outside click */
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    <div className="space-y-2" ref={ref}>
      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
        {label}
      </label>

      {/* INPUT */}
      <div
        onClick={() => setOpen(!open)}
        className="
          min-h-[56px] flex flex-wrap items-center gap-2
          px-4 py-2 bg-gray-50 rounded-2xl
          border border-gray-300 cursor-pointer
          focus-within:ring-4 focus-within:ring-blue-50
        "
      >
        {value.length === 0 && (
          <span className="text-gray-400 text-sm font-semibold">
            Select permissions
          </span>
        )}

        {value.map(v => (
          <span key={`selected-${v.permission_id}`}
            className="flex items-center gap-1 bg-blue-100 text-blue-700
                       px-3 py-1 rounded-full text-xs font-bold"
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

        <ChevronDown
          size={16}
          className={`ml-auto text-gray-500 transition ${open ? "rotate-180" : ""}`}
        />
      </div>

      {/* DROPDOWN */}
      {open && filteredOptions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-auto">
          {filteredOptions.map(opt => (
             <div key={`option-${opt.permission_id}`}
              onClick={() => toggleOption(opt)}
              className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
            >
              {opt.module}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
