import { User, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { differenceInYears, format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import {
  getPatientConsultationHistoryreq,
  getPatientMedicationHistoryreq,
  getPatientMedicationDiagnosisreq,
} from "@/config/service/doctor.service";

// interface ReferralRecord {
//   date: string;
//   bookingRef: string;
//   referral: string;
// }

// const referrals: ReferralRecord[] = [
//   {
//     date: "2026-02-15",
//     bookingRef: "BK-0892",
//     referral: "Cardiology - Dr. Martinez",
//   },
// ];

interface PatientSidebarProps {
  patient?: {
    full_name?: string;
    first_name?: string;
    last_name?: string;
    id?: string;
    _id?: string;
    date_of_birth?: string;
    address?: string;
    marital_status?: string;
    occupation?: string;
    allergies?: string[];
    previous_medical_conditions?: string[];
  };
}

export function PatientDataSidebar({ patient }: PatientSidebarProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(
    "consultations",
  );

  const patientId = patient?._id || patient?.id || "";

  const { data: consultationsData, isLoading: consultationsLoading } = useQuery(
    {
      queryKey: ["patient-consultation-history", patientId],
      queryFn: () => getPatientConsultationHistoryreq(patientId),
      enabled: !!patientId,
    },
  );

  const { data: medicationsData, isLoading: medicationsLoading } = useQuery({
    queryKey: ["patient-medication-history", patientId],
    queryFn: () => getPatientMedicationHistoryreq(patientId),
    enabled: !!patientId,
  });

  const { data: diagnosesData, isLoading: diagnosesLoading } = useQuery({
    queryKey: ["patient-diagnosis-history", patientId],
    queryFn: () => getPatientMedicationDiagnosisreq(patientId),
    enabled: !!patientId,
  });

  const consultations = consultationsData?.data ?? [];
  const medications = medicationsData?.data ?? [];
  const diagnoses = diagnosesData?.data ?? [];

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const LoadingRow = ({ colSpan }: { colSpan: number }) => (
    <tr>
      <td colSpan={colSpan} className="py-4 text-center">
        <Loader2 className="w-4 h-4 animate-spin inline-block mr-2 text-[#6B7280]" />
        <span className="text-[#6B7280]">Loading...</span>
      </td>
    </tr>
  );

  const EmptyRow = ({ colSpan, label }: { colSpan: number; label: string }) => (
    <tr>
      <td colSpan={colSpan} className="py-4 text-center text-[#9CA3AF] text-xs">
        No {label} found
      </td>
    </tr>
  );

  return (
    <div className="bg-white border-r border-[#E5E7EB] overflow-y-auto h-full shadow-sm">
      <div className="p-4 md:p-6">
        {/* Patient Profile Header */}
        <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6 bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-[#5164E8] rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
            <User className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-[#1F2937] font-bold text-base md:text-[17px] leading-tight mb-0.5">
              {patient
                ? patient.full_name ||
                  `${patient.first_name} ${patient.last_name}`
                : "Loading..."}
            </h2>
            <p className="text-[#6B7280] text-sm md:text-[15px]">
              {patient?.id
                ? `MRN-${patient.id.slice(-6).toUpperCase()}`
                : "Loading..."}
            </p>
          </div>
        </div>

        {/* Patient Info Stack */}
        <div className="space-y-3 mb-6 text-sm">
          <div className="text-[#4B5563] space-y-1">
            <p>
              <span className="font-semibold">Age:</span>{" "}
              {patient?.date_of_birth
                ? differenceInYears(new Date(), new Date(patient.date_of_birth))
                : "-"}{" "}
              years
            </p>
            <p>
              <span className="font-semibold">DOB:</span>{" "}
              {patient?.date_of_birth
                ? new Date(patient.date_of_birth).toISOString().split("T")[0]
                : "-"}
            </p>
            <p>
              <span className="font-semibold">Address:</span>{" "}
              {patient?.address || "-"}
            </p>
            <p>
              <span className="font-semibold">Marital Status:</span>{" "}
              {patient?.marital_status || "-"}
            </p>
            <p>
              <span className="font-semibold">Occupation:</span>{" "}
              {patient?.occupation || "-"}
            </p>
          </div>

          {/* Allergies */}
          <div className="mt-3">
            <span className="text-[#4B5563] font-semibold">Allergies:</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {patient?.allergies?.length ? (
                patient.allergies.map((a: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-[#F3F4F6] text-[#374151] rounded-full text-xs"
                  >
                    {a}
                  </span>
                ))
              ) : (
                <span className="px-3 py-1 bg-[#F3F4F6] text-[#374151] rounded-full text-xs">
                  No Known Allergy
                </span>
              )}
            </div>
          </div>

          {/* Medical Conditions */}
          <div className="mt-3">
            <span className="text-[#4B5563] font-semibold">Conditions:</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {patient?.previous_medical_conditions?.length ? (
                patient.previous_medical_conditions.map(
                  (c: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-[#F3F4F6] text-[#374151] rounded-full text-xs"
                    >
                      {c}
                    </span>
                  ),
                )
              ) : (
                <span className="px-3 py-1 bg-[#F3F4F6] text-[#374151] rounded-full text-xs">
                  No Known Conditions
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Expandable Cards */}
        <div className="space-y-3 text-xs">
          {/* Consultations */}
          <div className="bg-[#F9FAFB] rounded-lg overflow-hidden border border-[#E5E7EB]">
            <button
              onClick={() => toggleSection("consultations")}
              className="w-full flex items-center justify-between p-4 hover:bg-[#F3F4F6] transition-colors"
            >
              <span className="text-[#1F2937] font-semibold">
                Consultations
              </span>
              {expandedSection === "consultations" ? (
                <ChevronDown className="w-5 h-5 text-[#6B7280]" />
              ) : (
                <ChevronRight className="w-5 h-5 text-[#6B7280]" />
              )}
            </button>
            {expandedSection === "consultations" && (
              <div className="p-4 pt-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-[#6B7280] border-b border-[#E5E7EB]">
                        <th className="text-left py-2 px-1">Date</th>
                        <th className="text-left py-2 px-1">Type</th>
                        <th className="text-left py-2 px-1">Doctor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consultationsLoading ? (
                        <LoadingRow colSpan={3} />
                      ) : consultations.length === 0 ? (
                        <EmptyRow colSpan={3} label="consultations" />
                      ) : (
                        consultations.map((consult) => (
                          <tr
                            key={consult._id}
                            className="text-[#374151] hover:bg-[#F3F4F6] cursor-pointer transition-colors"
                          >
                            <td className="py-2 px-1">
                              {format(
                                new Date(consult.createdAt),
                                "yyyy-MM-dd",
                              )}
                            </td>
                            <td className="py-2 px-1 capitalize">
                              {consult.type}
                            </td>
                            <td className="py-2 px-1">
                              Dr. {consult.doctor_id?.last_name ?? "—"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Diagnoses */}
          <div className="bg-[#F9FAFB] rounded-lg overflow-hidden border border-[#E5E7EB]">
            <button
              onClick={() => toggleSection("diagnoses")}
              className="w-full flex items-center justify-between p-4 hover:bg-[#F3F4F6] transition-colors"
            >
              <span className="text-[#1F2937] font-semibold">Diagnoses</span>
              {expandedSection === "diagnoses" ? (
                <ChevronDown className="w-5 h-5 text-[#6B7280]" />
              ) : (
                <ChevronRight className="w-5 h-5 text-[#6B7280]" />
              )}
            </button>
            {expandedSection === "diagnoses" && (
              <div className="p-4 pt-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-[#6B7280] border-b border-[#E5E7EB]">
                        <th className="text-left py-2 px-1">Date</th>
                        <th className="text-left py-2 px-1">Title</th>
                        <th className="text-left py-2 px-1">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {diagnosesLoading ? (
                        <LoadingRow colSpan={3} />
                      ) : diagnoses.length === 0 ? (
                        <EmptyRow colSpan={3} label="diagnoses" />
                      ) : (
                        diagnoses.map((diag) => (
                          <tr
                            key={diag._id}
                            className="text-[#374151] hover:bg-[#F3F4F6] cursor-pointer transition-colors"
                          >
                            <td className="py-2 px-1">
                              {format(new Date(diag.createdAt), "yyyy-MM-dd")}
                            </td>
                            <td className="py-2 px-1">{diag.title}</td>
                            <td className="py-2 px-1 capitalize">
                              {diag.status}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Medications */}
          <div className="bg-[#F9FAFB] rounded-lg overflow-hidden border border-[#E5E7EB]">
            <button
              onClick={() => toggleSection("medications")}
              className="w-full flex items-center justify-between p-4 hover:bg-[#F3F4F6] transition-colors"
            >
              <span className="text-[#1F2937] font-semibold">Medications</span>
              {expandedSection === "medications" ? (
                <ChevronDown className="w-5 h-5 text-[#6B7280]" />
              ) : (
                <ChevronRight className="w-5 h-5 text-[#6B7280]" />
              )}
            </button>
            {expandedSection === "medications" && (
              <div className="p-4 pt-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-[#6B7280] border-b border-[#E5E7EB]">
                        <th className="text-left py-2 px-1">Date</th>
                        <th className="text-left py-2 px-1">Medication</th>
                        <th className="text-left py-2 px-1">Dose</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicationsLoading ? (
                        <LoadingRow colSpan={3} />
                      ) : medications.length === 0 ? (
                        <EmptyRow colSpan={3} label="medications" />
                      ) : (
                        medications.map((med) => (
                          <tr
                            key={med._id}
                            className="text-[#374151] hover:bg-[#F3F4F6] cursor-pointer transition-colors"
                          >
                            <td className="py-2 px-1">
                              {format(new Date(med.createdAt), "yyyy-MM-dd")}
                            </td>
                            <td className="py-2 px-1">{med.medication}</td>
                            <td className="py-2 px-1">
                              {med.dose} {med.unit}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Referrals */}
          {/* <div className="bg-[#F9FAFB] rounded-lg overflow-hidden border border-[#E5E7EB]">
            <button
              onClick={() => toggleSection("referrals")}
              className="w-full flex items-center justify-between p-4 hover:bg-[#F3F4F6] transition-colors"
            >
              <span className="text-[#1F2937] font-semibold">Referrals</span>
              {expandedSection === "referrals" ? (
                <ChevronDown className="w-5 h-5 text-[#6B7280]" />
              ) : (
                <ChevronRight className="w-5 h-5 text-[#6B7280]" />
              )}
            </button>
            {expandedSection === "referrals" && (
              <div className="p-4 pt-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-[#6B7280] border-b border-[#E5E7EB]">
                        <th className="text-left py-2 px-1">Date</th>
                        <th className="text-left py-2 px-1">Referral</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referrals.map((ref, idx) => (
                        <tr
                          key={idx}
                          className="text-[#374151] hover:bg-[#F3F4F6] cursor-pointer transition-colors"
                        >
                          <td className="py-2 px-1">{ref.date}</td>
                          <td className="py-2 px-1">{ref.referral}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div> */}
        </div>
      </div>
    </div>
  );
}
