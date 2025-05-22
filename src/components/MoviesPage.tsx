
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Movie } from "@/types/movie";
import { fetchMovies } from "@/services/movieService";
import { MovieGraph } from "@/components/MovieGraph";
import { useToast } from "@/hooks/use-toast";
import { ReactFlowProvider } from "@xyflow/react";
import { SelectedMoviesList } from "@/components/SelectedMoviesList";
import { AddMovieSearch } from "@/components/AddMovieSearch";
import { RecommendedMovies } from "@/components/RecommendedMovies";
import { useRelatedMovies } from "@/hooks/useRelatedMovies";

export function MoviesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMovieIds, setSelectedMovieIds] = useState<number[]>([]);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [maxRecommendations, setMaxRecommendations] = useState(6);
  const [selectedForSimilar, setSelectedForSimilar] = useState<number | null>(null);
  const { toast } = useToast();

  // Fetch filmes base para recomendaçõess
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["movies", currentPage],
    queryFn: () => fetchMovies(currentPage),
  });

  // Adiciona filmes da API à nossa coleção local
  useEffect(() => {
    if (!data?.results) return;
    
    // Adiciona novos filmes exclusivos à nossa coleção
    const newMovies = data.results.filter(
      newMovie => !allMovies.some(existingMovie => existingMovie.id === newMovie.id)
    );
    
    if (newMovies.length > 0) {
      setAllMovies(prevMovies => [...prevMovies, ...newMovies]);
    }
  }, [data, allMovies]);

  // Obtem filmes selecionados de nossa coleção
  const selectedMovies = selectedMovieIds
    .map(id => allMovies.find(movie => movie.id === id))
    .filter(movie => movie !== undefined) as Movie[];

  // Manipula a busca de filmes semelhantes quando um filme é selecionado
  const handleAddSimilarMovies = useCallback((movies: Movie[]) => {
    // Adiciona novos filmes exclusivos à nossa coleção
    const newMovies = movies.filter(
      newMovie => !allMovies.some(existingMovie => existingMovie.id === newMovie.id)
    );
    
    if (newMovies.length > 0) {
      setAllMovies(prevMovies => [...prevMovies, ...newMovies]);
      toast({
        title: "Novos filmes relacionados",
        description: `${newMovies.length} ${newMovies.length === 1 ? 'novo filme relacionado foi adicionado' : 'novos filmes relacionados foram adicionados'}.`,
      });
    }
  }, [allMovies, toast]);

  // Gancho personalizado para obter filmes relacionados
  const { isLoading: isLoadingSimilar } = useRelatedMovies({
    selectedMovieId: selectedForSimilar,
    onNewMovies: handleAddSimilarMovies
  });
  
  // Obtem filmes recomendados com base nos filmes selecionados
  const getRecommendedMovies = useCallback(() => {
    if (selectedMovieIds.length === 0 || !allMovies.length) return [];

    // Obtem todos os IDs de gênero de filmes selecionados
    const selectedGenreIds = selectedMovies.flatMap(movie => movie.genre_ids);
    const uniqueGenreIds = [...new Set(selectedGenreIds)];
    
    // Encontra filmes com gêneros semelhantes
    return allMovies
      .filter((movie) => {
        // Não recomenda filmes já selecionados
        if (selectedMovieIds.includes(movie.id)) return false;
        
        // Verifica se há sobreposição de gênero
        const commonGenres = movie.genre_ids.filter((genre) =>
          uniqueGenreIds.includes(genre)
        );
        
        return commonGenres.length > 0;
      })
      .sort((a, b) => {
        // Classifica por número de gêneros comuns
        const commonGenresA = a.genre_ids.filter((genre) =>
          uniqueGenreIds.includes(genre)
        ).length;
        
        const commonGenresB = b.genre_ids.filter((genre) =>
          uniqueGenreIds.includes(genre)
        ).length;
        
        return commonGenresB - commonGenresA;
      })
      .slice(0, maxRecommendations); // Usa o estado maxRecommendations
  }, [selectedMovieIds, allMovies, selectedMovies, maxRecommendations]);

  const recommendedMovies = getRecommendedMovies();

  // Lidando com notificações de erro
  useEffect(() => {
    if (isError) {
      toast({
        title: "Erro ao carregar filmes",
        description: (error as Error)?.message || "Ocorreu um erro ao buscar os filmes.",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  const handleAddMovie = (movie: Movie) => {
    // Adiciona filme à lista selecionada se ainda não estiver lá
    if (!selectedMovieIds.includes(movie.id)) {
      setSelectedMovieIds(current => [...current, movie.id]);
      
      // Certifica de que o filme esteja em todos os filmes
      if (!allMovies.some(m => m.id === movie.id)) {
        setAllMovies(current => [...current, movie]);
      }

      // Define este filme como aquele para buscar filmes semelhantes
      setSelectedForSimilar(movie.id);

      toast({
        title: "Filme adicionado",
        description: `"${movie.title}" foi adicionado à sua lista de selecionados.`,
      });
    }
  };

  const handleRemoveMovie = (movieId: number) => {
    setSelectedMovieIds(current => current.filter(id => id !== movieId));
  };

  const handleClearAllSelected = () => {
    setSelectedMovieIds([]);
    toast({
      title: "Lista limpa",
      description: "Todos os filmes foram removidos da sua lista.",
    });
  };

  // Atualiza recomendações máximas com limites
  const handleMaxRecommendationsChange = (value: number) => {
    // Garante que a recomendação máxima esteja entre 6 e 12
    const clamped = Math.max(6, Math.min(12, value));
    setMaxRecommendations(clamped);
  };

  // Atualiza o manipulador de cliques do nó para atualizar apenas o nó selecionado para análise
  const handleNodeClick = (movieId: number) => {
    // Nenhuma seleção/desseleção, apenas deixe o componente gráfico lidar com a atualização do nó selecionado
  };

  // Combina filmes selecionados e recomendados para exibição no gráfico
  const moviesToDisplay = allMovies.length > 0
    ? [...selectedMovies, ...recommendedMovies]
    : [];

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto py-4 flex-1">
        <h1 className="text-3xl font-bold mb-6 text-primary">Cinema Explorer</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Coluna Esquerda */}
          <div className="lg:col-span-6 space-y-6">
            {/* Lista de Filmes Selecionados */}
            <SelectedMoviesList 
              selectedMovies={selectedMovies} 
              onRemoveMovie={handleRemoveMovie}
              onClearAll={handleClearAllSelected}
            />
            
            {/* Filmes recomendados */}
            <RecommendedMovies 
              recommendedMovies={recommendedMovies}
              isLoading={isLoading && currentPage === 1}
              selectedMovieIds={selectedMovieIds}
              onAddMovie={handleAddMovie}
            />

            {/* Adiciona pesquisa de filmes com filtros */}
            <AddMovieSearch 
              onAddMovie={handleAddMovie}
              onRemoveMovie={handleRemoveMovie}
              selectedMovieIds={selectedMovieIds}
            />
          </div>
          
          {/* Coluna Direita - Grafo */}
          <div className="lg:col-span-6 min-h-[100vh] overflow-auto pb-20">
            <ReactFlowProvider>
              <MovieGraph
                movies={allMovies} 
                selectedMovieIds={selectedMovieIds}
                recommendedMovies={recommendedMovies}
                onNodeClick={handleNodeClick}
              />
            </ReactFlowProvider>
          </div>
        </div>
      </div>
      
      {/* Indicador de carregamento para filmes semelhantes */}
      {isLoadingSimilar && (
        <div className="fixed bottom-4 right-4 bg-background border border-border rounded-md p-2 shadow-md">
          <div className="flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
            <span className="text-sm">Buscando filmes relacionados...</span>
          </div>
        </div>
      )}
    </div>
  );
}
