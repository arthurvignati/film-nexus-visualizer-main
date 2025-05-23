
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Movie } from "@/types/movie";

interface RelatedMoviesProps {
  selectedMovieId: number | null;
  onNewMovies: (movies: Movie[]) => void;
}

// API endpoint for similar movies
const SIMILAR_MOVIES_URL = "https://api.themoviedb.org/3/movie";
const TMDB_API_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMzEyYTA0MTYzODAxMjVmZThlODQwMWI1MjA2MGMwZSIsIm5iZiI6MTc0MzQ2NTc2My45MDEsInN1YiI6IjY3ZWIyZDIzMDNiYWJkY2VkMjdhOWE0YyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.-tb5nI8dlWuLVae0G2YLBvDV948ndMxTw-D7vYka6SE";

const headers = {
  accept: 'application/json',
  Authorization: `Bearer ${TMDB_API_TOKEN}`
};

export function useRelatedMovies({ selectedMovieId, onNewMovies }: RelatedMoviesProps) {
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Certifica de que selectedMovieId seja um número
  const movieId = typeof selectedMovieId === 'string' ? parseInt(selectedMovieId) : selectedMovieId;

  // Busca filmes semelhantes quando um filme for selecionado
  const { data: similarMovies, isLoading } = useQuery({
    queryKey: ['similarMovies', movieId],
    queryFn: async () => {
      if (!movieId) return { results: [] };
      
      const url = `${SIMILAR_MOVIES_URL}/${movieId}/similar?language=pt-BR&page=1`;
      console.log(`Fetching similar movies from: ${url}`);
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        console.error(`Failed to fetch similar movies for ID ${movieId}, status: ${response.status}`);
        throw new Error('Failed to fetch similar movies');
      }
      
      const data = await response.json();
      console.log(`Received ${data?.results?.length || 0} similar movies for ID ${movieId}`);
      return data;
    },
    enabled: !!movieId && movieId !== processingId,
    staleTime: 5 * 60 * 1000, // 5 minutos cache
  });

  // Quando tivermos novos filmes relacionados, ligue para o retorno
  useEffect(() => {
    if (similarMovies?.results && similarMovies.results.length > 0 && movieId !== processingId) {
      console.log(`Processing ${similarMovies.results.length} similar movies for ID ${movieId}`);
      setProcessingId(movieId);
      onNewMovies(similarMovies.results);
    }
  }, [similarMovies, movieId, onNewMovies, processingId]);

  return {
    isLoading,
    similarMoviesCount: similarMovies?.results?.length || 0
  };
}
