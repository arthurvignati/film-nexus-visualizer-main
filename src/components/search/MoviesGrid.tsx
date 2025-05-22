
import { MovieCard } from "@/components/MovieCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Movie } from "@/types/movie";
import { Plus } from "lucide-react";

interface MoviesGridProps {
  movies: Movie[];
  isLoading: boolean;
  isFetching: boolean;
  hasMoreMovies: boolean;
  selectedMovieIds: number[];
  searchQuery: string;
  handleCardClick: (movie: Movie) => void;
  loadMoreMovies: () => void;
}

export function MoviesGrid({
  movies,
  isLoading,
  isFetching,
  hasMoreMovies,
  selectedMovieIds,
  searchQuery,
  handleCardClick,
  loadMoreMovies
}: MoviesGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-[180px] w-full" />
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Nenhum filme encontrado {searchQuery ? `para "${searchQuery}"` : ""}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {movies.map((movie) => (
          <div key={movie.id} className="relative group">
            <MovieCard
              movie={movie}
              isSelected={selectedMovieIds.includes(movie.id)}
              onClick={() => handleCardClick(movie)}
            />
          </div>
        ))}
      </div>
      
      {/* Load More Button */}
      {hasMoreMovies && (
        <div className="flex justify-center mt-6">
          <Button 
            onClick={loadMoreMovies} 
            disabled={isFetching}
            variant="outline"
          >
            {isFetching ? (
              "Carregando..."
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" /> 
                Carregar mais
              </>
            )}
          </Button>
        </div>
      )}
    </>
  );
}
