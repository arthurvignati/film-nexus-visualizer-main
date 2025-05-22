
import { Movie } from "@/types/movie";
import { MovieCard } from "@/components/MovieCard";
import { Skeleton } from "@/components/ui/skeleton";

interface RecommendedMoviesProps {
  recommendedMovies: Movie[];
  isLoading: boolean;
  selectedMovieIds: number[];
  onAddMovie: (movie: Movie) => void;
}

export function RecommendedMovies({ 
  recommendedMovies, 
  isLoading, 
  selectedMovieIds,
  onAddMovie
}: RecommendedMoviesProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Recomendações</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[240px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (recommendedMovies.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Recomendações</h2>
        </div>
        <div className="text-center py-4 text-muted-foreground border border-dashed border-border rounded-md">
          Adicione filmes à lista para receber recomendações
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Recomendações</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {recommendedMovies.map((movie) => (
          <div key={movie.id} className="relative group">
            <MovieCard
              movie={movie}
              isSelected={selectedMovieIds.includes(movie.id)}
              isRecommended={true}
              onClick={() => !selectedMovieIds.includes(movie.id) && onAddMovie(movie)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
