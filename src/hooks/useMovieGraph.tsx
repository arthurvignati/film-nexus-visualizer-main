
import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  applyNodeChanges, 
  applyEdgeChanges
} from "@xyflow/react";
import { Movie, MovieNodeData, MovieEdgeData } from "@/types/movie";
import { createNodes, createEdges } from "@/utils/graphLayout";

export function useMovieGraph(
  movies: Movie[],
  selectedMovieIds: number[],
  recommendedMovies: Movie[] = []
) {
  const [nodes, setNodes] = useState<Node<MovieNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge<MovieEdgeData>[]>([]);
  
  // Store node positions to preserve layout between updates
  const [nodePositions, setNodePositions] = useState<Record<string, {x: number, y: number}>>({});
  
  // Use refs to track previous state to avoid unnecessary updates
  const prevMoviesRef = useRef<Movie[]>([]);
  const prevSelectedIdsRef = useRef<number[]>([]);
  const prevRecommendedMoviesRef = useRef<Movie[]>([]);
  
  // Handle node changes
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds) as Node<MovieNodeData>[]);
  }, []);

  // Handle edge changes
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds) as Edge<MovieEdgeData>[]);
  }, []);
  
  // Preserve node positions when nodes change position
  const onNodeDragStop = useCallback((event: React.MouseEvent, node: Node<MovieNodeData>) => {
    setNodePositions(prev => ({
      ...prev,
      [node.id]: node.position
    }));
  }, []);

  // Update graph when movies, selections, or recommendations change
  useEffect(() => {
    if (movies.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    // Extract IDs for quick lookup
    const recommendedMovieIds = recommendedMovies.map(movie => movie.id);
    
    // Check if we really need to update
    const currentMovieIds = movies.map(m => m.id).sort().join(',');
    const prevMovieIds = prevMoviesRef.current.map(m => m.id).sort().join(',');
    const selectedIdsStr = selectedMovieIds.sort().join(',');
    const prevSelectedIdsStr = prevSelectedIdsRef.current.sort().join(',');
    const recommendedMoviesStr = recommendedMovies.map(m => m.id).sort().join(',');
    const prevRecommendedMoviesStr = prevRecommendedMoviesRef.current.map(m => m.id).sort().join(',');
    
    // Skip update if nothing important changed
    if (
      currentMovieIds === prevMovieIds && 
      selectedIdsStr === prevSelectedIdsStr && 
      recommendedMoviesStr === prevRecommendedMoviesStr &&
      nodes.length > 0
    ) {
      return;
    }
    
    // Update our refs with current state
    prevMoviesRef.current = [...movies];
    prevSelectedIdsRef.current = [...selectedMovieIds];
    prevRecommendedMoviesRef.current = [...recommendedMovies];
    
    // Create nodes from movies
    const newNodes = createNodes(
      movies, 
      selectedMovieIds, 
      recommendedMovieIds, 
      nodePositions
    );
    
    // Store current node positions
    const newPositions: Record<string, {x: number, y: number}> = {};
    newNodes.forEach(node => {
      newPositions[node.id] = node.position;
    });
    setNodePositions(prev => ({ ...prev, ...newPositions }));

    // Create edges between movies that share genres
    const newEdges = createEdges(movies, selectedMovieIds, recommendedMovieIds);

    // Update nodes and edges
    setNodes(newNodes);
    setEdges(newEdges);
    
  }, [movies, selectedMovieIds, recommendedMovies, nodePositions]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onNodeDragStop
  };
}
