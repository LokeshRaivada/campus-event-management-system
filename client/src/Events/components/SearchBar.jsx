import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import "./SearchBar.css";

export default function SearchBar({ value, onChange, resultCount }) {
  const inputRef = useRef(null);

  // Ctrl+K shortcut to focus search
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="search-box">
      <Search className="search-icon" size={18} />
      <input
        ref={inputRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search events..."
      />
      {typeof resultCount === "number" && value && (
        <span className="search-count">{resultCount} found</span>
      )}
      {value && (
        <button
          className="search-clear"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
      <kbd className="search-kbd">Ctrl K</kbd>
    </div>
  );
}
