
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchMovies, fetchMovies, fetchGenres } from "@/services/movieService";
import { Movie, FilterOptions, Genre } from "@/types/movie";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Filter } from "lucide-react";
import { SearchBar } from "@/components/search/SearchBar";
import { MovieFilters } from "@/components/search/MovieFilters";
import { MoviesGrid } from "@/components/search/MoviesGrid";

interface AddMovieSearchProps {
  onAddMovie: (movie: Movie) => void;
  onRemoveMovie: (movieId: number) => void;
  selectedMovieIds: number[];
}

const currentYear = new Date().getFullYear();
const initialFilters: FilterOptions = {
  genres: [],
  yearRange: [1900, currentYear],
  ratingRange: [0, 10],
  searchQuery: "",
};

export function AddMovieSearch({ onAddMovie, onRemoveMovie, selectedMovieIds }: AddMovieSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [page, setPage] = useState(1);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const { toast } = useToast();
  
  // Forçar carregamento inicial de filmes populares
  useEffect(() => {
    if (!searchSubmitted) {
      setSearchSubmitted(true);
    }
  }, []);

  // Carregar genêros
  useEffect(() => {
    const loadGenres = async () => {
      try {
        const data = await fetchGenres();
        setGenres(data.genres);
      } catch (error) {
        console.error("Failed to load genres:", error);
        toast({
          title: "Erro ao carregar gêneros",
          description: "Não foi possível carregar a lista de gêneros.",
          variant: "destructive",
        });
      }
    };

    loadGenres();
  }, [toast]);
  
  // Consultar filmes - resultados da pesquisa ou filmes populares se não houver consulta
  const {
    data,
    isLoading,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ["moviesSearch", searchQuery, filters, page, searchSubmitted],
    queryFn: () => {
      if (searchQuery.trim()) {
        return searchMovies(searchQuery, page);
      } else if (filters.genres.length > 0 || 
                filters.yearRange[0] !== initialFilters.yearRange[0] || 
                filters.yearRange[1] !== initialFilters.yearRange[1] ||
                filters.ratingRange[0] !== initialFilters.ratingRange[0] ||
                filters.ratingRange[1] !== initialFilters.ratingRange[1]) {
        return fetchMovies(page, filters);
      } else {
        return fetchMovies(page);
      }
    },
    enabled: searchSubmitted,
  });

  // Atualizar allMovies quando os dados forem alterados
  useEffect(() => {
    if (!data?.results) return;
    
    if (page === 1) {
      // Redefinir filmes quando os filtros mudam ou no carregamento inicial
      setAllMovies(data.results);
    } else {
      // Adicione novos filmes exclusivos ao carregar mais
      const newMovies = data.results.filter(
        newMovie => !allMovies.some(existingMovie => existingMovie.id === newMovie.id)
      );
      setAllMovies(prevMovies => [...prevMovies, ...newMovies]);
    }
  }, [data, page, allMovies]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Redefinir para a página 1 em uma nova pesquisa
    const newFilters = { ...filters, searchQuery };
    setFilters(newFilters);
    setSearchSubmitted(true);
  };

  const handleCardClick = (movie: Movie) => {
    if (selectedMovieIds.includes(movie.id)) {
      onRemoveMovie(movie.id);
    } else {
      onAddMovie(movie);
    }
  };

  const loadMoreMovies = () => {
    setPage(prevPage => prevPage + 1);
  };

  // Manipuladores de filtros
  const handleGenreToggle = (genreId: number) => {
    const newGenres = filters.genres.includes(genreId)
      ? filters.genres.filter((id) => id !== genreId)
      : [...filters.genres, genreId];

    const newFilters = { ...filters, genres: newGenres };
    setPage(1); // Redefinir para a página 1 na troca do filtro
    setFilters(newFilters);
    setSearchSubmitted(true);
  };

  const handleYearChange = (values: number[]) => {
    const newFilters = { ...filters, yearRange: values as [number, number] };
    setPage(1); // Redefinir para a página 1 na troca do filtro
    setFilters(newFilters);
    setSearchSubmitted(true);
  };

  const handleRatingChange = (values: number[]) => {
    const newFilters = { ...filters, ratingRange: values as [number, number] };
    setPage(1); // Redefinir para a página 1 na troca do filtro
    setFilters(newFilters);
    setSearchSubmitted(true);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilters({ ...filters, searchQuery: "" });
    setPage(1); // Redefinir para a página 1 na pesquisa limpa
    setSearchSubmitted(true);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setSearchQuery("");
    setPage(1); // Redefinir para a página 1 sobre filtros de redefinição
    setSearchSubmitted(true);
  };

  const hasActiveFilters = 
    filters.genres.length > 0 || 
    filters.yearRange[0] !== initialFilters.yearRange[0] ||
    filters.yearRange[1] !== initialFilters.yearRange[1] ||
    filters.ratingRange[0] !== initialFilters.ratingRange[0] ||
    filters.ratingRange[1] !== initialFilters.ratingRange[1] ||
    searchQuery !== "";

  const hasMoreMovies = data?.total_pages && page < data.total_pages;

  const toggleFilters = () => setIsFiltersOpen(!isFiltersOpen);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Explorar Filmes</h2>
      
      {/* Search Bar */}
      <SearchBar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSubmit={handleSubmit}
        clearSearch={clearSearch}
        toggleFilters={toggleFilters}
        isFiltersOpen={isFiltersOpen}
      />

      {/* Collapsible Filters */}
      <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <CollapsibleContent>
          <MovieFilters 
            filters={filters}
            genres={genres}
            initialFilters={initialFilters}
            hasActiveFilters={hasActiveFilters}
            handleGenreToggle={handleGenreToggle}
            handleYearChange={handleYearChange}
            handleRatingChange={handleRatingChange}
            resetFilters={resetFilters}
          />
        </CollapsibleContent>
      </Collapsible>
      
      {/* Movie Results */}
      <div className="space-y-4">
        {isError ? (
          <div className="text-center py-4 text-red-500">
            Erro ao buscar filmes. Tente novamente.
          </div>
        ) : (
          <MoviesGrid 
            movies={allMovies}
            isLoading={isLoading && page === 1}
            isFetching={isFetching}
            hasMoreMovies={hasMoreMovies}
            selectedMovieIds={selectedMovieIds}
            searchQuery={searchQuery}
            handleCardClick={handleCardClick}
            loadMoreMovies={loadMoreMovies}
          />
        )}
      </div>
    </div>
  );
}
