import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoveLeft } from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { format, parse, differenceInMinutes } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { toast } from "sonner";
import AppointmentConfirmed from "../booking/appointment-confirmed.booking.component.patient";
import StepSidebar from "../booking/step-sidebar.booking.component.patient";
import PersonalDetails from "../booking/personal-details.booking.component.patient";
import FindDoctor from "../booking/find-doctor.booking.component.patient";
import ChooseTimeSlot from "../booking/choose-time-slot.booking.component.patient";
// import ChoosePayment from "../booking/choose-payment.booking.component.patient";
import ConfirmAppointment from "../booking/confirm-appointment.booking.component.patient";
import useUrlSearchParams from "@/shared/hooks/use-url-search-params";
import { Storages } from "@/lib/helpers";
import {
  StorageKeysEnum,
  type Patient,
  type RejectedPayload,
} from "@/lib/types";
import {
  bookAnAppointmentReq,
  getSingleAppointmentReq,
  rescheduleAppointment,
} from "@/config/service/patient.service";
import type { AuthState } from "@/config/stores/slices/auth.slice";
import type { RootState } from "@/config/stores/store";
import {
  bookingSchema,
  BookingFormData,
  STEP_FIELDS,
} from "@/patient/lib/schemas";
import { formatLocalDateTime, getBrowserTimeZone } from "@/lib/utils";

const STEP_TITLES = [
  "Personal Details",
  "Choose a time slot",
  "Find a Doctor",
  // "Select Payment Method",
  "Confirm Appointment",
];

const DEFAULT_VALUES: BookingFormData = {
  firstName: "",
  lastName: "",
  dobDay: "",
  dobMonth: "",
  dobYear: "",
  gender: "",
  maritalStatus: "",
  occupation: "",
  complaint: "",
  complaintBrief: "",
  medicalConditions: [],
  allergies: [],
  doctorId: "",
  doctorName: "",
  doctorSpecialty: "",
  originalDoctorId: "",
  originalDoctorName: "",
  originalDoctorSpecialty: "",
  consultationType: "VIDEO",
  selectedDate: "",
  timeSlot: "",
  originalSelectedDate: "",
  originalTimeSlot: "",
};

// ─── Helpers ────────────────────────────────────────────────────────────────

// ─── Transform fetched appointment into BookingFormData ─────────────────────
const MONTHS_LIST = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const appointmentToFormData = (
  raw: Awaited<ReturnType<typeof getSingleAppointmentReq>>,
): BookingFormData => {
  const data = raw.data;

  const timeZone = getBrowserTimeZone();
  const startZoned = toZonedTime(
    new Date(data.scheduled_start_at_utc),
    timeZone,
  );
  const endZoned = toZonedTime(new Date(data.scheduled_end_at_utc), timeZone);

  const selectedDate = format(startZoned, "d MMMM yyyy");
  const timeSlot =
    data.scheduled_start_at_utc && data.scheduled_end_at_utc
      ? `${format(startZoned, "hh:mm a")} - ${format(endZoned, "hh:mm a")}`
      : "";
  const dobParts = data.booking_profile_snapshot?.date_of_birth
    ?.split("T")[0]
    ?.split("-") || ["", "", ""];

  const parsedDay = parseInt(dobParts[2] || "", 10);
  const dobDay = isNaN(parsedDay) ? "" : parsedDay.toString();

  const parsedMonth = parseInt(dobParts[1] || "", 10);
  const dobMonth =
    isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12
      ? ""
      : MONTHS_LIST[parsedMonth - 1];

  return {
    firstName: data.booking_profile_snapshot?.first_name || "",
    lastName: data.booking_profile_snapshot?.last_name || "",
    dobYear: dobParts[0] || "",
    dobMonth,
    dobDay,
    gender: data.booking_profile_snapshot?.gender || "",
    maritalStatus: data.booking_profile_snapshot?.marital_status || "",
    occupation: data.booking_profile_snapshot?.occupation || "",
    complaint: data.reason_for_visit || "",
    complaintBrief: "",
    medicalConditions: [],
    allergies: [],
    doctorId: data.doctor_id?._id || "",
    doctorName: data.doctor_id?.full_name || "",
    doctorSpecialty: data.doctor_id?.specializations?.[0] || "",
    originalDoctorId: data.doctor_id?._id || "",
    originalDoctorName: data.doctor_id?.full_name || "",
    originalDoctorSpecialty: data.doctor_id?.specializations?.[0] || "",
    consultationType: data.consultation_id?.type || "VIDEO",
    selectedDate,
    timeSlot,
    originalSelectedDate: selectedDate,
    originalTimeSlot: timeSlot,
  };
};

/** Build the API payload from the form data */
const buildPayload = (data: BookingFormData) => {
  // Build date_of_birth as YYYY-MM-DD
  // dobMonth is stored as a month name (e.g. "March"), so convert to a number
  const monthNum = MONTHS_LIST.indexOf(data.dobMonth) + 1;
  const dob = `${data.dobYear}-${String(monthNum).padStart(2, "0")}-${data.dobDay.padStart(2, "0")}`;
  // //  const dobDate = new Date(
  //     Date.UTC(
  //       parseInt(data.dobYear),
  //       parseInt(data.dobMonth) - 1,
  //       parseInt(data.dobDay)
  //     )
  //   );
  //   const dob = dobDate.toISOString();

  // Build scheduled_start_local from selectedDate + timeSlot
  const timeZone = getBrowserTimeZone();
  const [startTimeStr, endTimeStr] = data.timeSlot.split(" - ");

  const naiveBaseDate = parse(data.selectedDate, "d MMMM yyyy", new Date());
  const naiveStart = parse(startTimeStr.trim(), "hh:mm a", naiveBaseDate);

  const naiveEnd = parse(endTimeStr.trim(), "hh:mm a", naiveBaseDate);
  const rawDuration = differenceInMinutes(naiveEnd, naiveStart);
  const durationMinutes: 15 | 30 | 45 | 60 =
    rawDuration <= 15
      ? 15
      : rawDuration <= 30
        ? 30
        : rawDuration <= 45
          ? 45
          : 60;

  return {
    first_name: data.firstName,
    last_name: data.lastName,
    date_of_birth: dob,
    gender: data.gender,
    marital_status: data.maritalStatus,
    occupation: data.occupation,
    present_complaint: data.complaint,
    complaint_brief: data.complaintBrief || undefined,
    Medical_conditions: data.medicalConditions?.length
      ? data.medicalConditions
      : undefined,
    allergies: data.allergies?.length ? data.allergies : undefined,
    doctor_id: data.doctorId,
    scheduled_start_local: formatLocalDateTime(naiveStart),
    timezone: timeZone,
    requested_duration_minutes: durationMinutes,
    reason_for_visit: data.complaint,
    confirm_appointment: true as const,
    consultation_type: data.consultationType as
      | "VIDEO"
      | "CHAT"
      | "AUDIO"
      | "MEETADOCTOR"
      | "HOMESERVICE",
  };
};

const getRejectedMessage = (error: RejectedPayload) =>
  error.message || error.response_description || "";

const shouldReturnToTimeSlotStep = (error: RejectedPayload) => {
  const message = getRejectedMessage(error).toLowerCase();

  return (
    message.includes("cannot book a past timeslot") ||
    message.includes("selected slot is already booked")
  );
};

// ─── Response type from the API ─────────────────────────────────────────────
export type BookingResponse = {
  _id: string;
  appointment_number: string;
  patient_id: string;
  doctor_id: string;
  scheduled_start_at_utc: string;
  scheduled_end_at_utc: string;
  timezone_snapshot: string;
  status: string;
  reason_for_visit: string;
  booking_profile_snapshot: {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: string;
    marital_status: string;
    occupation: string;
    present_complaint: string;
  };
};

// ─── Component ──────────────────────────────────────────────────────────────

const Booking = () => {
  const { getParam, updateParam, deleteParams } = useUrlSearchParams();
  const queryClient = useQueryClient();
  const urlStep = parseInt(getParam("step") || "0", 10);
  const appointmentId = getParam("appointmentId");
  const isReschedule = !!appointmentId;

  const savedState = useMemo(() => {
    return (
      Storages.getStorage<{ step: number; formData: BookingFormData }>(
        "session",
        StorageKeysEnum.bookingState,
      ) || { step: 0, formData: DEFAULT_VALUES }
    );
  }, []);

  const [currentStep, setCurrentStep] = useState(
    !isNaN(urlStep) ? urlStep : savedState.step,
  );
  const [confirmed, setConfirmed] = useState(false);
  const [bookingResult, setBookingResult] = useState<BookingResponse | null>(
    null,
  );

  const defaultFormValues = useMemo(() => {
    const base = { ...DEFAULT_VALUES, ...savedState.formData };
    if (isReschedule) {
      base.timeSlot = "";
      base.selectedDate = "";
    }
    return base;
  }, [savedState.formData, isReschedule]);

  const methods = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: defaultFormValues,
    mode: "onTouched",
  });

  const { user } = useSelector(
    (state: RootState) => state.auth,
  ) as AuthState<Patient>;

  useEffect(() => {
    const subscription = methods.watch((values) => {
      Storages.setStorage("session", StorageKeysEnum.bookingState, {
        step: currentStep,
        formData: values,
      });
    });
    return () => subscription.unsubscribe();
  }, [methods, currentStep]);

  // ── Fetch + populate when editing an existing appointment ──────────
  const hasPopulatedRef = useRef(false);

  const { data: appointmentFormData } = useQuery({
    queryKey: ["appointment", appointmentId],
    queryFn: () => getSingleAppointmentReq(appointmentId ?? ""),
    enabled: !!appointmentId,
    select: appointmentToFormData,
  });

  // Populate the form once when the query resolves
  if (appointmentFormData && !hasPopulatedRef.current) {
    hasPopulatedRef.current = true;
    // In reschedule mode, clear time fields so the user must pick new ones
    if (isReschedule) {
      methods.reset({ ...appointmentFormData, timeSlot: "", selectedDate: "" });
    } else {
      methods.reset(appointmentFormData);
    }
  }

  // ── Auto-fill current user's name for fresh bookings ──────────────
  const hasAutoFilledUserRef = useRef(false);

  if (
    !hasAutoFilledUserRef.current &&
    !appointmentId &&
    savedState.formData.firstName === "" &&
    savedState.formData.lastName === "" &&
    user?.user
  ) {
    hasAutoFilledUserRef.current = true;
    methods.setValue("firstName", user.user.first_name || "");
    methods.setValue("lastName", user.user.last_name || "");
  }

  const syncStep = (step: number) => {
    updateParam("step", String(step), { replace: true });
    Storages.setStorage("session", StorageKeysEnum.bookingState, {
      step,
      formData: methods.getValues(),
    });
  };

  const clearBookingQueryParams = () => {
    deleteParams(["appointmentId", "mode"], { replace: true });
  };

  // ─── Booking mutation ───────────────────────────────────────────────────
  const bookingMutation = useMutation({
    mutationFn: (payload: ReturnType<typeof buildPayload>) =>
      bookAnAppointmentReq(payload),
    onSuccess: (response) => {
      toast.success(
        response.response_description || "Appointment booked successfully!",
      );
      setBookingResult(response.data);
      setConfirmed(true);
      Storages.setStorage("session", StorageKeysEnum.bookingState, null);
      clearBookingQueryParams();
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
    },
    onError: (error: RejectedPayload) => {
      toast.error(
        getRejectedMessage(error) ||
          "Failed to book appointment. Please try again.",
      );
      if (shouldReturnToTimeSlotStep(error)) {
        setCurrentStep(1);
        syncStep(1);
      }
      clearBookingQueryParams();
    },
  });

  // ─── Reschedule mutation ────────────────────────────────────────────────
  const rescheduleMutation = useMutation({
    mutationFn: (payload: {
      scheduled_start_local: string;
      timezone: string;
      requested_duration_minutes: number;
      reason: string;
      requested_specialization: string;
    }) => rescheduleAppointment(payload, appointmentId ?? ""),
    onSuccess: () => {
      toast.success("Appointment rescheduled successfully!");
      setConfirmed(true);
      Storages.setStorage("session", StorageKeysEnum.bookingState, null);
      clearBookingQueryParams();
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
    },
    onError: (error: RejectedPayload) => {
      toast.error(
        getRejectedMessage(error) ||
          "Failed to reschedule appointment. Please try again.",
      );
      if (shouldReturnToTimeSlotStep(error)) {
        methods.setValue("timeSlot", "", { shouldValidate: true });
        methods.setValue("suggestedTimeSlot", undefined);
        methods.setValue("suggestedDate", undefined);
        setCurrentStep(1);
        syncStep(1);
        return;
      }
      clearBookingQueryParams();
    },
  });

  const activeMutation = isReschedule ? rescheduleMutation : bookingMutation;

  const goNext = async () => {
    // Validate only the fields for the current step before advancing
    const fieldsToValidate = STEP_FIELDS[currentStep];
    if (fieldsToValidate) {
      const isValid = await methods.trigger(fieldsToValidate);
      if (!isValid) return;
    }

    if (currentStep === 3) {
      // Final step — build payload and submit
      const allData = methods.getValues();
      if (isReschedule) {
        const targetTimeSlot = allData.suggestedTimeSlot || allData.timeSlot;
        const targetDate = allData.suggestedDate || allData.selectedDate;

        const timeZone = getBrowserTimeZone();
        const [startTimeStr, endTimeStr] = targetTimeSlot.split(" - ");

        const naiveBaseDate = parse(targetDate, "d MMMM yyyy", new Date());
        const naiveStart = parse(startTimeStr.trim(), "hh:mm a", naiveBaseDate);

        const naiveEnd = parse(endTimeStr.trim(), "hh:mm a", naiveBaseDate);
        const rawDuration = differenceInMinutes(naiveEnd, naiveStart);
        const durationMinutes: 15 | 30 | 45 | 60 =
          rawDuration <= 15
            ? 15
            : rawDuration <= 30
              ? 30
              : rawDuration <= 45
                ? 45
                : 60;
        rescheduleMutation.mutate({
          scheduled_start_local: formatLocalDateTime(naiveStart),
          timezone: timeZone,
          requested_duration_minutes: durationMinutes,
          reason: allData.complaint || "Rescheduled by patient",
          requested_specialization:
            allData.suggestedDoctorSpecialty || allData.doctorSpecialty,
        });
      } else {
        const payload = buildPayload(allData);
        bookingMutation.mutate(payload);
      }
    } else {
      const nextStep = isReschedule && currentStep === 1 ? 3 : currentStep + 1;
      setCurrentStep(nextStep);
      syncStep(nextStep);
    }
  };

  const goBack = () => {
    const prevStep =
      isReschedule && currentStep === 3 ? 1 : Math.max(0, currentStep - 1);
    setCurrentStep(prevStep);
    syncStep(prevStep);
  };

  const reset = () => {
    setCurrentStep(0);
    methods.reset(DEFAULT_VALUES);
    setConfirmed(false);
    setBookingResult(null);
    updateParam("step", "0", { replace: true });
    clearBookingQueryParams();
    Storages.setStorage("session", StorageKeysEnum.bookingState, null);
  };

  if (confirmed) {
    return (
      <div className="flex items-center justify-center p-4 h-full">
        <AppointmentConfirmed
          data={methods.getValues()}
          appointmentResponse={bookingResult}
          onReset={reset}
        />
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="w-full h-full grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-4 overflow-hidden">
        <div className="hidden md:block h-full overflow-y-auto hidden-scrollbar">
          <StepSidebar currentStep={currentStep} />
        </div>
        <div className="col-span-1 md:col-span-2 md:border-l border-border flex flex-col h-full overflow-hidden">
          <div className="flex-none flex items-center justify-between p-4 md:p-6 pb-2 border-b">
            <h2 className="text-base md:text-lg font-semibold text-foreground">
              {STEP_TITLES[currentStep]}
            </h2>
            {currentStep > 0 && (
              <button
                type="button"
                onClick={goBack}
                className="text-muted-foreground hover:text-foreground flex justify-center items-center bg-[#F7F7F7] rounded-full size-8 md:size-10 hover:bg-[#F7F7F7]/20 transition-colors ease-out duration-200"
              >
                <MoveLeft className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            )}
          </div>
          <div className="flex-1 relative p-4 md:px-6 md:pb-6 mt-2 md:mt-4 overflow-y-auto hidden-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className=""
              >
                {currentStep === 0 && (
                  <PersonalDetails
                    onNext={goNext}
                    isReschedule={isReschedule}
                  />
                )}
                {currentStep === 1 && (
                  <ChooseTimeSlot
                    onNext={goNext}
                    onBack={goBack}
                    onDoctorUnavailable={() => {
                      setCurrentStep(2);
                      syncStep(2);
                    }}
                    isReschedule={isReschedule}
                  />
                )}
                {currentStep === 2 && (
                  <FindDoctor onNext={goNext} onBack={goBack} />
                )}
                {/* {currentStep === 3 && (
                  <ChoosePayment onNext={goNext} onBack={goBack} />
                )} */}
                {currentStep === 3 && (
                  <ConfirmAppointment
                    onNext={goNext}
                    onBack={goBack}
                    isPending={activeMutation.isPending}
                    isReschedule={isReschedule}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default Booking;
