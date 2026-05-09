import {
  Activity,
  Pill,
  FileText,
  Stethoscope,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ConsultationActionCenterProps {
  consultationId: string;
  medicationCount: number;
  pendingInvestigationCount: number;
  consultationProgress: number;
  onOpenMedication: () => void;
  onOpenInvestigation: () => void;
}

export function ConsultationActionCenter({
  consultationId,
  medicationCount,
  pendingInvestigationCount,
  consultationProgress,
  onOpenMedication,
  onOpenInvestigation,
}: ConsultationActionCenterProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-5 lg:sticky top-6">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4 md:mb-5">
        <Activity className="w-4 h-4 text-primary" />
        Action Center
      </h3>

      <div className="space-y-4">
        <button
          type="button"
          onClick={onOpenMedication}
          className="w-full text-left flex items-start gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer border border-primary/10"
        >
          <div className="bg-primary/20 p-2 rounded-full shrink-0">
            <Pill className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-foreground">
              Review medications
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {medicationCount > 0
                ? `${medicationCount} prescription${medicationCount > 1 ? "s" : ""} available`
                : "View medication plan and download prescription PDF"}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground self-center" />
        </button>

        <button
          type="button"
          onClick={onOpenInvestigation}
          className="w-full text-left flex items-start gap-3 p-3 rounded-lg bg-[#F7F7F7] hover:bg-[#EAEAEA] transition-colors cursor-pointer border border-border"
        >
          <div className="bg-background p-2 rounded-full shrink-0 shadow-sm border border-border/50">
            <FileText className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-foreground">
              Upload Lab Results
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {pendingInvestigationCount > 0
                ? `${pendingInvestigationCount} investigation result${pendingInvestigationCount > 1 ? "s are" : " is"} pending upload`
                : "Open investigation tab to upload your results"}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground self-center" />
        </button>

        <button
          type="button"
          onClick={() =>
            navigate(
              `/patient/dashboard/referrals?consultation_id=${consultationId}`,
            )
          }
          className="w-full text-left flex items-start gap-3 p-3 rounded-lg bg-[#F7F7F7] hover:bg-[#EAEAEA] transition-colors cursor-pointer border border-border"
        >
          <div className="bg-background p-2 rounded-full shrink-0 shadow-sm border border-border/50">
            <Stethoscope className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-foreground">
              View Referral History
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Open referrals linked to this consultation
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground self-center" />
        </button>
      </div>

      <div className="mt-5 md:mt-6 pt-4 md:pt-5 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] md:text-xs font-semibold text-muted-foreground">
            Consultation Progress
          </span>
          <span className="text-[10px] md:text-xs font-bold text-primary">
            {consultationProgress}%
          </span>
        </div>
        <div className="h-1.5 md:h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${consultationProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
