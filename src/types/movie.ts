
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

// Define custom data for movie nodes
export interface MovieNodeData {
  movie: Movie;
  selected: boolean;
  recommended?: boolean;
  [key: string]: unknown; // Add index signature for compatibility with ReactFlow
}

// Define custom data for movie edges
export interface MovieEdgeData {
  commonGenres?: number[]; // Store the common genres between movies
  strength?: number;       // Number of common genres (edge weight)
  recommended?: boolean;
  [key: string]: unknown; // Add index signature for compatibility with ReactFlow
}

// Define our custom node and edge types
export type GraphNode = Node<MovieNodeData>;
export type GraphEdge = Edge<MovieEdgeData>;
