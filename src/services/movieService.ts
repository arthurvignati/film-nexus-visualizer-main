
import { Movie, MovieResponse, GenresResponse, FilterOptions, GraphNode, GraphEdge } from "@/types/movie";

const TMDB_API_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMzEyYTA0MTYzODAxMjVmZThlODQwMWI1MjA2MGMwZSIsIm5iZiI6MTc0MzQ2NTc2My45MDEsInN1YiI6IjY3ZWIyZDIzMDNiYWJkY2VkMjdhOWE0YyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.-tb5nI8dlWuLVae0G2YLBvDV948ndMxTw-D7vYka6SE";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

const headers = {
  accept: 'application/json',
  Authorization: `Bearer ${TMDB_API_TOKEN}`
};

export const getImageUrl = (path: string | null, size: string = 'w500'): string => {
  if (!path) return '/placeholder.svg';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const fetchMovies = async (page: number = 1, filter?: FilterOptions): Promise<MovieResponse> => {
  let url = `${BASE_URL}/discover/movie?include_adult=false&include_video=false&language=pt-BR&page=${page}&sort_by=popularity.desc`;
  
  if (filter) {
    // Adiciona filtragem de gênero
    if (filter.genres.length > 0) {
      url += `&with_genres=${filter.genres.join('|')}`;
    }
    
    // Adiciona filtragem por ano
    if (filter.yearRange[0] !== 1900 || filter.yearRange[1] !== new Date().getFullYear()) {
      url += `&primary_release_date.gte=${filter.yearRange[0]}-01-01`;
      url += `&primary_release_date.lte=${filter.yearRange[1]}-12-31`;
    }
    
    // Adiciona filtragem de classificação
    if (filter.ratingRange[0] !== 0 || filter.ratingRange[1] !== 10) {
      url += `&vote_average.gte=${filter.ratingRange[0]}`;
      url += `&vote_average.lte=${filter.ratingRange[1]}`;
    }
  }
  
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    throw new Error('Failed to fetch movies');
  }
  
  return response.json();
};

export const searchMovies = async (query: string, page: number = 1): Promise<MovieResponse> => {
  if (!query.trim()) {
    return fetchMovies(page);
  }
  
  const url = `${BASE_URL}/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=pt-BR&page=${page}`;
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    throw new Error('Failed to search movies');
  }
  
  return response.json();
};

export const fetchGenres = async (): Promise<GenresResponse> => {
  const url = `${BASE_URL}/genre/movie/list?language=pt-BR`;
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    throw new Error('Failed to fetch genres');
  }
  
  return response.json();
};

export const createMovieRecommendationGraph = (movies: Movie[]): { nodes: GraphNode[], edges: GraphEdge[] } => {
  if (!movies.length) return { nodes: [], edges: [] };
  
  // Cria nós para cada filme
  const nodes: GraphNode[] = movies.map((movie, index) => ({
    id: movie.id.toString(),
    type: 'movieNode',
    position: { 
      x: 100 + Math.cos(index * (2 * Math.PI / movies.length)) * 300, 
      y: 100 + Math.sin(index * (2 * Math.PI / movies.length)) * 300 
    },
    data: { 
      movie,
      selected: false
    }
  }));
  
  // Cria limites entre filmes de gêneros semelhantes
  const edges: GraphEdge[] = [];
  
  for (let i = 0; i < movies.length; i++) {
    const movie1 = movies[i];
    
    for (let j = i + 1; j < movies.length; j++) {
      const movie2 = movies[j];
      
      // Encontra gêneros comuns
      const commonGenres = movie1.genre_ids.filter(genre => 
        movie2.genre_ids.includes(genre)
      );
      
      // Se houver gêneros comuns, cria uma vantagem
      if (commonGenres.length > 0) {
        edges.push({
          id: `edge-${movie1.id}-${movie2.id}`,
          source: movie1.id.toString(),
          target: movie2.id.toString(),
          style: { 
            stroke: '#d1d5db', 
            strokeWidth: commonGenres.length * 0.5 + 0.5 
          },
          data: {
            strength: commonGenres.length
          }
        });
      }
    }
  }
  
  return { nodes, edges };
};
