
import React from "react";
import { Movie } from "@/types/movie";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { getImageUrl } from "@/services/movieService";

interface SelectedMoviesListProps {
  selectedMovies: Movie[];
  onRemoveMovie: (movieId: number) => void;
  onClearAll: () => void;
}

export function SelectedMoviesList({ 
  selectedMovies, 
  onRemoveMovie, 
  onClearAll 
}: SelectedMoviesListProps) {
  if (selectedMovies.length === 0) {
    return (
      <div className="border border-border rounded-md p-4 bg-background">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Filmes Selecionados</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearAll}
            disabled={true}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Limpar Lista
          </Button>
        </div>
        <p className="text-center text-muted-foreground py-4">
          Nenhum filme selecionado. Adicione filmes clicando nos cards ou buscando abaixo.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-md p-4 bg-background">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Filmes Selecionados ({selectedMovies.length})</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearAll}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="mr-1 h-4 w-4" />
          Limpar Lista
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {selectedMovies.map(movie => (
          <Badge 
            key={movie.id} 
            className="flex items-center gap-2 py-1 pl-1 pr-2 max-w-full"
          >
            <img 
              src={getImageUrl(movie.poster_path, 'w92')} 
              alt={movie.title} 
              className="h-6 w-auto rounded-sm"
            />
            <span className="truncate max-w-[150px]">{movie.title}</span>
            <button 
              onClick={() => onRemoveMovie(movie.id)}
              className="text-xs ml-1 text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
