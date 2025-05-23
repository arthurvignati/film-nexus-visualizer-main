
import React, { useEffect, useState } from 'react';
import { Node, Edge } from '@xyflow/react';
import { MovieNodeData, MovieEdgeData, Movie } from '@/types/movie';
import {
  buildAdjacencyList,
  depthFirstSearch,
  breadthFirstSearch,
  isGraphConnected,
  dijkstraShortestPath,
  createEdgeWeightsMap,
  findMinimumSpanningTree,
  getMstTraversalOrder,
  KruskalEdge
} from '@/utils/graphLayout';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardImage } from "@/components/ui/card";
import { StarIcon } from "lucide-react";
import { getImageUrl } from "@/services/movieService";

interface MovieGraphAnalyticsProps {
  nodes: Node<MovieNodeData>[];
  edges: Edge<MovieEdgeData>[];
  movies: Movie[];
  selectedMovieId: string | null;
}

export function MovieGraphAnalytics({
  nodes,
  edges,
  movies,
  selectedMovieId
}: MovieGraphAnalyticsProps) {
  const [dfsResult, setDfsResult] = useState<string[]>([]);
  const [bfsResult, setBfsResult] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [traversalStartNodeId, setTraversalStartNodeId] = useState<string | null>(null);
  const [endNodeId, setEndNodeId] = useState<string | null>(null);
  const [shortestPath, setShortestPath] = useState<{ path: string[], distance: number } | null>(null);
  const [minimumSpanningTree, setMinimumSpanningTree] = useState<string[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  // Executa algoritmos de grafos quando nós, arestas ou filmes selecionados forem alterados
  useEffect(() => {
    if (nodes.length > 0 && edges.length > 0) {
      // Atualiza informações do filme selecionado
      if (selectedMovieId) {
        const movie = movies.find(m => m.id.toString() === selectedMovieId);
        setSelectedMovie(movie || null);
      } else {
        setSelectedMovie(null);
      }

      // Constrói lista de adjacências
      const adjacencyList = buildAdjacencyList(movies, edges);

      // Verifica a conectividade
      const connected = isGraphConnected(adjacencyList);
      setIsConnected(connected);

      // Determina o nó inicial para travessias
      const startNodeId = selectedMovieId || nodes[0].id;
      setTraversalStartNodeId(startNodeId);

      // Executa DFS e BFS se tivermos um nó inicial válido
      if (startNodeId && adjacencyList.has(startNodeId)) {
        const dfs = depthFirstSearch(adjacencyList, startNodeId);
        const bfs = breadthFirstSearch(adjacencyList, startNodeId);

        setDfsResult(dfs);
        setBfsResult(bfs);

        // Define o nó final padrão se ainda não estiver definido ou se não existir mais
        if (!endNodeId || !adjacencyList.has(endNodeId)) {
          // Escolhe um nó que não seja o nó inicial, se possível
          const otherNodes = Array.from(adjacencyList.keys()).filter(id => id !== startNodeId);
          if (otherNodes.length > 0) {
            setEndNodeId(otherNodes[0]);
          } else {
            setEndNodeId(startNodeId); // Retorna ao nó inicial se não houver outros nós
          }
        }

        // Cria pesos de aresta para o caminho mais curto e MST
        const edgeWeights = createEdgeWeightsMap(edges);

        // Executa Dijkstra se tivermos nós inicial e final
        if (startNodeId && endNodeId) {
          console.log(`Running Dijkstra from ${startNodeId} to ${endNodeId}`);
          const path = dijkstraShortestPath(adjacencyList, edgeWeights, startNodeId, endNodeId);
          setShortestPath(path);
          console.log("Dijkstra result:", path);
        }

        // Executa Kruskal para encontrar a árvore de extensão mínima
        const nodeIds = Array.from(adjacencyList.keys());
        const mst = findMinimumSpanningTree(nodeIds, edges);
        const mstTraversal = getMstTraversalOrder(mst, startNodeId);
        setMinimumSpanningTree(mstTraversal);
      }
    } else {
      // Redefine resultados se não houver nós/arestas
      setDfsResult([]);
      setBfsResult([]);
      setIsConnected(false);
      setTraversalStartNodeId(null);
      setEndNodeId(null);
      setShortestPath(null);
      setMinimumSpanningTree([]);
      setSelectedMovie(null);
    }
  }, [nodes, edges, selectedMovieId, movies, endNodeId]);

  // Encontra o título do filme por ID
  const getMovieTitle = (movieId: string): string => {
    const movie = movies.find(m => m.id.toString() === movieId);
    return movie ? movie.title : movieId;
  };

  // Manipula seleção de nó final para caminho mais curto
  const handleEndNodeChange = (value: string) => {
    setEndNodeId(value);
  };

  return (
    <div className="border rounded-lg bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Análise do Grafo</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Conexividade:</span>
          {isConnected ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                    Conexo
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Todos os nós possuem ligação</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                    Desconexo
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Alguns não podem ser alcançados por outros</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {selectedMovie && (
        <Card className="p-3 bg-muted/30 overflow-hidden">
          <div className="flex">
            {/* Filme poster */}
            <div className="w-1/4 mr-3">
              <CardImage
                src={getImageUrl(selectedMovie.poster_path)}
                alt={selectedMovie.title}
                containerClassName="h-24 w-auto rounded-md"
              />
            </div>
            {/* Filme informações */}
            <div className="w-3/4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filme Selecionado</h4>
                <div className="flex items-center">
                  <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm">{selectedMovie.vote_average?.toFixed(1) || "N/A"}</span>
                </div>
              </div>
              <h5 className="text-sm font-semibold">{selectedMovie.title}</h5>
              <div className="flex flex-wrap gap-1">
                {selectedMovie.genre_ids.map(genreId => (
                  <Badge key={genreId} variant="secondary" className="text-xs">
                    {genreId}
                  </Badge>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                {selectedMovie.release_date?.substring(0, 4) || "Unknown year"}
              </div>
            </div>
          </div>
        </Card>
      )}

      {traversalStartNodeId && (
        <div className="text-sm text-muted-foreground">
          A partir de: <span className="font-medium">{getMovieTitle(traversalStartNodeId)}</span>
        </div>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="dfs">
          <AccordionTrigger>Percurso em Profundidade (DFS)</AccordionTrigger>
          <AccordionContent>
            <div className="max-h-40 overflow-y-auto">
              <ol className="list-decimal pl-5 space-y-1">
                {dfsResult.map((nodeId, index) => (
                  <li key={`dfs-${nodeId}-${index}`} className="text-sm">
                    {getMovieTitle(nodeId)}
                  </li>
                ))}
              </ol>
              {dfsResult.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  Nenhum resultado encontrado.
                </p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="bfs">
          <AccordionTrigger>Percurso em largura (BFS)</AccordionTrigger>
          <AccordionContent>
            <div className="max-h-40 overflow-y-auto">
              <ol className="list-decimal pl-5 space-y-1">
                {bfsResult.map((nodeId, index) => (
                  <li key={`bfs-${nodeId}-${index}`} className="text-sm">
                    {getMovieTitle(nodeId)}
                  </li>
                ))}
              </ol>
              {bfsResult.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  Nenhum resultado encontrado.
                </p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="dijkstra">
          <AccordionTrigger>Caminho Mais Curto (Dijkstra)</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="end-node" className="text-sm whitespace-nowrap">
                  Destination:
                </Label>
                <Select value={endNodeId || ''} onValueChange={handleEndNodeChange}>
                  <SelectTrigger className="h-8 w-full">
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {nodes.map(node => (
                        <SelectItem
                          key={node.id}
                          value={node.id}
                          disabled={node.id === traversalStartNodeId}
                        >
                          {getMovieTitle(node.id)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {shortestPath ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Distância:</span>
                    <Badge variant="secondary" className="text-xs">
                      {shortestPath.distance !== Infinity
                        ? shortestPath.distance.toFixed(2)
                        : "∞"}
                    </Badge>
                  </div>

                  {shortestPath.path.length > 0 && shortestPath.distance !== Infinity ? (
                    <div className="max-h-40 overflow-y-auto">
                      <ol className="list-decimal pl-5 space-y-1">
                        {shortestPath.path.map((nodeId, index) => (
                          <li key={`path-${nodeId}-${index}`} className="text-sm">
                            {getMovieTitle(nodeId)}
                          </li>
                        ))}
                      </ol>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                       Nenhum caminho encontrado
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                   Nenhum caminho encontrado
                </p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="kruskal">
          <AccordionTrigger>Árvore Geradora Mínima (Kruskal)</AccordionTrigger>
          <AccordionContent>
            <div className="max-h-40 overflow-y-auto">
              <ol className="list-decimal pl-5 space-y-1">
                {minimumSpanningTree.map((nodeId, index) => (
                  <li key={`mst-${nodeId}-${index}`} className="text-sm">
                    {getMovieTitle(nodeId)}
                  </li>
                ))}
              </ol>
              {minimumSpanningTree.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  Nenhuma árvore possível
                </p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="text-xs text-muted-foreground mt-4">
        Selecione um filme para usar como ponto de partida.
      </div>
    </div>
  );
}
