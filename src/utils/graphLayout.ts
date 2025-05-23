import { Movie } from "@/types/movie";
import { Node, Edge, Position, MarkerType } from "@xyflow/react";
import { MovieNodeData, MovieEdgeData } from "@/types/movie";
import { AdjListNode, dijkstraShortestPathJS, convertAdjacencyListFormat } from "./dijkstraJSAdapted";

// Posicionamento de layout direcionado por força com mecanismo anti-sobreposição aprimorado
export const generateForceDirectedLayout = (
  movies: Movie[], 
  width = 800, 
  height = 700, 
  iterations = 150 // Aumento de iterações para melhor layout
) => {
  const positions: Record<string, {x: number, y: number}> = {};
  const nodes: Array<{id: string, x: number, y: number, vx: number, vy: number}> = [];
  
  // Inicializar posições em um padrão de grade em vez de aleatório para reduzir sobreposições iniciais
  const moviesPerRow = Math.ceil(Math.sqrt(movies.length));
  const cellWidth = width / (moviesPerRow + 1);
  const cellHeight = height / (Math.ceil(movies.length / moviesPerRow) + 1);
  
  movies.forEach((movie, index) => {
    const id = movie.id.toString();
    const row = Math.floor(index / moviesPerRow);
    const col = index % moviesPerRow;
    
    // Adicionar alguma aleatoriedade inicial dentro da célula
    const x = (col + 1) * cellWidth + (Math.random() - 0.5) * cellWidth * 0.5;
    const y = (row + 1) * cellHeight + (Math.random() - 0.5) * cellHeight * 0.5;
    
    nodes.push({ id, x, y, vx: 0, vy: 0 });
  });
  
  // Executar iterações de algoritmos direcionados por força
  const repulsionFactor = 5000; // Aumento da força de repulsão
  const minDistance = 180;      // Aumento da distância mínima entre nós
  
  for (let i = 0; i < iterations; i++) {
    // Calcular forças entre todos os pares de nós
    for (let j = 0; j < nodes.length; j++) {
      const nodeA = nodes[j];
      
      for (let k = j + 1; k < nodes.length; k++) {
        const nodeB = nodes[k];
        
        // Calcular distância e direção
        const dx = nodeB.x - nodeA.x;
        const dy = nodeB.y - nodeA.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        
        // Aplicar força repulsiva se os nós estiverem muito próximos
        if (distance < minDistance) {
          const force = repulsionFactor / (distance * distance);
          const forceX = (dx / distance) * force;
          const forceY = (dy / distance) * force;
          
          nodeA.vx -= forceX;
          nodeA.vy -= forceY;
          nodeB.vx += forceX;
          nodeB.vy += forceY;
        }
      }
    }
    
    // Atualizar posições com base nas velocidades
    for (const node of nodes) {
      node.x += node.vx * 0.1;
      node.y += node.vy * 0.1;
      node.vx *= 0.9; // Damping
      node.vy *= 0.9; // Damping
      
      // Mantem os nós dentro dos limites com preenchimento
      const padding = 120; // Aumento do preenchimento para evitar bordas
      node.x = Math.max(padding, Math.min(width - padding, node.x));
      node.y = Math.max(padding, Math.min(height - padding, node.y));
    }
  }
  
  // Armazenar posições finais
  nodes.forEach(node => {
    positions[node.id] = { x: node.x, y: node.y };
  });
  
  return positions;
};

// Auxiliar para layout de círculo (backup se necessário)
export const generateCircleLayout = (movies: Movie[], radius: number = 300) => {
  const positions: Record<string, {x: number, y: number}> = {};
  
  movies.forEach((movie, index) => {
    const angle = (index / movies.length) * 2 * Math.PI;
    const x = 400 + radius * Math.cos(angle);
    const y = 350 + radius * Math.sin(angle);
    
    positions[movie.id.toString()] = { x, y };
  });
  
  return positions;
};

// Auxiliar para criar nós a partir de filmes
export const createNodes = (
  movies: Movie[], 
  selectedMovieIds: number[],
  recommendedMovieIds: number[],
  nodePositions: Record<string, {x: number, y: number}>
): Node<MovieNodeData>[] => {
  if (movies.length === 0) return [];
  
  // Gerar novo layout se não tivermos posições para todos os filmes
  const needNewLayout = movies.some(movie => 
    !nodePositions[movie.id.toString()]
  );
  
  const newLayout = needNewLayout 
    ? generateForceDirectedLayout(movies) 
    : {};
  
  return movies.map((movie) => {
    const isSelected = selectedMovieIds.includes(movie.id);
    const isRecommended = recommendedMovieIds.includes(movie.id) && !isSelected;
    const movieId = movie.id.toString();
    
    // Usa a posição existente se disponível, caso contrário, use novas posições de layout
    const position = nodePositions[movieId] || newLayout[movieId] || { 
      x: 400 + Math.random() * 300, 
      y: 350 + Math.random() * 300 
    };
    
    // Cria o nó com os dados do filme
    return {
      id: movieId,
      type: 'movieNode',
      position,
      data: {
        movie,
        selected: isSelected,
        recommended: isRecommended
      }
    };
  });
};

// Construir lista de adjacências a partir de nós e arestas para algoritmos de grafos
export const buildAdjacencyList = (movies: Movie[], edges: Edge<MovieEdgeData>[]): Map<string, string[]> => {
  const adjacencyList = new Map<string, string[]>();
  
  // Inicializar matrizes vazias para todos os nós
  movies.forEach(movie => {
    adjacencyList.set(movie.id.toString(), []);
  });
  
  // Adicionar conexões de bordas
  edges.forEach(edge => {
    // Para um grafo não direcionado, adicione ambas as direções
    const source = edge.source;
    const target = edge.target;
    
    if (adjacencyList.has(source)) {
      adjacencyList.get(source)!.push(target);
    }
    
    if (adjacencyList.has(target)) {
      adjacencyList.get(target)!.push(source);
    }
  });
  
  return adjacencyList;
};

// Percurso em Profundidade
export const depthFirstSearch = (
  adjacencyList: Map<string, string[]>, 
  startNodeId: string
): string[] => {
  const visited: Set<string> = new Set();
  const result: string[] = [];
  
  const dfs = (nodeId: string) => {
    if (!adjacencyList.has(nodeId)) return;
    
    visited.add(nodeId);
    result.push(nodeId);
    
    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      }
    }
  };
  
  dfs(startNodeId);
  return result;
};

// Percurso em Largura
export const breadthFirstSearch = (
  adjacencyList: Map<string, string[]>, 
  startNodeId: string
): string[] => {
  const visited: Set<string> = new Set();
  const result: string[] = [];
  const queue: string[] = [startNodeId];
  
  visited.add(startNodeId);
  
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    result.push(nodeId);
    
    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  
  return result;
};

// Checa se o grafo está conectado
export const isGraphConnected = (
  adjacencyList: Map<string, string[]>
): boolean => {
  if (adjacencyList.size === 0) return true;
  
  // Obtêm o primeiro nó como ponto de partida
  const startNodeId = Array.from(adjacencyList.keys())[0];
  
  // Executa Percurso em Profundidade pelo primeiro nó
  const visited = new Set<string>();
  
  const dfs = (nodeId: string) => {
    visited.add(nodeId);
    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      }
    }
  };
  
  dfs(startNodeId);
  
  // Se todos os nós foram visitados, o grafo é conectado
  return visited.size === adjacencyList.size;
};

// Auxilia para criar bordas entre filmes
export const createEdges = (
  movies: Movie[],
  selectedMovieIds: number[],
  recommendedMovieIds: number[]
): Edge<MovieEdgeData>[] => {
  const edges: Edge<MovieEdgeData>[] = [];
  
  // Gerar arestas para todos os filmes que compartilham pelo menos um gênero
  for (let i = 0; i < movies.length; i++) {
    const movie1 = movies[i];
    const isMovie1Selected = selectedMovieIds.includes(movie1.id);
    const isMovie1Recommended = recommendedMovieIds.includes(movie1.id);
    
    for (let j = i + 1; j < movies.length; j++) {
      const movie2 = movies[j];
      const isMovie2Selected = selectedMovieIds.includes(movie2.id);
      const isMovie2Recommended = recommendedMovieIds.includes(movie2.id);
      
      // Encontrar gêneros comuns
      const commonGenres = movie1.genre_ids.filter(genre => 
        movie2.genre_ids.includes(genre)
      );
      
      // Cria uma vantagem apenas se houver gêneros comuns
      if (commonGenres.length > 0) {
        // Determina a cor e o estilo das bordas com base no status da seleção do filme
        let strokeColor = '#d1d5db'; // Cinza claro padrão
        let strokeWidth = 1;
        let animated = false;
        
        // Both selected - red edge
        if (isMovie1Selected && isMovie2Selected) {
          strokeColor = '#ea384c'; // Cor vermelha
          strokeWidth = 2;
          animated = true;
        } 
        // Um selecionado e um recomendado - blue edge
        else if ((isMovie1Selected && isMovie2Recommended) || 
                (isMovie1Recommended && isMovie2Selected)) {
          strokeColor = '#3b82f6'; // blue-500
          strokeWidth = 1.5;
          animated = true;
        }
        // Um ou ambos são recomendados - lighter blue edge
        else if (isMovie1Recommended || isMovie2Recommended) {
          strokeColor = '#60a5fa'; // blue-400
          strokeWidth = 1;
        }
        // Um nó está selecionado - gray edge
        else if (isMovie1Selected || isMovie2Selected) {
          strokeColor = '#9ca3af'; // gray-400
          strokeWidth = 1;
        }
        
        edges.push({
          id: `edge-${movie1.id}-${movie2.id}`,
          source: movie1.id.toString(),
          target: movie2.id.toString(),
          animated,
          style: { 
            stroke: strokeColor, 
            strokeWidth
          },
          markerEnd: {
            type: MarkerType.Arrow,
            color: strokeColor,
          },
          data: {
            commonGenres: commonGenres,
            strength: commonGenres.length
          }
        });
      }
    }
  }
  
  return edges;
};

// Implementação do algoritmo de Dijkstra corrigida usando a nova versão adaptada para JS
export const dijkstraShortestPath = (
  adjacencyList: Map<string, string[]>,
  edgeWeights: Map<string, number>,
  startNodeId: string,
  endNodeId: string
): { path: string[], distance: number } => {
  // Converte a lista de adjacência padrão para o formato exigido pelo dijkstraJS
  const convertedList = convertAdjacencyListFormat(adjacencyList, edgeWeights);
  
  // Executar o algoritmo de Dijkstra aprimorado
  return dijkstraShortestPathJS(convertedList, startNodeId, endNodeId);
};

// Função auxiliar para criar mapa de pesos de aresta para Dijkstra e Kruskal
export const createEdgeWeightsMap = (edges: Edge<MovieEdgeData>[]): Map<string, number> => {
  const weightMap = new Map<string, number>();
  
  edges.forEach(edge => {
    const sourceTarget = `${edge.source}-${edge.target}`;
    // Usar o inverso da força dos gêneros comuns como peso
    // Gêneros mais comuns = conexão mais forte = menor peso
    const weight = edge.data?.strength 
      ? 1 / (edge.data.strength) 
      : 1;  // Peso padrão se a força não estiver disponível
    
    weightMap.set(sourceTarget, weight);
  });
  
  return weightMap;
};

// Implementação do algoritmo de Kruskal
export interface KruskalEdge {
  source: string;
  target: string;
  weight: number;
}

export const findMinimumSpanningTree = (
  nodes: string[],
  edges: Edge<MovieEdgeData>[]
): KruskalEdge[] => {
  // Criar uma estrutura de dados de conjunto disjunto
  const parent: Record<string, string> = {};
  const rank: Record<string, number> = {};
  
  // Inicializar conjunto disjunto
  nodes.forEach(node => {
    parent[node] = node;
    rank[node] = 0;
  });
  
  // Encontrar operação com compressão de caminho
  const find = (node: string): string => {
    if (parent[node] !== node) {
      parent[node] = find(parent[node]);
    }
    return parent[node];
  };
  
  // Operação sindical com classificação
  const union = (node1: string, node2: string): void => {
    const root1 = find(node1);
    const root2 = find(node2);
    
    if (root1 === root2) return;
    
    if (rank[root1] < rank[root2]) {
      parent[root1] = root2;
    } else if (rank[root1] > rank[root2]) {
      parent[root2] = root1;
    } else {
      parent[root2] = root1;
      rank[root1]++;
    }
  };
  
  // Converter arestas para um formato adequado ao algoritmo de Kruskal
  const kruskalEdges: KruskalEdge[] = [];
  const edgeSet = new Set(); // Para evitar arestas duplicadas em grafos não direcionados
  
  edges.forEach(edge => {
    const sourceTarget = `${edge.source}-${edge.target}`;
    const targetSource = `${edge.target}-${edge.source}`;
    
    // Evite adicionar arestas duplicadas em grafos não direcionados
    if (edgeSet.has(sourceTarget) || edgeSet.has(targetSource)) {
      return;
    }
    
    edgeSet.add(sourceTarget);
    
    // Usar o inverso da força dos gêneros comuns como peso
    // Gêneros mais comuns = conexão mais forte = menor peso
    const weight = edge.data?.strength 
      ? 1 / (edge.data.strength) 
      : 1;  // Peso padrão se a força não estiver disponível
      
    kruskalEdges.push({
      source: edge.source,
      target: edge.target,
      weight
    });
  });
  
  // Classificar arestas por peso (crescente)
  kruskalEdges.sort((a, b) => a.weight - b.weight);
  
  // Aplicar o algoritmo de Kruskal
  const mst: KruskalEdge[] = [];
  
  for (const edge of kruskalEdges) {
    if (find(edge.source) !== find(edge.target)) {
      mst.push(edge);
      union(edge.source, edge.target);
    }
    
    // Se tivermos n-1 arestas, formamos o MST
    if (mst.length === nodes.length - 1) {
      break;
    }
  }
  
  return mst;
};

// Converter árvore de extensão mínima em ordem de travessia de grafo
export const getMstTraversalOrder = (
  mst: KruskalEdge[],
  startNodeId: string
): string[] => {
  // Criar lista de adjacências a partir do MST
  const mstAdjacencyList: Map<string, string[]> = new Map();
  
  mst.forEach(edge => {
    if (!mstAdjacencyList.has(edge.source)) {
      mstAdjacencyList.set(edge.source, []);
    }
    if (!mstAdjacencyList.has(edge.target)) {
      mstAdjacencyList.set(edge.target, []);
    }
    
    mstAdjacencyList.get(edge.source)!.push(edge.target);
    mstAdjacencyList.get(edge.target)!.push(edge.source);
  });
  
  // Faça um DFS no MST começando pelo startNodeId
  const visited = new Set<string>();
  const result: string[] = [];
  
  const dfs = (nodeId: string) => {
    if (!mstAdjacencyList.has(nodeId)) return;
    
    visited.add(nodeId);
    result.push(nodeId);
    
    const neighbors = mstAdjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      }
    }
  };
  
  dfs(startNodeId);
  
  return result;
};
