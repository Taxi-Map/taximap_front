import React from 'react';
import { Search, ArrowRight } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  placeholder?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onSubmit,
  loading,
  placeholder = "Para onde vais?"
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[560px] group">
      <div className="relative w-full">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-atlantic via-blue-sky to-amber-warm rounded-xl opacity-40 group-hover:opacity-70 group-focus-within:opacity-90 blur transition-all duration-500" />
        <div className="relative flex items-center bg-blue-deep rounded-xl border border-transparent group-focus-within:border-blue-sky/40 transition-all">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-sky" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={loading}
            className="flex-1 bg-transparent text-white placeholder:text-slate-light text-base sm:text-lg py-3 sm:py-3.5 pl-12 sm:pl-14 pr-14 sm:pr-16 outline-none font-medium"
          />
          <button
            type="submit"
            disabled={loading || !value.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-amber-warm rounded-lg flex items-center justify-center hover:bg-amber-warm/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-blue-deep/30 border-t-blue-deep rounded-full animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-deep" />
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchInput;
