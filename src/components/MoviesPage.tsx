
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

  // Fetch base movies for recommendations
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["movies", currentPage],
    queryFn: () => fetchMovies(currentPage),
  });

  // Add movies from API to our local collection
  useEffect(() => {
    if (!data?.results) return;
    
    // Add new unique movies to our collection
    const newMovies = data.results.filter(
      newMovie => !allMovies.some(existingMovie => existingMovie.id === newMovie.id)
    );
    
    if (newMovies.length > 0) {
      setAllMovies(prevMovies => [...prevMovies, ...newMovies]);
    }
  }, [data, allMovies]);

  // Get selected movies from our collection
  const selectedMovies = selectedMovieIds
    .map(id => allMovies.find(movie => movie.id === id))
    .filter(movie => movie !== undefined) as Movie[];

  // Handle fetching similar movies when a movie is selected
  const handleAddSimilarMovies = useCallback((movies: Movie[]) => {
    // Add new unique movies to our collection
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

  // Use our custom hook to get related movies
  const { isLoading: isLoadingSimilar } = useRelatedMovies({
    selectedMovieId: selectedForSimilar,
    onNewMovies: handleAddSimilarMovies
  });
  
  // Get recommended movies based on the selected movies
  const getRecommendedMovies = useCallback(() => {
    if (selectedMovieIds.length === 0 || !allMovies.length) return [];

    // Get all genre IDs from selected movies
    const selectedGenreIds = selectedMovies.flatMap(movie => movie.genre_ids);
    const uniqueGenreIds = [...new Set(selectedGenreIds)];
    
    // Find movies with similar genres
    return allMovies
      .filter((movie) => {
        // Don't recommend already selected movies
        if (selectedMovieIds.includes(movie.id)) return false;
        
        // Check for genre overlap
        const commonGenres = movie.genre_ids.filter((genre) =>
          uniqueGenreIds.includes(genre)
        );
        
        return commonGenres.length > 0;
      })
      .sort((a, b) => {
        // Sort by number of common genres
        const commonGenresA = a.genre_ids.filter((genre) =>
          uniqueGenreIds.includes(genre)
        ).length;
        
        const commonGenresB = b.genre_ids.filter((genre) =>
          uniqueGenreIds.includes(genre)
        ).length;
        
        return commonGenresB - commonGenresA;
      })
      .slice(0, maxRecommendations); // Use the maxRecommendations state
  }, [selectedMovieIds, allMovies, selectedMovies, maxRecommendations]);

  const recommendedMovies = getRecommendedMovies();

  // Handle error notifications
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
    // Add movie to selected list if not already there
    if (!selectedMovieIds.includes(movie.id)) {
      setSelectedMovieIds(current => [...current, movie.id]);
      
      // Make sure the movie is in allMovies
      if (!allMovies.some(m => m.id === movie.id)) {
        setAllMovies(current => [...current, movie]);
      }

      // Set this movie as the one to fetch similar movies for
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

  // Update max recommendations with limits
  const handleMaxRecommendationsChange = (value: number) => {
    // Ensure max recommendations is between 6 and 12
    const clamped = Math.max(6, Math.min(12, value));
    setMaxRecommendations(clamped);
  };

  // Update node click handler to only update selected node for analysis
  const handleNodeClick = (movieId: number) => {
    // No selection/deselection, just let the graph component handle updating the selected node
  };

  // Combine selected and recommended movies for display in the graph
  const moviesToDisplay = allMovies.length > 0
    ? [...selectedMovies, ...recommendedMovies]
    : [];

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto py-4 flex-1">
        <h1 className="text-3xl font-bold mb-6 text-primary">Cinema Explorer</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-6 space-y-6">
            {/* Selected Movies List */}
            <SelectedMoviesList 
              selectedMovies={selectedMovies} 
              onRemoveMovie={handleRemoveMovie}
              onClearAll={handleClearAllSelected}
            />
            
            {/* Recommended Movies */}
            <RecommendedMovies 
              recommendedMovies={recommendedMovies}
              isLoading={isLoading && currentPage === 1}
              selectedMovieIds={selectedMovieIds}
              onAddMovie={handleAddMovie}
            />

            {/* Add Movie Search with Filters */}
            <AddMovieSearch 
              onAddMovie={handleAddMovie}
              onRemoveMovie={handleRemoveMovie}
              selectedMovieIds={selectedMovieIds}
            />
          </div>
          
          {/* Right Column - Graph */}
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
      
      {/* Loading indicator for similar movies */}
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
