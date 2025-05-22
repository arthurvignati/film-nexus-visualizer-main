
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
  
  // Force initial load of popular movies
  useEffect(() => {
    if (!searchSubmitted) {
      setSearchSubmitted(true);
    }
  }, []);

  // Load genres
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
  
  // Query movies - either search results or popular movies if no query
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

  // Update allMovies when data changes
  useEffect(() => {
    if (!data?.results) return;
    
    if (page === 1) {
      // Reset movies when filters change or on initial load
      setAllMovies(data.results);
    } else {
      // Add new unique movies when loading more
      const newMovies = data.results.filter(
        newMovie => !allMovies.some(existingMovie => existingMovie.id === newMovie.id)
      );
      setAllMovies(prevMovies => [...prevMovies, ...newMovies]);
    }
  }, [data, page, allMovies]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to page 1 on new search
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

  // Filter Handlers
  const handleGenreToggle = (genreId: number) => {
    const newGenres = filters.genres.includes(genreId)
      ? filters.genres.filter((id) => id !== genreId)
      : [...filters.genres, genreId];

    const newFilters = { ...filters, genres: newGenres };
    setPage(1); // Reset to page 1 on filter change
    setFilters(newFilters);
    setSearchSubmitted(true);
  };

  const handleYearChange = (values: number[]) => {
    const newFilters = { ...filters, yearRange: values as [number, number] };
    setPage(1); // Reset to page 1 on filter change
    setFilters(newFilters);
    setSearchSubmitted(true);
  };

  const handleRatingChange = (values: number[]) => {
    const newFilters = { ...filters, ratingRange: values as [number, number] };
    setPage(1); // Reset to page 1 on filter change
    setFilters(newFilters);
    setSearchSubmitted(true);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilters({ ...filters, searchQuery: "" });
    setPage(1); // Reset to page 1 on clear search
    setSearchSubmitted(true);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setSearchQuery("");
    setPage(1); // Reset to page 1 on reset filters
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
