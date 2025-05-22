import { Movie } from "@/types/movie";
import { Node, Edge, Position, MarkerType } from "@xyflow/react";
import { MovieNodeData, MovieEdgeData } from "@/types/movie";
import { AdjListNode, dijkstraShortestPathJS, convertAdjacencyListFormat } from "./dijkstraJSAdapted";

// Force-directed layout positioning with improved anti-overlap mechanism
export const generateForceDirectedLayout = (
  movies: Movie[], 
  width = 800, 
  height = 700, 
  iterations = 150 // Increased iterations for better layout
) => {
  const positions: Record<string, {x: number, y: number}> = {};
  const nodes: Array<{id: string, x: number, y: number, vx: number, vy: number}> = [];
  
  // Initialize positions in a grid pattern instead of random to reduce initial overlaps
  const moviesPerRow = Math.ceil(Math.sqrt(movies.length));
  const cellWidth = width / (moviesPerRow + 1);
  const cellHeight = height / (Math.ceil(movies.length / moviesPerRow) + 1);
  
  movies.forEach((movie, index) => {
    const id = movie.id.toString();
    const row = Math.floor(index / moviesPerRow);
    const col = index % moviesPerRow;
    
    // Add some initial randomness within the cell
    const x = (col + 1) * cellWidth + (Math.random() - 0.5) * cellWidth * 0.5;
    const y = (row + 1) * cellHeight + (Math.random() - 0.5) * cellHeight * 0.5;
    
    nodes.push({ id, x, y, vx: 0, vy: 0 });
  });
  
  // Run force-directed algorithm iterations
  const repulsionFactor = 5000; // Increased repulsion strength
  const minDistance = 180;      // Increased minimum distance between nodes
  
  for (let i = 0; i < iterations; i++) {
    // Calculate forces between all pairs of nodes
    for (let j = 0; j < nodes.length; j++) {
      const nodeA = nodes[j];
      
      for (let k = j + 1; k < nodes.length; k++) {
        const nodeB = nodes[k];
        
        // Calculate distance and direction
        const dx = nodeB.x - nodeA.x;
        const dy = nodeB.y - nodeA.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        
        // Apply repulsive force if nodes are too close
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
    
    // Update positions based on velocities
    for (const node of nodes) {
      node.x += node.vx * 0.1;
      node.y += node.vy * 0.1;
      node.vx *= 0.9; // Damping
      node.vy *= 0.9; // Damping
      
      // Keep nodes within bounds with padding
      const padding = 120; // Increased padding to avoid edges
      node.x = Math.max(padding, Math.min(width - padding, node.x));
      node.y = Math.max(padding, Math.min(height - padding, node.y));
    }
  }
  
  // Store final positions
  nodes.forEach(node => {
    positions[node.id] = { x: node.x, y: node.y };
  });
  
  return positions;
};

// Helper for circle layout (backup if needed)
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

// Helper to create nodes from movies
export const createNodes = (
  movies: Movie[], 
  selectedMovieIds: number[],
  recommendedMovieIds: number[],
  nodePositions: Record<string, {x: number, y: number}>
): Node<MovieNodeData>[] => {
  if (movies.length === 0) return [];
  
  // Generate new layout if we don't have positions for all movies
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
    
    // Use existing position if available, otherwise use new layout positions
    const position = nodePositions[movieId] || newLayout[movieId] || { 
      x: 400 + Math.random() * 300, 
      y: 350 + Math.random() * 300 
    };
    
    // Create the node with the movie data
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

// Build adjacency list from nodes and edges for graph algorithms
export const buildAdjacencyList = (movies: Movie[], edges: Edge<MovieEdgeData>[]): Map<string, string[]> => {
  const adjacencyList = new Map<string, string[]>();
  
  // Initialize empty arrays for all nodes
  movies.forEach(movie => {
    adjacencyList.set(movie.id.toString(), []);
  });
  
  // Add connections from edges
  edges.forEach(edge => {
    // For undirected graph, add both directions
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

// DFS algorithm
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

// BFS algorithm
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

// Check if graph is connected
export const isGraphConnected = (
  adjacencyList: Map<string, string[]>
): boolean => {
  if (adjacencyList.size === 0) return true;
  
  // Get first node as starting point
  const startNodeId = Array.from(adjacencyList.keys())[0];
  
  // Run DFS from first node
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
  
  // If all nodes were visited, graph is connected
  return visited.size === adjacencyList.size;
};

// Helper to create edges between movies
export const createEdges = (
  movies: Movie[],
  selectedMovieIds: number[],
  recommendedMovieIds: number[]
): Edge<MovieEdgeData>[] => {
  const edges: Edge<MovieEdgeData>[] = [];
  
  // Generate edges for all movies that share at least one genre
  for (let i = 0; i < movies.length; i++) {
    const movie1 = movies[i];
    const isMovie1Selected = selectedMovieIds.includes(movie1.id);
    const isMovie1Recommended = recommendedMovieIds.includes(movie1.id);
    
    for (let j = i + 1; j < movies.length; j++) {
      const movie2 = movies[j];
      const isMovie2Selected = selectedMovieIds.includes(movie2.id);
      const isMovie2Recommended = recommendedMovieIds.includes(movie2.id);
      
      // Find common genres
      const commonGenres = movie1.genre_ids.filter(genre => 
        movie2.genre_ids.includes(genre)
      );
      
      // Only create an edge if there are common genres
      if (commonGenres.length > 0) {
        // Determine edge color and style based on movie selection status
        let strokeColor = '#d1d5db'; // Default light gray
        let strokeWidth = 1;
        let animated = false;
        
        // Both selected - red edge
        if (isMovie1Selected && isMovie2Selected) {
          strokeColor = '#ea384c'; // red color
          strokeWidth = 2;
          animated = true;
        } 
        // One selected and one recommended - blue edge
        else if ((isMovie1Selected && isMovie2Recommended) || 
                (isMovie1Recommended && isMovie2Selected)) {
          strokeColor = '#3b82f6'; // blue-500
          strokeWidth = 1.5;
          animated = true;
        }
        // One or both are recommended - lighter blue edge
        else if (isMovie1Recommended || isMovie2Recommended) {
          strokeColor = '#60a5fa'; // blue-400
          strokeWidth = 1;
        }
        // One node is selected - gray edge
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

// Fixed Dijkstra's algorithm implementation using the new JS-adapted version
export const dijkstraShortestPath = (
  adjacencyList: Map<string, string[]>,
  edgeWeights: Map<string, number>,
  startNodeId: string,
  endNodeId: string
): { path: string[], distance: number } => {
  // Convert the standard adjacency list to the format required by dijkstraJS
  const convertedList = convertAdjacencyListFormat(adjacencyList, edgeWeights);
  
  // Run the improved Dijkstra's algorithm
  return dijkstraShortestPathJS(convertedList, startNodeId, endNodeId);
};

// Helper function to create edge weights map for Dijkstra and Kruskal
export const createEdgeWeightsMap = (edges: Edge<MovieEdgeData>[]): Map<string, number> => {
  const weightMap = new Map<string, number>();
  
  edges.forEach(edge => {
    const sourceTarget = `${edge.source}-${edge.target}`;
    // Use the inverse of common genres strength as weight
    // More common genres = stronger connection = lower weight
    const weight = edge.data?.strength 
      ? 1 / (edge.data.strength) 
      : 1;  // Default weight if strength is not available
    
    weightMap.set(sourceTarget, weight);
  });
  
  return weightMap;
};

// Kruskal's algorithm implementation
export interface KruskalEdge {
  source: string;
  target: string;
  weight: number;
}

export const findMinimumSpanningTree = (
  nodes: string[],
  edges: Edge<MovieEdgeData>[]
): KruskalEdge[] => {
  // Create a disjoint set data structure
  const parent: Record<string, string> = {};
  const rank: Record<string, number> = {};
  
  // Initialize disjoint set
  nodes.forEach(node => {
    parent[node] = node;
    rank[node] = 0;
  });
  
  // Find operation with path compression
  const find = (node: string): string => {
    if (parent[node] !== node) {
      parent[node] = find(parent[node]);
    }
    return parent[node];
  };
  
  // Union operation with rank
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
  
  // Convert edges to a format suitable for Kruskal's algorithm
  const kruskalEdges: KruskalEdge[] = [];
  const edgeSet = new Set(); // To avoid duplicate edges in undirected graph
  
  edges.forEach(edge => {
    const sourceTarget = `${edge.source}-${edge.target}`;
    const targetSource = `${edge.target}-${edge.source}`;
    
    // Avoid adding duplicate edges in undirected graph
    if (edgeSet.has(sourceTarget) || edgeSet.has(targetSource)) {
      return;
    }
    
    edgeSet.add(sourceTarget);
    
    // Use the inverse of common genres strength as weight
    // More common genres = stronger connection = lower weight
    const weight = edge.data?.strength 
      ? 1 / (edge.data.strength) 
      : 1;  // Default weight if strength is not available
      
    kruskalEdges.push({
      source: edge.source,
      target: edge.target,
      weight
    });
  });
  
  // Sort edges by weight (ascending)
  kruskalEdges.sort((a, b) => a.weight - b.weight);
  
  // Apply Kruskal's algorithm
  const mst: KruskalEdge[] = [];
  
  for (const edge of kruskalEdges) {
    if (find(edge.source) !== find(edge.target)) {
      mst.push(edge);
      union(edge.source, edge.target);
    }
    
    // If we have n-1 edges, we've formed the MST
    if (mst.length === nodes.length - 1) {
      break;
    }
  }
  
  return mst;
};

// Convert minimum spanning tree to graph traversal order
export const getMstTraversalOrder = (
  mst: KruskalEdge[],
  startNodeId: string
): string[] => {
  // Create adjacency list from MST
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
  
  // Do a DFS on the MST starting from startNodeId
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
