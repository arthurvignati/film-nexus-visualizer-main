
/**
 * Nó da lista de adjacência
 */
export class AdjListNode {
  constructor(
    /** ID do nó de destino */
    public dest: string,
    /** peso da aresta */
    public weight: number
  ) {}
}

/**
 * Versão "vanilla JS" do Dijkstra, adaptada para IDs string
 * @param adjacencyList Map de cada nó para lista de { dest, weight }
 * @param source ID de nó de partida
 * @returns objeto com distâncias mínimas para todos os nós
 */
export function dijkstraJS(
  adjacencyList: Map<string, AdjListNode[]>,
  source: string
): Record<string, number> {
  const dist: Record<string, number> = {};
  const visited: Record<string, boolean> = {};

  // Inicializa distâncias e visited
  for (const node of adjacencyList.keys()) {
    dist[node] = Infinity;
    visited[node] = false;
  }
  dist[source] = 0;

  // Para cada vértice
  const V = adjacencyList.size;
  for (let i = 0; i < V - 1; i++) {
    // Encontra o nó não visitado com menor distância
    let u: string | null = null;
    let best = Infinity;
    for (const node of Object.keys(dist)) {
      if (!visited[node] && dist[node] < best) {
        best = dist[node];
        u = node;
      }
    }
    if (u === null) break;
    visited[u] = true;

    // Relaxa todas as arestas saindo de u
    for (const { dest, weight } of adjacencyList.get(u) || []) {
      if (!visited[dest] && dist[u] + weight < dist[dest]) {
        dist[dest] = dist[u] + weight;
      }
    }
  }

  return dist;
}

/**
 * Calcula o caminho mais curto da origem ao destino usando o algoritmo de Dijkstra
 * @param adjacencyList Mapa de cada nó para uma lista de seus vizinhos com pesos
 * @param source ID do nó inicial
 * @param target ID do nó de destino
 * @returns Objeto contendo a matriz de caminho e a distância total
 */
export function dijkstraShortestPathJS(
  adjacencyList: Map<string, AdjListNode[]>,
  source: string,
  target: string
): { path: string[], distance: number } {
  // Distâncias de trilha e nós anteriores para reconstrução de caminho
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visited: Record<string, boolean> = {};

  // Inicializar distâncias, nós anteriores e status visitados
  for (const node of adjacencyList.keys()) {
    dist[node] = Infinity;
    prev[node] = null;
    visited[node] = false;
  }
  dist[source] = 0;

  const V = adjacencyList.size;
  for (let i = 0; i < V - 1; i++) {
    // Encontre um nó não visitado com distância mínima
    let u: string | null = null;
    let best = Infinity;
    
    for (const node of Object.keys(dist)) {
      if (!visited[node] && dist[node] < best) {
        best = dist[node];
        u = node;
      }
    }
    
    if (u === null) break;
    if (u === target) break; // Saída antecipada se atingirmos a meta
    
    visited[u] = true;

    // Atualiza distâncias para vizinhos
    for (const { dest, weight } of adjacencyList.get(u) || []) {
      const alt = dist[u] + weight;
      if (!visited[dest] && alt < dist[dest]) {
        dist[dest] = alt;
        prev[dest] = u;
      }
    }
  }

  // Reconstruir o caminho mais curto
  const path: string[] = [];
  let current: string | null = target;
  
  // Se o alvo não for alcançável, retorne o caminho vazio
  if (dist[target] === Infinity) {
    return { path: [], distance: Infinity };
  }
  
  // Construa o caminho do alvo à fonte e depois inverta-o
  while (current !== null) {
    path.unshift(current);
    current = prev[current];
  }
  
  return {
    path,
    distance: dist[target]
  };
}

/**
 * Função auxiliar para converter a lista de adjacência padrão para o formato exigido pelo dijkstraJS
 * @param standardAdjList A lista de adjacência padrão de buildAdjacencyList
 * @param edgeWeights Mapa de pesos de aresta
 * @returns Lista de adjacência convertida
 */
export function convertAdjacencyListFormat(
  standardAdjList: Map<string, string[]>,
  edgeWeights: Map<string, number>
): Map<string, AdjListNode[]> {
  const convertedList = new Map<string, AdjListNode[]>();
  
  for (const [nodeId, neighbors] of standardAdjList.entries()) {
    const nodeNeighbors: AdjListNode[] = [];
    
    for (const neighbor of neighbors) {
      // Experimente ambas as direções para o peso da borda
      const edgeKey1 = `${nodeId}-${neighbor}`;
      const edgeKey2 = `${neighbor}-${nodeId}`;
      const weight = edgeWeights.get(edgeKey1) || edgeWeights.get(edgeKey2) || 1;
      
      nodeNeighbors.push(new AdjListNode(neighbor, weight));
    }
    
    convertedList.set(nodeId, nodeNeighbors);
  }
  
  return convertedList;
}
