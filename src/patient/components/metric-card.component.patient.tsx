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
  current?: number;
  isLoading?: boolean;
}

export function MetricCard({
  label,
  value,
  trend,
  trendDir,
  icon: Icon,
  bgLight,
  current,
  isLoading,
}: MetricCardProps) {
  return (
    <Card
      className={`group relative overflow-hidden border-0 ${bgLight} shadow-md hover:shadow-lg transition-all duration-300 cursor-default rounded-2xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2`}
    >
      <CardContent className="p-5 flex flex-col justify-between">
        {/* top row: icon + menu */}
        <div className="flex items-start justify-between mb-4">
          {/* left: icon in circular background */}
          <div
            className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
            aria-hidden="true"
          >
            <Icon className="size-6 text-black" />
          </div>

          {/* right: menu icon */}
          <button
            className="p-2 text-black/50 hover:text-black focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-colors"
            aria-label={`More options for ${label}`}
            tabIndex={0}
          >
            <MoreVertical className="size-5" />
          </button>
        </div>

        {/* middle: title + trend */}
        <div className="space-y-2 flex-grow">
          {isLoading ? (
            <>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="h-8 w-12 rounded-md bg-black/15 animate-pulse" />
                <span className="h-6 w-28 rounded-md bg-black/15 animate-pulse" />
                <span className="h-4 w-14 rounded-md bg-black/15 animate-pulse" />
              </div>
              <span className="block h-4 w-36 rounded-md bg-black/10 animate-pulse" />
            </>
          ) : (
            <>
              <div className="flex items-baseline gap-2 flex-wrap">
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-black">{value}</p>
                  <h3 className="text-lg font-semibold text-black">{label}</h3>
                </div>
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-normal whitespace-nowrap ${
                    trendDir === "up" ? "text-emerald-600" : "text-red-600"
                  }`}
                  aria-label={`Trend ${trendDir === "up" ? "up" : "down"} by ${trend}`}
                >
                  {trend}
                  {trendDir === "up" ? (
                    <TrendingUp className="size-3" aria-hidden="true" />
                  ) : (
                    <TrendingDown className="size-3" aria-hidden="true" />
                  )}
                </span>
              </div>

              {/* subtitle */}
              <p className="text-xs text-black/60 font-normal">
                <span className="font-medium text-black/80">
                  {current ?? 0}
                </span>{" "}
                more than Yesterday
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
