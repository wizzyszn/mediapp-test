import {
  getDoctorSchedules,
  getDoctorAvailabilitySlotReq,
} from "@/config/service/doctor.service";
import { FullCalendarData } from "@/lib/types";
import { getBrowserTimeZone } from "@/lib/utils";
import ViewSchedules from "@/shared/components/view-schedules.component";
import { format, getISOWeek, getISOWeekYear } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { useState } from "react";
import { DatesSetArg } from "@fullcalendar/core/index.js";
import { useSelector } from "react-redux";
import { RootState } from "@/config/stores/store";

import { useQuery } from "@tanstack/react-query";

function Schedules() {
  const [dateRange, setDateRange] = useState({
    week: "",
    year: "",
  });
  const userTimezone = useSelector((state: RootState) => state.auth.timezone);

  const { data, isLoading } = useQuery({
    queryKey: ["schedules", dateRange.week, dateRange.year],
    queryFn: () =>
      getDoctorSchedules({
        weekly: dateRange.week,
        year: dateRange.year,
      }),
    enabled: !!dateRange.week && !!dateRange.year,
  });

  const { data: availabilityData } = useQuery({
    queryKey: ["availability"],
    queryFn: () => getDoctorAvailabilitySlotReq(),
  });

  const refinedAppointments: FullCalendarData = (
    data?.data?.appointments || []
  ).map((appointment) => {
    const timeZone =
      userTimezone || appointment.timezone_snapshot || getBrowserTimeZone();
    const zonedStart = toZonedTime(
      new Date(appointment.scheduled_start_at_utc),
      timeZone,
    );
    const zonedEnd = toZonedTime(
      new Date(appointment.scheduled_end_at_utc),
      timeZone,
    );

    const startStr = format(zonedStart, "yyyy-MM-dd'T'HH:mm:ss");
    const endStr = format(zonedEnd, "yyyy-MM-dd'T'HH:mm:ss");

    const patientName = appointment.patient_id
      ? `${appointment.patient_id.first_name} ${appointment.patient_id.last_name}`
      : "Patient";
    const consType = "";

    const baseTitle =
      appointment.reason_for_visit ||
      `Appointment ${appointment.appointment_number}`;
    const uniqueId = appointment.appointment_number;
    const fullTitle = `${patientName}  - ${uniqueId} - ${baseTitle}`;

    // The main title doctors see on the slot
    const title = patientName;

    return {
      start: startStr,
      end: endStr,
      endStr: endStr,
      startStr: startStr,
      date: format(zonedStart, "yyyy-MM-dd"),
      _id: appointment._id || "",
      consultationId: appointment.consultation_id?._id,
      title: title.trim(),
      fullTitle: fullTitle.trim(),
      details: appointment.reason_for_visit,
      patientName: patientName,
      consultationType: consType,
      status: appointment.status,
    };
  });

  const refinedBlackouts: FullCalendarData = (data?.data?.blackouts || []).map(
    (blackout) => {
      const timeZone =
        userTimezone || blackout.timezone || getBrowserTimeZone();
      const zonedStart = toZonedTime(new Date(blackout.start_at_utc), timeZone);
      const zonedEnd = toZonedTime(new Date(blackout.end_at_utc), timeZone);

      const startStr = format(zonedStart, "yyyy-MM-dd'T'HH:mm:ss");
      const endStr = format(zonedEnd, "yyyy-MM-dd'T'HH:mm:ss");

      return {
        start: startStr,
        end: endStr,
        endStr: endStr,
        startStr: startStr,
        date: format(zonedStart, "yyyy-MM-dd"),
        _id: blackout._id || "",
        title: "Unavailable",
        display: "background",
        status: "BLACKOUT",
      };
    },
  );

  const refinedAvailability: FullCalendarData = (
    availabilityData?.data?.weekly_slots || []
  )
    .filter((slot) => slot.is_active)
    .map((slot) => {
      return {
        _id: `availability-${slot.day_of_week}-${slot.start_time}`,
        title: "Unavailable",
        start: "",
        end: "",
        endStr: "",
        startStr: "",
        date: "",
        startTime: slot.start_time,
        endTime: slot.end_time,
        daysOfWeek: [slot.day_of_week],
        display: "inverse-background",
        status: "BLACKOUT",
        groupId: "availableForInverse",
      };
    });

  const refinedData: FullCalendarData = [
    ...(refinedAppointments || []),
    ...(refinedBlackouts || []),
    ...(refinedAvailability || []),
  ];

  const handleDatesSet = (dateInfo: DatesSetArg) => {
    const midpoint = new Date(
      (dateInfo.start.getTime() + dateInfo.end.getTime()) / 2,
    );

    setDateRange({
      week: getISOWeek(midpoint).toString(),
      year: getISOWeekYear(midpoint).toString(),
    });
  };

  return (
    <div className="w-full h-full overflow-auto rounded-md bg-white">
      <ViewSchedules
        data={refinedData}
        loading={isLoading}
        user="doctor"
        datesSetHandler={handleDatesSet}
      />
    </div>
  );
}

export default Schedules;
