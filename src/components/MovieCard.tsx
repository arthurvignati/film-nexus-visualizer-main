
import { Movie } from "@/types/movie";
import { getImageUrl } from "@/services/movieService";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatReleaseYear } from "@/lib/date-utils";

interface MovieCardProps {
  movie: Movie;
  isSelected: boolean;
  onClick: () => void;
  isRecommended?: boolean;
}

export function MovieCard({ movie, isSelected, onClick, isRecommended = false }: MovieCardProps) {
  const releaseYear = formatReleaseYear(movie.release_date);
  
  return (
    <Card 
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden transition-all duration-300 cursor-pointer",
        "hover:scale-[1.02] hover:shadow-xl hover:z-10",
        isSelected && "ring-2 ring-primary shadow-lg",
        isRecommended && "ring-1 ring-primary/50"
      )}
    >
      <CardContent className="p-0 relative h-[360px] overflow-hidden">
        {/* Poster */}
        <img 
          src={getImageUrl(movie.poster_path)} 
          alt={movie.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Gradiente de sobreposição */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-100" />
        
        {/* Avaliação */}
        <div className="absolute top-2 right-2 flex items-center justify-center w-10 h-10 rounded-full bg-black/60 text-movie-rating font-bold">
          {movie.vote_average.toFixed(1)}
        </div>
        
        {/* Emblema recomendado - movido para o canto superior esquerdo */}
        {isRecommended && (
          <div className="absolute top-2 left-2 bg-primary/80 text-white text-xs px-2 py-1 rounded-full">
            Recomendado
          </div>
        )}
        
        {/* Conteúdo em texto */}
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <h3 className="font-bold text-lg truncate">{movie.title}</h3>
          <p className="text-sm text-gray-300">{releaseYear}</p>
        </div>
      </CardContent>
    </Card>
  );
}
