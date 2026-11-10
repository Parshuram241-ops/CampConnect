import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      // Navigate to marketplace with search query
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      // Navigate to marketplace without search query
      navigate("/marketplace");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  return (
    <div className="mt-10 w-full max-w-3xl">
      <form onSubmit={handleSearch}>
        <div className="flex items-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-lg shadow-slate-200/50">
          
          <Search className="ml-3 h-5 w-5 text-slate-400" />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search books, electronics, notes, furniture..."
            className="flex-1 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 outline-none placeholder:text-slate-400"
          />

          <button 
            type="submit"
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Search
          </button>

        </div>
      </form>
    </div>
  );
}

export default SearchBar;