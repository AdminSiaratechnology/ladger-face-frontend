import { useState } from "react";

/**
 * Reusable Autocomplete Input Component
 * 
 * Props:
 * - label: string → label text (e.g. "City")
 * - name: string → field name/key (e.g. "city")
 * - value: string → current input value
 * - onChange: function(name, value) → callback when value changes
 * - options: array → list of { name: string } or strings
 * - placeholder: string → optional placeholder text
 * - disabled: boolean → disable input
 */
 const CityInput = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select or type...",
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value || "");

  const normalizedOptions = options.map((opt) =>
    typeof opt === "string" ? { name: opt } : opt
  );

  const filtered = normalizedOptions.filter((opt) =>
    opt.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (val) => {
    setQuery(val);
    onChange(name, val);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-1 relative">
      {label && (
        <label className="text-sm font-semibold text-gray-700" htmlFor={name}>
          {label}
        </label>
      )}

      <input
        id={name}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(name, e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        placeholder={placeholder}
        className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all w-full"
        disabled={disabled}
      />

      {isOpen && filtered.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-auto">
          {filtered.map((opt) => (
            <li
              key={opt.name}
              onClick={() => handleSelect(opt.name)}
              className="px-4 py-2 cursor-pointer hover:bg-blue-50 transition-colors"
            >
              {opt.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CityInput;