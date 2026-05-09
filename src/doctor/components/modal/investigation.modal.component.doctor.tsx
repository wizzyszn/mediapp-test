import { useState } from "react";
import { Plus, Minus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createInvestigationListForConsultationReq } from "@/config/service/doctor.service";

interface Investigation {
  id: number;
  name: string;
}

interface InvestigationModalProps {
  onClose: () => void;
  consultationId: string;
}

export function InvestigationModal({
  onClose,
  consultationId,
}: InvestigationModalProps) {
  const [investigations, setInvestigations] = useState<Investigation[]>([
    { id: 1, name: "" },
  ]);

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: { names: string[]; assign_to_patient: boolean }) =>
      createInvestigationListForConsultationReq(consultationId, data),
    onSuccess: (res) => {
      toast.success(
        res.response_description || "Investigation saved successfully",
      );
      queryClient.invalidateQueries({
        queryKey: ["investigation-list", consultationId],
      });
      queryClient.invalidateQueries({ queryKey: ["investigation_doc"] });
      onClose();
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Failed to save investigation. Please try again.",
      );
    },
  });

  const addInvestigation = () => {
    setInvestigations([...investigations, { id: Date.now(), name: "" }]);
  };

  const removeInvestigation = (id: number) => {
    if (investigations.length > 1) {
      setInvestigations(investigations.filter((inv) => inv.id !== id));
    }
  };

  const updateInvestigation = (id: number, name: string) => {
    setInvestigations(
      investigations.map((inv) => (inv.id === id ? { ...inv, name } : inv)),
    );
  };

  const validateAndSubmit = (assignToPatient: boolean) => {
    if (!consultationId) {
      toast.error("Consultation ID is missing. Please try again.");
      return;
    }

    const names = investigations
      .map((inv) => inv.name.trim())
      .filter((name) => name !== "");

    if (names.length === 0) {
      toast.error("Please select at least one investigation.");
      return;
    }

    mutate({ names, assign_to_patient: assignToPatient });
  };

  const handleSave = () => {
    validateAndSubmit(false);
  };

  const handleGenerate = () => {
    validateAndSubmit(true);
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] w-[95vw] p-0 gap-0 overflow-hidden bg-white rounded-lg">
        {/* Header */}
        <DialogHeader className="px-4 sm:px-6 py-4 flex flex-row items-center justify-between border-b border-gray-200 space-y-0">
          <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900">
            Investigation Request
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            {investigations.map((inv) => (
              <div
                key={inv.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <select
                  value={inv.name}
                  onChange={(e) => updateInvestigation(inv.id, e.target.value)}
                  className="flex-1 w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:border-[#5164E8]"
                  disabled={isPending}
                >
                  <option value="">Select Investigation</option>
                  <option value="Blood Glucose">Blood Glucose</option>
                  <option value="HbA1c">HbA1c</option>
                  <option value="Lipid Panel">Lipid Panel</option>
                  <option value="CBC">Complete Blood Count</option>
                  <option value="ECG">ECG</option>
                  <option value="Chest X-ray">Chest X-ray</option>
                  <option value="Echocardiogram">Echocardiogram</option>
                  <option value="Stress Test">Stress Test</option>
                  <option value="CT Scan">CT Scan</option>
                  <option value="MRI">MRI</option>
                  <option value="Ultrasound">Ultrasound</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={addInvestigation}
                    className="p-2 bg-[#077e5c] text-white rounded-lg hover:bg-[#0c926a] transition-colors"
                    disabled={isPending}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => removeInvestigation(inv.id)}
                    className="p-2 bg-[#BA1A1A] text-white rounded-lg hover:bg-[#FF5252] transition-colors disabled:opacity-50"
                    disabled={investigations.length === 1 || isPending}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isPending}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 text-sm font-medium"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="w-full sm:w-auto flex justify-center items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-2 bg-[#5164E8] text-white rounded-lg hover:bg-[#4153D7] transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save
          </button>
          <button
            onClick={handleGenerate}
            disabled={isPending}
            className="w-full sm:w-auto flex justify-center items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-2 bg-[#5164E8] text-white rounded-lg hover:bg-[#4153D7] transition-colors disabled:opacity-50 text-sm font-medium"
          >
            Generate
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
