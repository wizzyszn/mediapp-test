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
      className={`group relative overflow-hidden border-0 ${bgLight} shadow-md hover:shadow-lg transition-all duration-300 cursor-default rounded-2xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2`}
    >
      <CardContent className="p-4 sm:p-5 md:p-6 flex flex-col justify-between">
        {/* top row: icon + menu */}
        <div className="flex items-start justify-between mb-4">
          {/* left: icon in circular background */}
          <div
            className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-black/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
            aria-hidden="true"
          >
            <Icon className="size-6 sm:size-7 md:size-8 text-black" />
          </div>

          {/* right: menu icon */}
          <button
            className="p-2 text-black/50 hover:text-black focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-colors"
            aria-label={`More options for ${label}`}
            tabIndex={0}
          >
            <MoreVertical className="size-5 sm:size-6" />
          </button>
        </div>

        {/* middle: title + trend */}
        <div className="space-y-2 flex-grow">
          <div className="flex items-baseline gap-2 flex-wrap">
            <div className="flex items-baseline gap-2">
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-black">
                {value}
              </p>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-black">
                {label}
              </h3>
            </div>
            <span
              className={`inline-flex items-center gap-0.5 text-xs sm:text-sm font-normal whitespace-nowrap ${
                trendDir === "up" ? "text-emerald-600" : "text-red-600"
              }`}
              aria-label={`Trend ${trendDir === "up" ? "up" : "down"} by ${trend}`}
            >
              {trend}
              {trendDir === "up" ? (
                <TrendingUp className="size-3 sm:size-4" aria-hidden="true" />
              ) : (
                <TrendingDown className="size-3 sm:size-4" aria-hidden="true" />
              )}
            </span>
          </div>

          {/* subtitle */}
          <p className="text-xs sm:text-sm text-black/60 font-normal">
            more than Yesterday
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
