import { Loader2 } from "lucide-react";
import type { ReferralItem } from "./consultation-detail.types.patient";

interface ConsultationReferralsTabProps {
  isLoading: boolean;
  isError: boolean;
  referrals: ReferralItem[];
}

export function ConsultationReferralsTab({
  isLoading,
  isError,
  referrals,
}: ConsultationReferralsTabProps) {
  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        Failed to load referral data.
      </div>
    );
  }

  if (referrals.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No referrals found.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {referrals.map((referral) => (
        <div
          key={referral._id}
          className="rounded-lg border border-border bg-[#F7F7F7] p-4"
        >
          <p className="text-sm font-semibold text-foreground">
            {referral.specialist_name}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {referral.hospital}
          </p>
          <p className="text-sm text-foreground mt-2">
            {referral.referral_details}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Referred by {referral.doctor_id.full_name} •{" "}
            {new Date(referral.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}
