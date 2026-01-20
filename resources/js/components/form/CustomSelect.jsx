import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function CustomSelect({
  label,
  options,
  value,
  onChange,
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
            className={`w-full flex items-center justify-between px-5 py-4 rounded-xl text-sm transition
                ${
                open
                    ? "bg-white border border-blue-500 ring-2 ring-blue-100"
                    : "bg-gray-50 border border-transparent hover:bg-gray-100"
                }
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
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className="px-4 py-2 text-sm cursor-pointer hover:bg-blue-50"
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
