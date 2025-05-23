
import { useState, useEffect, useRef, useCallback, memo } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useReactFlow,
  BackgroundVariant,
  NodeTypes,
  EdgeTypes,
  EdgeProps,
  getBezierPath
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import MovieNode from "@/components/MovieNode";
import { Movie } from "@/types/movie";
import { useMovieGraph } from "@/hooks/useMovieGraph";
import { MovieGraphControls } from "@/components/MovieGraphControls";
import { MovieGraphAnalytics } from "@/components/MovieGraphAnalytics";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MovieGraphProps {
  movies: Movie[];
  selectedMovieIds: number[];
  recommendedMovies?: Movie[];
  onNodeClick?: (movieId: number) => void;
}

// Defina os tipos de nós com a tipagem correta para ReactFlow
const nodeTypes: NodeTypes = {
  movieNode: MovieNode
};

// Borda personalizada com rótulo de peso usando digitação adequada para ReactFlow
const WeightedEdge = memo(({
  id,
  data,
  style,
  markerEnd,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  labelStyle,
  label
}: EdgeProps) => {
  
  // Calcular caminho para a aresta
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });

  // Obtenha força com dados de ponta
  const weight = data?.strength || '';

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {weight !== '' && (
        <text
          style={{
            fontSize: '10px',
            fontWeight: 'bold',
            fill: '#000',
            stroke: '#000',
            strokeWidth: '0.3px',
            paintOrder: 'stroke',
            background: '#fff'
          }}
          dy={-4}
          textAnchor="middle"
        >
          <textPath
            href={`#${id}`}
            startOffset="50%"
            dominantBaseline="text-before-edge"
          >
            {weight.toString()}
          </textPath>
        </text>
      )}
    </>
  );
});

WeightedEdge.displayName = 'WeightedEdge';

// Definir tipos de arestas
const edgeTypes: EdgeTypes = {
  weighted: WeightedEdge
};

export function MovieGraph({
  movies,
  selectedMovieIds,
  recommendedMovies = [],
  onNodeClick
}: MovieGraphProps) {
  const { fitView } = useReactFlow();
  // Padrão para 6 recomendações, limitado entre 6 e 12
  const [maxRecommendations, setMaxRecommendations] = useState(6);
  const [showSelectedMoviesOnly, setShowSelectedMoviesOnly] = useState(false);
  const fitViewTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Filtrar filmes com base no modo de visualização selecionado
  const moviesToDisplay = showSelectedMoviesOnly
    ? selectedMovieIds.map(id => movies.find(movie => movie.id === id)).filter(Boolean) as Movie[]
    : [...selectedMovieIds.map(id => movies.find(movie => movie.id === id)).filter(Boolean) as Movie[],
    ...recommendedMovies.slice(0, maxRecommendations)];

  // Gancho personalizado para gerenciamento de grafos com filmes filtrados
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onNodeDragStop
  } = useMovieGraph(
    moviesToDisplay,
    selectedMovieIds,
    showSelectedMoviesOnly ? [] : recommendedMovies.slice(0, maxRecommendations)
  );

  // Processa as bordas para adicionar rótulos de peso - sempre mostre os pesos
  const edgesWithWeights = edges.map(edge => ({
    ...edge,
    type: 'weighted'
  }));

  // Calcula a altura do contêiner - garantir a altura total com o mínimo
  const graphContainerStyle = {
    height: '100%',
    minHeight: '40vh',
    flex: '1'
  };

  useEffect(() => {
    if (nodes.length > 0) {
      // Limpar qualquer tempo limite existente
      if (fitViewTimeoutRef.current) {
        clearTimeout(fitViewTimeoutRef.current);
      }

      // Ajustar a visualização após um breve atraso para garantir que os nós sejam renderizados
      fitViewTimeoutRef.current = setTimeout(() => {
        fitView({ padding: 0.2 });
      }, 100);
    }

    // Tempo limite de limpeza na desmontagem
    return () => {
      if (fitViewTimeoutRef.current) {
        clearTimeout(fitViewTimeoutRef.current);
      }
    };
  }, [fitView, nodes.length, showSelectedMoviesOnly]);

  // Definir nó selecionado com base em selectedMovieIds
  useEffect(() => {
    if (selectedMovieIds.length > 0) {
      setSelectedNode(selectedMovieIds[selectedMovieIds.length - 1].toString());
    } else {
      setSelectedNode(null);
    }
  }, [selectedMovieIds]);

  const handleMaxRecommendationsChange = (value: number) => {
    // Garantir que a recomendação máxima esteja entre 6 e 12
    const clamped = Math.max(6, Math.min(12, value));
    setMaxRecommendations(clamped);
  };

  const handleShowSelectedMoviesOnlyChange = (value: boolean) => {
    setShowSelectedMoviesOnly(value);
  };

  // Alterado para atualizar apenas o nó selecionado para análise, não alternar a seleção
  const handleNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    const movieId = parseInt(node.id);
    if (!isNaN(movieId)) {
      // Atualizar apenas o nó selecionado para análise
      setSelectedNode(node.id);
    }
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-card rounded-lg overflow-hidden">
      <MovieGraphControls
        maxRecommendations={maxRecommendations}
        onMaxRecommendationsChange={handleMaxRecommendationsChange}
        showSelectedMoviesOnly={showSelectedMoviesOnly}
        onShowSelectedMoviesOnlyChange={handleShowSelectedMoviesOnlyChange}
        minRecommendations={6}
        maxRecommendationsLimit={12}
      />
      <div className="h-1/6">
        <ReactFlow
          nodes={nodes}
          edges={edgesWithWeights}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={onNodeDragStop}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          className="bg-muted/30"
          panOnScroll
          selectionOnDrag
          nodesDraggable={true}
          elementsSelectable={true}
          zoomOnScroll={true}
          panOnDrag={true}
        >
          <Background color="#ccc" variant={BackgroundVariant.Dots} />
          <Controls className="bg-background border border-border shadow-md" />
          <MiniMap
            nodeStrokeWidth={3}
            zoomable
            pannable
            nodeBorderRadius={5}
            className="bg-background/90 border border-border"
          />
        </ReactFlow>
      </div>
      {nodes.length > 0 && (
        <div className="p-2 border-t border-border">
          <MovieGraphAnalytics
            nodes={nodes}
            edges={edges}
            movies={moviesToDisplay}
            selectedMovieId={selectedNode}
          />
        </div>
      )}
    </div>
  );
}
