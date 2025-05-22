
import { useEffect, useState } from "react";
import { fetchGenres } from "@/services/movieService";
import { FilterOptions, Genre } from "@/types/movie";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface MovieFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
}

const currentYear = new Date().getFullYear();
const initialFilters: FilterOptions = {
  genres: [],
  yearRange: [1900, currentYear],
  ratingRange: [0, 10],
  searchQuery: "",
};

export function MovieFilters({ onFilterChange }: MovieFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadGenres = async () => {
      try {
        setIsLoading(true);
        const data = await fetchGenres();
        setGenres(data.genres);
      } catch (error) {
        console.error("Failed to load genres:", error);
        toast({
          title: "Erro ao carregar gêneros",
          description: "Não foi possível carregar a lista de gêneros.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadGenres();
  }, [toast]);

  const handleGenreToggle = (genreId: number) => {
    const newGenres = filters.genres.includes(genreId)
      ? filters.genres.filter((id) => id !== genreId)
      : [...filters.genres, genreId];

    const newFilters = { ...filters, genres: newGenres };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleYearChange = (values: number[]) => {
    const newFilters = { ...filters, yearRange: values as [number, number] };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRatingChange = (values: number[]) => {
    const newFilters = { ...filters, ratingRange: values as [number, number] };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newFilters = { ...filters, searchQuery: searchInputValue };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearSearch = () => {
    setSearchInputValue("");
    const newFilters = { ...filters, searchQuery: "" };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setSearchInputValue("");
    onFilterChange(initialFilters);
  };

  const hasActiveFilters = 
    filters.genres.length > 0 || 
    filters.yearRange[0] !== initialFilters.yearRange[0] ||
    filters.yearRange[1] !== initialFilters.yearRange[1] ||
    filters.ratingRange[0] !== initialFilters.ratingRange[0] ||
    filters.ratingRange[1] !== initialFilters.ratingRange[1] ||
    filters.searchQuery !== "";

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Input
          value={searchInputValue}
          onChange={(e) => setSearchInputValue(e.target.value)}
          placeholder="Buscar filmes..."
          className="pr-10"
        />
        {searchInputValue && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-10 top-0 h-full"
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
      </form>

      {/* Genres */}
      <div>
        <h3 className="text-sm font-medium mb-2">Gêneros</h3>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <Badge
              key={genre.id}
              variant={filters.genres.includes(genre.id) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleGenreToggle(genre.id)}
            >
              {genre.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Year Range */}
      <div>
        <h3 className="text-sm font-medium mb-2">
          Ano: {filters.yearRange[0]} - {filters.yearRange[1]}
        </h3>
        <Slider
          defaultValue={[1900, currentYear]}
          value={filters.yearRange}
          min={1900}
          max={currentYear}
          step={1}
          onValueChange={handleYearChange}
          className="my-4"
        />
      </div>

      {/* Rating Range */}
      <div>
        <h3 className="text-sm font-medium mb-2">
          Classificação: {filters.ratingRange[0]} - {filters.ratingRange[1]}
        </h3>
        <Slider
          defaultValue={[0, 10]}
          value={filters.ratingRange}
          min={0}
          max={10}
          step={0.5}
          onValueChange={handleRatingChange}
          className="my-4"
        />
      </div>

      {/* Reset Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={resetFilters}
          className="w-full"
        >
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
