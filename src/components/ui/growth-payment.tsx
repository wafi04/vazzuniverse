import { TrendingDown, TrendingUp } from 'lucide-react';

export const GrowthIndicator = ({ value }: { value: number }) => {
  if (value > 0) {
    return (
      <div className="flex items-center text-green-500 text-xs">
        <TrendingUp className="h-3 w-3 mr-1" />+{value}%
      </div>
    );
  } else if (value < 0) {
    return (
      <div className="flex items-center text-red-500 text-xs">
        <TrendingDown className="h-3 w-3 mr-1" />
        {value}%
      </div>
    );
  }
  return <div className="text-xs text-muted-foreground">0%</div>;
};
