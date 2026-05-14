import { useState, useRef, useEffect } from "react";
import * as React from "react";
import { motion } from "framer-motion";
import { useFormContext, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertCircle, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { DayButton, getDefaultClassNames } from "react-day-picker";
import { cn, formatLocalDateTime, getBrowserTimeZone } from "@/lib/utils";
import { format, isSameDay, parse, startOfToday } from "date-fns";
import type { BookingFormData } from "@/patient/lib/schemas";
import { checkDoctorAvailabilityReq } from "@/config/service/patient.service";
import type { RejectedPayload } from "@/lib/types";

interface ChooseTimeSlotProps {
  onNext: () => void;
  onBack: () => void;
  onDoctorUnavailable?: () => void;
  isReschedule?: boolean;
}

import TimeIntervals from "@/shared/components/time-intervals.component";

const MotionButton = motion.create(Button);

const formatSelectedDate = (date: Date) => format(date, "d MMMM yyyy");

const parseStoredDate = (value?: string) => {
  if (!value) return undefined;

  const parsed = parse(value, "d MMMM yyyy", new Date());
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const isTimeSlotInPast = (slot: string, date: Date) => {
  const startStr = slot.split(" - ")[0];
  const slotStart = parse(startStr.trim(), "hh:mm a", date);
  return slotStart <= new Date();
};

function AnimatedDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  const isSelected =
    modifiers.selected &&
    !modifiers.range_start &&
    !modifiers.range_end &&
    !modifiers.range_middle;

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={isSelected}
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "relative z-0 flex aspect-square h-auto w-full min-w-[--cell-size] flex-col gap-1 font-normal leading-none",
        "group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px]",
        isSelected
          ? "text-primary-foreground font-semibold bg-transparent hover:bg-transparent"
          : "",
        "[&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className,
      )}
      {...props}
    >
      {isSelected && (
        <motion.div
          layoutId="active-date"
          className="absolute inset-0 bg-primary rounded-md -z-10"
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
          }}
        />
      )}
      {props.children}
    </Button>
  );
}

const ChooseTimeSlot = ({
  onNext,
  onBack,
  onDoctorUnavailable,
  isReschedule,
}: ChooseTimeSlotProps) => {
  const {
    watch,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<BookingFormData>();

  const selectedTimeSlot = watch("timeSlot");
  const selectedDateValue = watch("selectedDate");
  const originalSelectedDate = watch("originalSelectedDate");
  const originalTimeSlot = watch("originalTimeSlot");

  const today = startOfToday();
  const selectedDate = parseStoredDate(selectedDateValue) ?? today;

  const [calendarMonth, setCalendarMonth] = useState<Date>(selectedDate);

  const isSelectedTimeValid =
    !!selectedTimeSlot &&
    (!isSameDay(selectedDate, today) ||
      !isTimeSlotInPast(selectedTimeSlot, selectedDate));

  const isSameAsOriginalRescheduleSlot = Boolean(
    isReschedule &&
    selectedDateValue &&
    selectedTimeSlot &&
    originalSelectedDate &&
    originalTimeSlot &&
    selectedDateValue === originalSelectedDate &&
    selectedTimeSlot === originalTimeSlot,
  );

  const handleSelectDay = (date: Date | undefined) => {
    if (!date) return;

    setCalendarMonth(date);
    setValue("selectedDate", formatSelectedDate(date), {
      shouldValidate: true,
    });

    if (
      selectedTimeSlot &&
      isSameDay(date, today) &&
      isTimeSlotInPast(selectedTimeSlot, date)
    ) {
      setValue("timeSlot", "", { shouldValidate: true });
    }
  };

  const handleSelectTime = (slot: string) => {
    setValue("selectedDate", formatSelectedDate(selectedDate), {
      shouldValidate: true,
    });
    setValue("timeSlot", slot, { shouldValidate: true });
  };

  const canContinue = Boolean(
    selectedDate && isSelectedTimeValid && !isSameAsOriginalRescheduleSlot,
  );

  // ── Parse time slot into datetime + duration for availability check ──
  const parseTimeSlot = (slot: string) => {
    const parts = slot.split(" - ");
    if (parts.length !== 2)
      return {
        startHour: 9,
        startMinute: 0,
        durationMinutes: 30 as 15 | 30 | 45 | 60,
      };

    const parseTime = (t: string) => {
      const [time, meridian] = t.trim().split(" ");
      // eslint-disable-next-line prefer-const
      let [hours, minutes] = time.split(":").map(Number);
      if (meridian?.toUpperCase() === "PM" && hours !== 12) hours += 12;
      if (meridian?.toUpperCase() === "AM" && hours === 12) hours = 0;
      return { hours, minutes };
    };

    const start = parseTime(parts[0]);
    const end = parseTime(parts[1]);
    const diff =
      end.hours * 60 + end.minutes - (start.hours * 60 + start.minutes);
    const clamp = (m: number): 15 | 30 | 45 | 60 => {
      if (m <= 15) return 15;
      if (m <= 30) return 30;
      if (m <= 45) return 45;
      return 60;
    };

    return {
      startHour: start.hours,
      startMinute: start.minutes,
      durationMinutes: clamp(diff),
    };
  };

  const doctorId = watch("doctorId");

  const availabilityCheck = useMutation({
    mutationFn: () => {
      if (!selectedDate || !selectedTimeSlot || !doctorId) {
        return Promise.reject(new Error("Missing required fields"));
      }
      const { durationMinutes } = parseTimeSlot(selectedTimeSlot);
      const timeZone = getBrowserTimeZone();
      const startStr = selectedTimeSlot.split(" - ")[0];
      const naiveDate = parse(startStr.trim(), "hh:mm a", selectedDate);

      return checkDoctorAvailabilityReq(doctorId, {
        datetime_local: formatLocalDateTime(naiveDate),
        timezone: timeZone,
        duration: String(durationMinutes),
      });
    },
    onSuccess: (response) => {
      const data = response.data;
      if (!data) return;

      if (data.available) {
        setValue("suggestedDoctorId", undefined);
        setValue("suggestedDoctorName", undefined);
        setValue("suggestedDoctorSpecialty", undefined);
        setValue("suggestedTimeSlot", undefined);
        setValue("suggestedDate", undefined);
        setValue("isQueueing", false);
        onNext();
      } else {
        setValue("suggestedDoctorId", undefined);
        setValue("suggestedDoctorName", undefined);
        setValue("suggestedDoctorSpecialty", undefined);
        setValue("suggestedTimeSlot", undefined);
        setValue("suggestedDate", undefined);
        setValue("isQueueing", false);
        onDoctorUnavailable?.();
      }
    },
    onError: (error: RejectedPayload) => {
      toast.error(
        error.message ||
          "Could not verify doctor availability. Please try again.",
      );
    },
  });

  const handleBook = () => {
    if (!canContinue) return;

    setValue("selectedDate", formatSelectedDate(selectedDate), {
      shouldValidate: true,
    });

    if (isReschedule) {
      availabilityCheck.mutate();
    } else {
      onNext();
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Consultation Type
        </label>
        <Controller
          name="consultationType"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className=" h-[48px] rounded-[12px] border-border">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIDEO">Video Consultation</SelectItem>
                <SelectItem value="AUDIO">Audio Consultation</SelectItem>
                <SelectItem value="CHAT">Chat Consultation</SelectItem>
                <SelectItem value="MEETADOCTOR">
                  In-Person Doctor Visit
                </SelectItem>
                <SelectItem value="HOMESERVICE">
                  Home Visit Consultation
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.consultationType && (
          <p className="text-xs text-destructive mt-1">
            {errors.consultationType.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-6 md:gap-10">
        {/* Calendar */}
        <div className="w-full">
          <p className="text-sm font-medium text-foreground mb-3 md:mb-4">
            Select Date
          </p>
          <div className="border rounded-xl p-4 md:p-6 bg-card/50 shadow-sm flex justify-center">
            <div className="w-full max-w-[420px]">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleSelectDay}
                month={calendarMonth}
                onMonthChange={setCalendarMonth}
                disabled={{ before: today }}
                components={{
                  DayButton: AnimatedDayButton,
                }}
                className="p-0 w-full"
                classNames={{
                  month_caption:
                    "flex h-[--cell-size] w-full items-center justify-center px-[--cell-size] mb-4",
                }}
              />
            </div>
          </div>
          {errors.selectedDate && (
            <p className="text-xs text-destructive mt-2 text-center">
              {errors.selectedDate.message}
            </p>
          )}
        </div>

        {/* Time slots */}
        <div className="w-full">
          <p className="text-sm font-medium text-foreground mb-3 md:mb-4">
            What Time works for you?
          </p>
          <TimeIntervals
            value={isSelectedTimeValid ? selectedTimeSlot : ""}
            onChange={handleSelectTime}
            selectedDate={selectedDate}
            className="border-none shadow-none bg-transparent"
          />
          {errors.timeSlot && (
            <p className="text-xs text-destructive mt-2">
              {errors.timeSlot.message}
            </p>
          )}
          {isSameAsOriginalRescheduleSlot && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Choose a different date or time to reschedule this appointment.
              </p>
            </div>
          )}
        </div>
      </div>

      {isReschedule && (
        <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="space-y-1">
            <p className="font-medium">
              Reschedule requests depend on availability.
            </p>
            <p className="text-muted-foreground">
              We will try to book your selected time or match you with an
              available provider. If that is not possible, we will guide you to
              another option.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-2 md:gap-3 pt-2">
        <MotionButton
          variant="ghost"
          className="flex-1 h-10 md:h-12 bg-[#F7F7F7] hover:border-2"
          onClick={onBack}
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Go Back
        </MotionButton>
        <MotionButton
          className={`flex-1 h-10 md:h-12 ${
            !canContinue ? "bg-[#E3E3E3] text-[#FFFFFF]" : ""
          }`}
          onClick={handleBook}
          type="button"
          disabled={!canContinue || availabilityCheck.isPending}
          whileHover={
            canContinue && !availabilityCheck.isPending ? { scale: 1.02 } : {}
          }
          whileTap={
            canContinue && !availabilityCheck.isPending ? { scale: 0.98 } : {}
          }
        >
          {availabilityCheck.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isReschedule ? (
            "Reschedule appointment"
          ) : (
            "Book appointments"
          )}
        </MotionButton>
      </div>
    </div>
  );
};

export default ChooseTimeSlot;
