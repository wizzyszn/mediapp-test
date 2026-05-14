export type ConsultationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELED"
  | "CANCELLED"
  | "NO_SHOW"
  | "FAILED"
  | "FORFEITED"
  | "RESCHEDULED";

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELED"
  | "CANCELLED"
  | "NO_SHOW"
  | "FAILED"
  | "FORFEITED"
  | "RESCHEDULED";

export interface BaseItem {
  id: string;
  first_name: string;
  last_name: string;
  patientName: string;
  ref: string;
  type: string;
  date: { day: number; month: string };
  time: string;
  profile_picture_url?: string;
}

export interface Consultation extends BaseItem {
  status: ConsultationStatus;
  appointmentId?: string;
}

export interface Appointment extends BaseItem {
  status: AppointmentStatus;
  hasRescheduledHistory?: boolean;
}

// Raw API shape from /doctors/consultations (list)
export interface RawDoctorConsultation {
  _id: string;
  consultation_id: string;
  type: "VIDEO" | "AUDIO" | "IN_PERSON";
  status: ConsultationStatus;
  title: string;
  details: string;
  consoltation_for: string;
  user_id: {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    date_of_birth?: string;
    full_name?: string;
    gender?: string;
    phone_number?: string;
    profile_picture_url?: string;
    id?: string;
  };
  doctor_id: {
    _id: string;
    first_name: string;
    last_name: string;
    full_name?: string;
    email: string;
    phone_number?: string;
    specializations?: string[];
    profile_picture_url?: string;
    id?: string;
  };
  appointment_id: {
    _id: string;
    appointment_number: string;
    scheduled_start_at_utc: string;
    scheduled_end_at_utc: string;
    timezone_snapshot: string;
    status: AppointmentStatus;
    reason_for_visit: string;
  };
}

export interface RawDoctorConsultationDetail {
  _id: string;
  consultation_id: string;
  type: "VIDEO" | "AUDIO" | "IN_PERSON";
  status: ConsultationStatus;
  title: string;
  details: string;
  consoltation_for: string;
  doctor_id: string; // ✅ just a string ID on this endpoint too
  createdAt: string;
  updatedAt: string;
  user_id: {
    // ✅ this is what's populated, not doctor_id
    _id: string;
    registration_no: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    full_name: string;
    email: string;
    phone_number: string;
    gender?: string;
    date_of_birth?: string;
    marital_status?: string;
    occupation?: string;
    address?: string;
    allergies?: string[];
    previous_medical_conditions?: string[];
    verified: boolean;
  };
  appointment_id: {
    _id: string;
    appointment_number: string;
    scheduled_start_at_utc: string;
    scheduled_end_at_utc: string;
    timezone_snapshot: string;
    status: AppointmentStatus;
    reason_for_visit: string;
  };
}
