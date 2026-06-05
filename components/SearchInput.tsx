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
    <form onSubmit={handleSubmit} className="w-full max-w-[630px] group">
      <div className="relative w-full">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-atlantic via-blue-sky to-amber-warm rounded-2xl opacity-50 group-hover:opacity-75 group-focus-within:opacity-100 blur transition-all duration-500" />
        <div className="relative flex items-center bg-blue-deep rounded-2xl border-2 border-transparent group-focus-within:border-blue-sky/50 transition-all">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-sky" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={loading}
            className="flex-1 bg-transparent text-white placeholder:text-slate-light text-lg sm:text-xl py-4 sm:py-5 pl-14 sm:pl-16 pr-16 sm:pr-20 outline-none font-medium"
          />
          <button
            type="submit"
            disabled={loading || !value.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-amber-warm rounded-xl flex items-center justify-center hover:bg-amber-warm/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-blue-deep/30 border-t-blue-deep rounded-full animate-spin" />
            ) : (
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-blue-deep" />
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchInput;
