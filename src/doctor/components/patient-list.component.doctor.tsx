import { useNavigate } from "react-router-dom";
import { ChevronRight, User } from "lucide-react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Pagination } from "@/shared/components/pagination.component.shared";
import { getDoctorPatientsReq } from "@/config/service/doctor.service";
import { formatZonedTime } from "@/lib/utils";
import { ItemRow } from "./item-row.component.doctor";
import { useSelector } from "react-redux";
import { RootState } from "@/config/stores/store";

interface Patient {
  _id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone_number: string;
  registration_no?: string;
  createdAt?: string;
  profile_picture_url?: string;
  consultation_id: string | null;
  has_consultation_with_doctor: boolean;
}

export function PatientList({
  searchTerm = "",
  page = 1,
  limit = 20,
  onPageChange,
}: {
  searchTerm?: string;
  page?: number;
  limit?: number;
  onPageChange: (page: number) => void;
}) {
  const navigate = useNavigate();
  const userTimezone = useSelector((state: RootState) => state.auth.timezone);

  const { data, isLoading } = useQuery({
    queryKey: [
      "doctor-patients",
      { q: searchTerm, page: String(page), limit: String(limit) },
    ],
    queryFn: () =>
      getDoctorPatientsReq({
        q: searchTerm,
        page: String(page),
        limit: String(limit),
      }),
    placeholderData: keepPreviousData,
  });

  const patients = (data?.data?.patients as Patient[]) || [];
  const totalPages = data?.data?.meta?.lastPage ?? 1;

  if (isLoading) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="h-20 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (!patients.length) {
    return (
      <div className="h-36 rounded-xl border border-border bg-white text-center text-muted-foreground flex items-center justify-center">
        No patients found.
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl bg-white shadow-sm border border-border p-4">
      <div className="mt-0 flex flex-col gap-2">
        {patients.map((patient) => {
          const joinedDate = new Date(patient.createdAt || Date.now());

          const patientItem = {
            id: patient._id,
            patientName:
              patient.full_name || `${patient.first_name} ${patient.last_name}`,
            ref: patient.registration_no || "N/A",
            date: {
              day: joinedDate.getDate(),
              month: joinedDate.toLocaleString("default", { month: "short" }),
            },
            time: `Registered ${formatZonedTime(joinedDate, { timeZone: userTimezone })}`,
            profile_picture_url: patient.profile_picture_url,
            first_name: patient.first_name,
            last_name: patient.last_name,
          };

          const hasConsultation = patient.has_consultation_with_doctor;

          const handlePatientClick = () => {
            if (!hasConsultation || !patient.consultation_id) return;
            navigate(
              `/doctor/dashboard/consultations/${patient.consultation_id}`,
              {
                state: { fromPatientRoute: true },
              },
            );
          };

          return (
            <div
              key={patient._id}
              onClick={handlePatientClick}
              className={`block transition-opacity ${
                hasConsultation
                  ? "cursor-pointer hover:opacity-90"
                  : "cursor-default opacity-80"
              }`}
            >
              <ItemRow item={patientItem}>
                <div className="flex items-center gap-2">
                  {!hasConsultation && (
                    <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 whitespace-nowrap">
                      No consultation
                    </span>
                  )}
                  <User size={16} color="#969696" />
                  {hasConsultation && (
                    <ChevronRight size={16} className="text-muted-foreground" />
                  )}
                </div>
              </ItemRow>
            </div>
          );
        })}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
