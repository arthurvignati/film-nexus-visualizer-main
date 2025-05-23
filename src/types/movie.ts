
import { Node, Edge } from "@xyflow/react";

export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
  genre_ids: number[];
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface GenresResponse {
  genres: Genre[];
}

export interface FilterOptions {
  genres: number[];
  yearRange: [number, number];
  ratingRange: [number, number];
  searchQuery: string;
}

// Define dados personalizados para nós de filme
export interface MovieNodeData {
  movie: Movie;
  selected: boolean;
  recommended?: boolean;
  [key: string]: unknown; // Adiciona assinatura de índice para compatibilidade com ReactFlow
}

// Definir dados personalizados para bordas de filme
export interface MovieEdgeData {
  commonGenres?: number[]; // Armazene os gêneros comuns entre os filmes
  strength?: number;       // Número de gêneros comuns (peso da borda)
  recommended?: boolean;
  [key: string]: unknown; // Adicionar assinatura de índice para compatibilidade com ReactFlow
}

// Defina nossos tipos de nós e arestas personalizados
export type GraphNode = Node<MovieNodeData>;
export type GraphEdge = Edge<MovieEdgeData>;
