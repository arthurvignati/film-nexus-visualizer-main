
import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { getImageUrl } from "@/services/movieService";
import { cn } from "@/lib/utils";
import { MovieNodeData } from "@/types/movie";

const MovieNode = ({ data }: NodeProps) => {
  // Como os dados são digitados como Record<string, unknown>, precisamos convertê-los
  const { movie, selected, recommended } = data as MovieNodeData;
  
  return (
    <div className={cn(
      "movie-node cursor-grab active:cursor-grabbing",
      "bg-background rounded-md p-1 transition-shadow",
      selected ? "border-2 border-primary shadow-lg" : 
      recommended ? "border-2 border-blue-500 shadow-md" : 
      "border border-transparent"
    )}>
      <img 
        src={getImageUrl(movie.poster_path, 'w200')} 
        alt={movie.title} 
        title={movie.title}
        className="w-full h-auto rounded"
      />
      <Handle type="source" position={Position.Right} className="w-2 h-2" />
      <Handle type="target" position={Position.Right} className="w-2 h-2" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
      <Handle type="target" position={Position.Bottom} className="w-2 h-2" />
      <Handle type="source" position={Position.Left} className="w-2 h-2" />
      <Handle type="target" position={Position.Left} className="w-2 h-2" />
      <Handle type="source" position={Position.Top} className="w-2 h-2" />
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
    </div>
  );
};

export default memo(MovieNode);
