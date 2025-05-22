
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { FilterOptions, Genre } from "@/types/movie";

interface MovieFiltersProps {
  filters: FilterOptions;
  genres: Genre[];
  initialFilters: FilterOptions;
  hasActiveFilters: boolean;
  handleGenreToggle: (genreId: number) => void;
  handleYearChange: (values: number[]) => void;
  handleRatingChange: (values: number[]) => void;
  resetFilters: () => void;
}

export function MovieFilters({
  filters,
  genres,
  initialFilters,
  hasActiveFilters,
  handleGenreToggle,
  handleYearChange,
  handleRatingChange,
  resetFilters
}: MovieFiltersProps) {
  return (
    <div className="space-y-4 p-4 bg-card rounded-lg mb-4">
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
          defaultValue={[1900, initialFilters.yearRange[1]]}
          value={filters.yearRange}
          min={1900}
          max={initialFilters.yearRange[1]}
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
