
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
 * Calculates the shortest path from source to target using Dijkstra's algorithm
 * @param adjacencyList Map of each node to a list of its neighbors with weights
 * @param source Starting node ID
 * @param target Target node ID
 * @returns Object containing the path array and total distance
 */
export function dijkstraShortestPathJS(
  adjacencyList: Map<string, AdjListNode[]>,
  source: string,
  target: string
): { path: string[], distance: number } {
  // Track distances and previous nodes for path reconstruction
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visited: Record<string, boolean> = {};

  // Initialize distances, previous nodes, and visited status
  for (const node of adjacencyList.keys()) {
    dist[node] = Infinity;
    prev[node] = null;
    visited[node] = false;
  }
  dist[source] = 0;

  const V = adjacencyList.size;
  for (let i = 0; i < V - 1; i++) {
    // Find unvisited node with minimum distance
    let u: string | null = null;
    let best = Infinity;
    
    for (const node of Object.keys(dist)) {
      if (!visited[node] && dist[node] < best) {
        best = dist[node];
        u = node;
      }
    }
    
    if (u === null) break;
    if (u === target) break; // Early exit if we've reached the target
    
    visited[u] = true;

    // Update distances to neighbors
    for (const { dest, weight } of adjacencyList.get(u) || []) {
      const alt = dist[u] + weight;
      if (!visited[dest] && alt < dist[dest]) {
        dist[dest] = alt;
        prev[dest] = u;
      }
    }
  }

  // Reconstruct the shortest path
  const path: string[] = [];
  let current: string | null = target;
  
  // If target is not reachable, return empty path
  if (dist[target] === Infinity) {
    return { path: [], distance: Infinity };
  }
  
  // Build the path from target to source, then reverse it
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
 * Helper function to convert the standard adjacency list to the format required by dijkstraJS
 * @param standardAdjList The standard adjacency list from buildAdjacencyList
 * @param edgeWeights Map of edge weights
 * @returns Converted adjacency list
 */
export function convertAdjacencyListFormat(
  standardAdjList: Map<string, string[]>,
  edgeWeights: Map<string, number>
): Map<string, AdjListNode[]> {
  const convertedList = new Map<string, AdjListNode[]>();
  
  for (const [nodeId, neighbors] of standardAdjList.entries()) {
    const nodeNeighbors: AdjListNode[] = [];
    
    for (const neighbor of neighbors) {
      // Try both directions for the edge weight
      const edgeKey1 = `${nodeId}-${neighbor}`;
      const edgeKey2 = `${neighbor}-${nodeId}`;
      const weight = edgeWeights.get(edgeKey1) || edgeWeights.get(edgeKey2) || 1;
      
      nodeNeighbors.push(new AdjListNode(neighbor, weight));
    }
    
    convertedList.set(nodeId, nodeNeighbors);
  }
  
  return convertedList;
}
