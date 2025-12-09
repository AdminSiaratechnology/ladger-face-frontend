import React, { useEffect, useState } from "react";

export default function MultiSelect({
  label,
  options = [],
  disabled,
  selected = [],
  onChange,
  controller, // { id, activeMultiSelect, setActiveMultiSelect }
}) {
  const { id, activeMultiSelect, setActiveMultiSelect } = controller || {};
  const open = activeMultiSelect === id;

  const [search, setSearch] = useState("");

  // Close when user clicks outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (!e.target.closest(`#multi-${id}`)) {
        if (activeMultiSelect === id) setActiveMultiSelect(null);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [activeMultiSelect]);

  const toggle = () => {
    if (disabled) return;

    if (open) setActiveMultiSelect(null);
    else setActiveMultiSelect(id);
  };

  const handleSelect = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div id={`multi-${id}`} className="w-full relative">
      <label className="text-sm font-medium">{label}</label>

      {/* Selected box */}
      <div
        onClick={toggle}
        className={`border rounded-lg min-h-[48px] p-2 mt-1 bg-white cursor-pointer flex flex-wrap gap-2 items-center
          shadow-sm hover:shadow-md transition
          ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
      >
        {selected.length === 0 && (
          <span className="text-gray-400 text-sm">Select options...</span>
        )}

        {selected.map((item) => (
          <span
            key={item}
            className="bg-teal-100 text-teal-700 px-2 py-1 rounded-md text-xs flex items-center gap-1 shadow-sm"
          >
            {item}
            {!disabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(selected.filter((x) => x !== item));
                }}
                className="text-xs"
              >
                ✕
              </button>
            )}
          </span>
        ))}
      </div>

      {/* Dropdown */}
      {open && !disabled && (
        <div className="absolute bg-white border shadow-xl rounded-lg w-full mt-1 z-30 max-h-56 overflow-y-auto transition">
          <input
            className="w-full p-2 border-b outline-none text-sm"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {filtered.map((opt) => (
            <div
              key={opt}
              className={`p-2 cursor-pointer hover:bg-teal-50 transition 
                ${selected.includes(opt) ? "bg-teal-100 font-medium" : ""}`}
              onClick={() => handleSelect(opt)}
            >
              {opt}
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="p-2 text-sm text-gray-400">No options</p>
          )}
        </div>
      )}
    </div>
  );
}
