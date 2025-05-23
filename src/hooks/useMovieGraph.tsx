
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
  
  // Armazena as posições dos nós para preservar o layout entre as atualizações
  const [nodePositions, setNodePositions] = useState<Record<string, {x: number, y: number}>>({});
  
  // Usa referências para rastrear o estado anterior e evitar atualizações desnecessárias
  const prevMoviesRef = useRef<Movie[]>([]);
  const prevSelectedIdsRef = useRef<number[]>([]);
  const prevRecommendedMoviesRef = useRef<Movie[]>([]);
  
  // Lida com alterações de nó
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds) as Node<MovieNodeData>[]);
  }, []);

  // Lida com alterações de borda
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds) as Edge<MovieEdgeData>[]);
  }, []);
  
  // Preserva posições de nós quando os nós mudam de posição
  const onNodeDragStop = useCallback((event: React.MouseEvent, node: Node<MovieNodeData>) => {
    setNodePositions(prev => ({
      ...prev,
      [node.id]: node.position
    }));
  }, []);

  // Atualiza grafo quando filmes, seleções ou recomendações mudarem
  useEffect(() => {
    if (movies.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    // Extrair IDs para consulta rápida
    const recommendedMovieIds = recommendedMovies.map(movie => movie.id);
    
    // Verificar se realmente precisamos atualizar
    const currentMovieIds = movies.map(m => m.id).sort().join(',');
    const prevMovieIds = prevMoviesRef.current.map(m => m.id).sort().join(',');
    const selectedIdsStr = selectedMovieIds.sort().join(',');
    const prevSelectedIdsStr = prevSelectedIdsRef.current.sort().join(',');
    const recommendedMoviesStr = recommendedMovies.map(m => m.id).sort().join(',');
    const prevRecommendedMoviesStr = prevRecommendedMoviesRef.current.map(m => m.id).sort().join(',');
    
    // Pular atualização se nada importante mudou
    if (
      currentMovieIds === prevMovieIds && 
      selectedIdsStr === prevSelectedIdsStr && 
      recommendedMoviesStr === prevRecommendedMoviesStr &&
      nodes.length > 0
    ) {
      return;
    }
    
    // Atualizar nossas referências com o estado atual
    prevMoviesRef.current = [...movies];
    prevSelectedIdsRef.current = [...selectedMovieIds];
    prevRecommendedMoviesRef.current = [...recommendedMovies];
    
    // Criar nós a partir de filmes
    const newNodes = createNodes(
      movies, 
      selectedMovieIds, 
      recommendedMovieIds, 
      nodePositions
    );
    
    // Armazena as posições atuais dos nós
    const newPositions: Record<string, {x: number, y: number}> = {};
    newNodes.forEach(node => {
      newPositions[node.id] = node.position;
    });
    setNodePositions(prev => ({ ...prev, ...newPositions }));

    // Cria limites entre filmes que compartilham gêneros
    const newEdges = createEdges(movies, selectedMovieIds, recommendedMovieIds);

    // Atualiza nós e arestas
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
