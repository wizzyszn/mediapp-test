import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Clock, Sun, Sunrise, Sunset, Moon } from "lucide-react";
import { isSameDay, parse } from "date-fns";

const MINUTES = ["00", "15", "30", "45"];

function generateTimeIntervals(meridiem: string) {
  return Array.from({ length: 12 }, (_, hour) => {
    const displayHour = hour === 0 ? 12 : hour;
    return MINUTES.map(
      (min) => `${String(displayHour).padStart(2, "0")}:${min} ${meridiem}`,
    );
  }).flat();
}

const TIME_INTERVALS = generateTimeIntervals("AM").concat(
  generateTimeIntervals("PM"),
);

function getEndTime(interval: string) {
  const index = TIME_INTERVALS.indexOf(interval);
  if (index === -1) return interval;
  if (index + 1 < TIME_INTERVALS.length) {
    return TIME_INTERVALS[index + 1];
  }
  return "12:00 AM";
}

const TIME_GROUPS = [
  { title: "Morning", icon: Sunrise, periods: TIME_INTERVALS.slice(24, 48) }, // 06:00 AM - 11:45 AM
  { title: "Afternoon", icon: Sun, periods: TIME_INTERVALS.slice(48, 68) }, // 12:00 PM - 04:45 PM
  { title: "Evening", icon: Sunset, periods: TIME_INTERVALS.slice(68, 96) }, // 05:00 PM - 11:45 PM
  { title: "Night", icon: Moon, periods: TIME_INTERVALS.slice(0, 24) }, // 12:00 AM - 05:45 AM
];

interface TimeIntervalsProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  selectedDate?: Date;
}

function TimeIntervals({
  value,
  onChange,
  className,
  selectedDate,
}: TimeIntervalsProps) {
  const disabledIntervals = useMemo(() => {
    if (!selectedDate) return new Set<string>();

    const now = new Date();
    if (!isSameDay(selectedDate, now)) return new Set<string>();

    return new Set(
      TIME_INTERVALS.filter((interval) => {
        const slotStart = parse(interval, "hh:mm a", selectedDate);
        return slotStart <= now;
      }),
    );
  }, [selectedDate]);

  const normalizedValue =
    value && !disabledIntervals.has(value.split(" - ")[0]) ? value : "";

  const selectedTimeIntervals = useMemo(() => {
    if (!normalizedValue) return [];

    const parts = normalizedValue.split(" - ");
    if (parts.length === 2) {
      const startTime = parts[0];
      const endTime = parts[1];
      const startIndex = TIME_INTERVALS.indexOf(startTime);
      const endIndex =
        endTime === "12:00 AM"
          ? TIME_INTERVALS.length
          : TIME_INTERVALS.indexOf(endTime);

      if (startIndex !== -1 && endIndex !== -1) {
        return TIME_INTERVALS.slice(startIndex, endIndex);
      }
    } else if (TIME_INTERVALS.includes(normalizedValue)) {
      return [normalizedValue];
    }
    return [];
  }, [normalizedValue]);

  const firstSelected = selectedTimeIntervals[0];
  const lastSelected = selectedTimeIntervals[selectedTimeIntervals.length - 1];

  const handleSelected = (timeInterval: string) => {
    if (disabledIntervals.has(timeInterval)) return;
    const timeIntervalIndex = TIME_INTERVALS.indexOf(timeInterval);
    let newSelection: string[] = [];

    if (selectedTimeIntervals.length === 0) {
      newSelection = [timeInterval];
    } else {
      const firstIndex = TIME_INTERVALS.indexOf(firstSelected);

      if (timeIntervalIndex === firstIndex) {
        newSelection = [];
      } else if (
        timeIntervalIndex < firstIndex ||
        timeIntervalIndex > firstIndex + 3
      ) {
        newSelection = [timeInterval];
      } else {
        newSelection = TIME_INTERVALS.slice(firstIndex, timeIntervalIndex + 1);
      }
    }

    if (onChange) {
      if (newSelection.length === 0) {
        onChange("");
      } else {
        const start = newSelection[0];
        const end = getEndTime(newSelection[newSelection.length - 1]);
        onChange(`${start} - ${end}`);
      }
    }
  };

  return (
    <div
      className={cn(
        "w-full max-w-3xl mx-auto rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden",
        className,
      )}
    >
      {/* Header Section */}
      <div className="sticky top-0 z-10 flex flex-col space-y-1.5 border-b bg-card p-6">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold leading-none tracking-tight">
            Select Time Slot
          </h3>
        </div>
        <p className="text-sm text-muted-foreground pt-2">
          Pick a start time. You can select up to a 1-hour session by choosing
          consecutive slots.
        </p>

        {/* Active Selection Summary */}
        <div
          className={cn(
            "mt-4 p-4 rounded-lg flex items-center justify-between border transition-all duration-300",
            selectedTimeIntervals.length > 0
              ? "bg-primary/10 border-primary/20"
              : "bg-muted/50 border-transparent",
          )}
        >
          <span className="text-sm font-medium">Selected Session</span>
          <span className="text-sm font-bold text-primary">
            {selectedTimeIntervals.length > 0
              ? `${firstSelected} - ${getEndTime(lastSelected)} (${selectedTimeIntervals.length * 15} mins)`
              : "No time selected"}
          </span>
        </div>
      </div>

      {/* Time Slots Grid */}
      <div className="p-6 h-[400px] overflow-y-auto custom-scrollbar">
        <div className="flex flex-col gap-8">
          {TIME_GROUPS.map((group) => (
            <div key={group.title} className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <group.icon className="w-4 h-4 text-muted-foreground" />
                <h4 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                  {group.title}
                </h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {group.periods.map((interval) => {
                  const isSelected = selectedTimeIntervals.includes(interval);
                  const isFirst = firstSelected === interval;
                  const isLast = lastSelected === interval;
                  const isDisabled = disabledIntervals.has(interval);

                  return (
                    <Button
                      key={interval}
                      variant="ghost"
                      onClick={() => handleSelected(interval)}
                      disabled={isDisabled}
                      className={cn(
                        "w-full transition-all relative text-[10px] px-1 h-9 border z-0",
                        isSelected
                          ? "text-primary-foreground border-primary"
                          : "bg-card border-border text-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary",
                        isSelected && !isFirst && !isLast && "opacity-90",
                        isDisabled &&
                          "cursor-not-allowed border-border/60 bg-muted/40 text-muted-foreground opacity-50 hover:bg-muted/40 hover:text-muted-foreground hover:border-border/60",
                      )}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId={isFirst ? "active-time-slot" : undefined}
                          className="absolute inset-0 bg-primary rounded-md -z-10"
                          initial={!isFirst ? { opacity: 0 } : false}
                          animate={{ opacity: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                          }}
                        />
                      )}
                      {interval}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TimeIntervals;
