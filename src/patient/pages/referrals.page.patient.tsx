import { useState, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useQuery } from "@tanstack/react-query";
import { getGroupedReferralsForConsultationsReq } from "@/config/service/patient.service";
import useUrlSearchParams from "@/shared/hooks/use-url-search-params";
import { toast } from "sonner";
import { ReferralPageHeader } from "@/patient/components/referral/referral-page-header.component.patient";
import { ReferralSearchBar } from "@/patient/components/referral/referral-search-bar.component.patient";
import { ReferralGroupCard } from "@/patient/components/referral/referral-group-card.component.patient";
import { ReferralEmptyState } from "@/patient/components/referral/referral-empty-state.component.patient";
import {
  ReferralGroup,
  ReferralItem,
} from "@/patient/components/referral/referral.types.patient";
import { PatientRecordGroupSkeleton } from "@/shared/components/patient-record-skeletons.component.shared";

interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

export default function ReferralsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { updateParam } = useUrlSearchParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["patient-referrals-grouped"],
    queryFn: () => getGroupedReferralsForConsultationsReq(),
  });

  const groups = useMemo(() => (data?.data || []) as ReferralGroup[], [data]);

  const filteredGroups = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return groups;

    return groups.filter((group) => {
      const consultationTitle = (
        group.consultation?.title || "Consultation"
      ).toLowerCase();
      const reference = (group.consultation?._id || "").toLowerCase();

      // Also search within individual referrals
      const refMatch = group.referrals?.some((ref) => {
        const specialist = (ref.specialist_name || "").toLowerCase();
        const hospital = (ref.hospital || "").toLowerCase();
        const doctorName = (ref.doctor_id?.full_name || "").toLowerCase();
        return (
          specialist.includes(normalizedSearch) ||
          hospital.includes(normalizedSearch) ||
          doctorName.includes(normalizedSearch)
        );
      });

      return (
        consultationTitle.includes(normalizedSearch) ||
        reference.includes(normalizedSearch) ||
        refMatch
      );
    });
  }, [groups, searchTerm]);

  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

  const toggleGroup = (groupId: string) => {
    setExpandedGroupId((prev) => (prev === groupId ? null : groupId));
  };

  /* ─── PDF Generation (per group — all referrals in the consultation) ─── */

  const handleDownloadPDF = (group: ReferralGroup) => {
    try {
      const doc = new jsPDF();

      const consultationTitle = group.consultation?.title || "Consultation";

      doc.setFontSize(22);
      doc.setTextColor(99, 102, 241);
      doc.text("Medical Referrals", 14, 22);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Consultation: ${consultationTitle}`, 14, 30);
      doc.text(`Reference: ${group.consultation?._id || "N/A"}`, 14, 35);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 40);

      const tableBody = (group.referrals || []).map((ref: ReferralItem) => [
        ref.specialist_name,
        ref.hospital,
        ref.doctor_id?.full_name || "N/A",
        ref.referral_details,
        new Date(ref.createdAt).toLocaleDateString(),
      ]);

      autoTable(doc, {
        startY: 50,
        head: [
          ["Specialist", "Hospital", "Referring Doctor", "Details", "Date"],
        ],
        body: tableBody,
        theme: "striped",
        headStyles: { fillColor: [99, 102, 241] },
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: {
          3: { cellWidth: 60 },
        },
      });

      const finalY =
        (doc as unknown as jsPDFWithAutoTable).lastAutoTable.finalY + 15;
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(
        "This is an electronically generated document. No signature is required.",
        14,
        finalY,
      );

      doc.save(`Referrals_${consultationTitle}.pdf`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <ReferralPageHeader />

      <section className="overflow-hidden rounded-[20px] border border-[#F0F0F0] bg-white shadow-sm">
        <div className="border-b border-[#F0F0F0] px-4 py-4 sm:px-6">
          <h2 className="text-sm font-semibold text-[#6C6C6C]">
            Referral History
          </h2>
        </div>

        <div className="flex flex-col gap-4 p-4 sm:p-6">
          <ReferralSearchBar value={searchTerm} onChange={setSearchTerm} />

          <div className="flex flex-col gap-2">
            {isLoading ? (
              <PatientRecordGroupSkeleton count={4} />
            ) : isError ? (
              <div className="text-center py-12 text-red-500">
                Failed to load referral history. Please try again later.
              </div>
            ) : filteredGroups.length > 0 ? (
              filteredGroups.map((group, index) => {
                const consultationId =
                  group.consultation?._id || `unknown-${index}`;
                const isExpanded = expandedGroupId === consultationId;

                return (
                  <ReferralGroupCard
                    key={consultationId}
                    group={group}
                    index={index}
                    isExpanded={isExpanded}
                    onToggle={toggleGroup}
                    onDownload={handleDownloadPDF}
                  />
                );
              })
            ) : (
              <ReferralEmptyState
                onBookConsultant={() => updateParam("step", "0")}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
