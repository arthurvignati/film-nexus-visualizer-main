
import React from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider"; 
import { Switch } from "@/components/ui/switch";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";

interface MovieGraphControlsProps {
  maxRecommendations: number;
  onMaxRecommendationsChange: (value: number) => void;
  showSelectedMoviesOnly: boolean;
  onShowSelectedMoviesOnlyChange: (value: boolean) => void;
  minRecommendations?: number;
  maxRecommendationsLimit?: number;
}

export function MovieGraphControls({
  maxRecommendations,
  onMaxRecommendationsChange,
  showSelectedMoviesOnly,
  onShowSelectedMoviesOnlyChange,
  minRecommendations = 6,
  maxRecommendationsLimit = 12
}: MovieGraphControlsProps) {
  const handleMaxRecommendationsChange = (values: number[]) => {
    if (values.length > 0) {
      const value = values[0];
      const clampedValue = Math.max(minRecommendations, Math.min(maxRecommendationsLimit, value));
      onMaxRecommendationsChange(clampedValue);
    }
  };

  return (
    <div className="p-4 border-b border-border">
      <h1 className="text-2xl text-black font-bold">Grafo</h1>
      <div className="flex items-center justify-between mb-4">
        {/* <div className="flex items-center gap-2">
          <Label htmlFor="show-selected-only" className="text-xs whitespace-nowrap">
            Mostrar Apenas Filmes Selecionados
          </Label>
          <Switch 
            id="show-selected-only"
            checked={showSelectedMoviesOnly}
            onCheckedChange={onShowSelectedMoviesOnlyChange}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Mostrar apenas os filmes selecionados no grafo, ocultando recomendações</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div> */}
      </div>

      <div className="space-y-4">
        {/* <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="max-recommendations" className="text-xs">
              Máx. Recomendações: {maxRecommendations}
            </Label>
            <span className="text-xs text-muted-foreground">
              (Mín: {minRecommendations}, Máx: {maxRecommendationsLimit})
            </span>
          </div>
          <Slider
            id="max-recommendations"
            min={minRecommendations}
            max={maxRecommendationsLimit}
            step={1}
            value={[maxRecommendations]}
            onValueChange={handleMaxRecommendationsChange}
            className="w-full"
            disabled={showSelectedMoviesOnly}
          />
        </div> */}
      </div>
    </div>
  );
}
