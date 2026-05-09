import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  MoreVertical,
  type LucideIcon,
} from "lucide-react";

export interface MetricCardProps {
  label: string;
  value: number;
  trend: string;
  trendDir: "up" | "down";
  icon: LucideIcon;
  bgLight: string;
}

export function MetricCard({
  label,
  value,
  trend,
  trendDir,
  icon: Icon,
  bgLight,
}: MetricCardProps) {
  return (
    <Card
      className={`group relative overflow-hidden border-0 ${bgLight} shadow-md hover:shadow-lg transition-all duration-300 cursor-default rounded-2xl`}
    >
      <CardContent className="p-5 flex flex-col justify-between">
        {/* top row: icon + menu */}
        <div className="flex items-start justify-between mb-4">
          {/* left: icon in circular background */}
          <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <Icon className="size-6 text-black" />
          </div>

          {/* right: menu icon */}
          <button className="text-black/50 hover:text-black transition-colors">
            <MoreVertical className="size-5" />
          </button>
        </div>

        {/* middle: title + trend */}
        <div className="space-y-2 flex-grow">
          <div className="flex items-baseline gap-2">
            <h3 className="text-lg font-semibold text-black">{label}</h3>
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-normal ${
                trendDir === "up" ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {trend}
              {trendDir === "up" ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
            </span>
          </div>

          {/* subtitle */}
          <p className="text-xs text-black/60 font-normal">
            {value} more than Yesterday
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
