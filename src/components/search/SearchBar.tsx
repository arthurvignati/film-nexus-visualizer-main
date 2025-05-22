
import { Search, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  clearSearch: () => void;
  toggleFilters: () => void;
  isFiltersOpen: boolean;
}

export function SearchBar({
  searchQuery,
  setSearchQuery,
  onSubmit,
  clearSearch,
  toggleFilters,
  isFiltersOpen
}: SearchBarProps) {
  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Input
          placeholder="Buscar filmes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-8 top-0 h-full"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
      <Button 
        type="button" 
        variant={isFiltersOpen ? "secondary" : "outline"} 
        onClick={toggleFilters}
      >
        <Filter className="h-4 w-4 mr-2" /> 
        Filtros
      </Button>
    </form>
  );
}
