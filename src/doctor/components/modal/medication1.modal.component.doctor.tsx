import { useState } from "react";
import { Plus, Minus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createMedicationForConsultationReq } from "@/config/service/doctor.service";

// API enum values
const FORMULARY_OPTIONS = ["TABLET", "SYRUP", "CAPSULE", "INJECTION"] as const;
const UNIT_OPTIONS = [
  "MILLIGRAM",
  "MICROGRAM",
  "PUFFS",
  "TABS",
  "CAB",
  "MLS",
  "LITRE",
] as const;
const INTERVAL_OPTIONS = ["DAILY", "WEEKLY", "MONTHLY", "AS_NEEDED"] as const;
const DURATION_UNIT_OPTIONS = ["MINUTE", "HOUR", "DAY", "MONTH"] as const;

type Formulation = (typeof FORMULARY_OPTIONS)[number];
type Unit = (typeof UNIT_OPTIONS)[number];
type Interval = (typeof INTERVAL_OPTIONS)[number];
type DurationUnit = (typeof DURATION_UNIT_OPTIONS)[number];

interface Medication {
  id: number;
  formulary: Formulation | "";
  name: string;
  dose: string;
  unit: Unit | "";
  interval: Interval | "";
  durationNumber: string;
  durationUnit: DurationUnit | "";
}

interface MedicationModalProps {
  onClose: () => void;
  consultationId?: string;
}

export function MedicationModal({
  onClose,
  consultationId,
}: MedicationModalProps) {
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: 1,
      formulary: "",
      name: "",
      dose: "",
      unit: "",
      interval: "",
      durationNumber: "",
      durationUnit: "",
    },
  ]);

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: {
      medications: {
        formulary: Formulation;
        medication: string;
        unit: Unit;
        dose?: number;
        interval: Interval;
        duration_unit: DurationUnit;
        duration?: number;
        assign_to_patient: boolean;
      }[];
    }) => createMedicationForConsultationReq(consultationId!, data),
    onSuccess: (res) => {
      toast.success(
        res?.response_description || "Medication saved successfully",
      );
      queryClient.invalidateQueries({ queryKey: ["medications_doc"] });
      queryClient.invalidateQueries({
        queryKey: ["medications", consultationId],
      });
      onClose();
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Failed to save medication. Please try again.",
      );
    },
  });

  const addMedication = () => {
    setMedications([
      ...medications,
      {
        id: Date.now(),
        formulary: "",
        name: "",
        dose: "",
        unit: "",
        interval: "",
        durationNumber: "",
        durationUnit: "",
      },
    ]);
  };

  const removeMedication = (id: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((med) => med.id !== id));
    }
  };

  const updateMedication = (
    id: number,
    field: keyof Medication,
    value: string,
  ) => {
    setMedications(
      medications.map((med) =>
        med.id === id ? { ...med, [field]: value } : med,
      ),
    );
  };

  const validateAndSubmit = (assignToPatient: boolean) => {
    if (!consultationId) {
      toast.error("Consultation ID is missing. Please try again.");
      return;
    }

    // Validate all medications have required fields
    for (let i = 0; i < medications.length; i++) {
      const med = medications[i];
      if (!med.formulary) {
        toast.error(`Please select a formulary for medication ${i + 1}`);
        return;
      }
      if (!med.name.trim()) {
        toast.error(`Please enter a medication name for medication ${i + 1}`);
        return;
      }
      if (!med.unit) {
        toast.error(`Please select a unit for medication ${i + 1}`);
        return;
      }
      if (!med.interval) {
        toast.error(`Please select an interval for medication ${i + 1}`);
        return;
      }
      if (!med.durationUnit) {
        toast.error(`Please select a duration unit for medication ${i + 1}`);
        return;
      }
    }

    const payload = {
      medications: medications.map((med) => ({
        formulary: med.formulary as Formulation,
        medication: med.name,
        unit: med.unit as Unit,
        dose: med.dose ? Number(med.dose) : undefined,
        interval: med.interval as Interval,
        duration_unit: med.durationUnit as DurationUnit,
        duration: med.durationNumber ? Number(med.durationNumber) : undefined,
        assign_to_patient: assignToPatient,
      })),
    };

    mutate(payload);
  };

  const handleSave = () => {
    validateAndSubmit(false);
  };

  const handleGeneratePrescription = () => {
    validateAndSubmit(true);
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-[700px] lg:max-w-[1000px] xl:max-w-[1200px] p-0 gap-0 overflow-hidden bg-white max-h-[90vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="px-4 sm:px-6 py-4 flex flex-row items-center justify-between border-b border-gray-200 space-y-0 shrink-0">
          <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900">
            Prescription Builder
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[70vh]">
          {/* Desktop Header */}
          <div className="hidden lg:block mb-4 bg-gray-100 p-3 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex-1 grid grid-cols-8 gap-3 text-sm text-gray-700 font-semibold items-center">
                <div>Formulary</div>
                <div className="col-span-2">Medication</div>
                <div>Dose</div>
                <div>Unit</div>
                <div>Interval</div>
                <div>Duration</div>
                <div>Duration Unit</div>
              </div>
              <div className="w-[88px]" /> {/* Spacer for action buttons */}
            </div>
          </div>

          <div className="space-y-4 lg:space-y-3">
            {medications.map((med, index) => (
              <div
                key={med.id}
                className="relative flex flex-col lg:flex-row items-start gap-4 lg:gap-3 bg-gray-50 lg:bg-transparent p-4 lg:p-0 rounded-lg border lg:border-none border-gray-200"
              >
                {/* Mobile Medication Label */}
                <div className="lg:hidden flex items-center justify-between w-full mb-2">
                  <span className="font-semibold text-gray-700 text-sm">
                    Medication {index + 1}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={addMedication}
                      className="p-1.5 bg-[#00C48C] text-white rounded-md hover:bg-[#00B37E] transition-colors"
                      disabled={isPending}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeMedication(med.id)}
                      className="p-1.5 bg-[#FF6B6B] text-white rounded-md hover:bg-[#FF5252] transition-colors disabled:opacity-50"
                      disabled={medications.length === 1 || isPending}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-8 gap-3 lg:gap-3 w-full">
                  {/* A: Formulary */}
                  <div className="space-y-1.5 lg:space-y-0">
                    <label className="lg:hidden text-xs font-medium text-gray-600">
                      Formulary
                    </label>
                    <Select
                      value={med.formulary || undefined}
                      onValueChange={(val) =>
                        updateMedication(med.id, "formulary", val)
                      }
                    >
                      <SelectTrigger className="w-full h-10 lg:h-10 text-sm lg:text-base">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {FORMULARY_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* B: Medication Name */}
                  <div className="space-y-1.5 lg:space-y-0 sm:col-span-2 lg:col-span-2">
                    <label className="lg:hidden text-xs font-medium text-gray-600">
                      Medication
                    </label>
                    <Input
                      type="text"
                      value={med.name}
                      onChange={(e) =>
                        updateMedication(med.id, "name", e.target.value)
                      }
                      placeholder="Enter medication"
                      className="w-full h-10 lg:h-10 text-sm lg:text-base"
                    />
                  </div>

                  {/* C: Dose */}
                  <div className="space-y-1.5 lg:space-y-0">
                    <label className="lg:hidden text-xs font-medium text-gray-600">
                      Dose
                    </label>
                    <Input
                      type="number"
                      value={med.dose}
                      onChange={(e) =>
                        updateMedication(med.id, "dose", e.target.value)
                      }
                      placeholder="Dose"
                      className="w-full h-10 lg:h-10 text-sm lg:text-base"
                    />
                  </div>

                  {/* D: Unit */}
                  <div className="space-y-1.5 lg:space-y-0">
                    <label className="lg:hidden text-xs font-medium text-gray-600">
                      Unit
                    </label>
                    <Select
                      value={med.unit || undefined}
                      onValueChange={(val) =>
                        updateMedication(med.id, "unit", val)
                      }
                    >
                      <SelectTrigger className="w-full h-10 lg:h-10 text-sm lg:text-base">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {UNIT_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* E: Interval */}
                  <div className="space-y-1.5 lg:space-y-0">
                    <label className="lg:hidden text-xs font-medium text-gray-600">
                      Interval
                    </label>
                    <Select
                      value={med.interval || undefined}
                      onValueChange={(val) =>
                        updateMedication(med.id, "interval", val)
                      }
                    >
                      <SelectTrigger className="w-full h-10 lg:h-10 text-sm lg:text-base">
                        <SelectValue placeholder="Interval" />
                      </SelectTrigger>
                      <SelectContent>
                        {INTERVAL_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* F: Duration Number */}
                  <div className="space-y-1.5 lg:space-y-0">
                    <label className="lg:hidden text-xs font-medium text-gray-600">
                      Duration
                    </label>
                    <Input
                      type="number"
                      value={med.durationNumber}
                      onChange={(e) =>
                        updateMedication(
                          med.id,
                          "durationNumber",
                          e.target.value,
                        )
                      }
                      placeholder="Num"
                      className="w-full h-10 lg:h-10 text-sm lg:text-base"
                    />
                  </div>

                  {/* G: Duration Unit */}
                  <div className="space-y-1.5 lg:space-y-0">
                    <label className="lg:hidden text-xs font-medium text-gray-600">
                      Duration Unit
                    </label>
                    <Select
                      value={med.durationUnit || undefined}
                      onValueChange={(val) =>
                        updateMedication(med.id, "durationUnit", val)
                      }
                    >
                      <SelectTrigger className="w-full h-10 lg:h-10 text-sm lg:text-base">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {DURATION_UNIT_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Desktop Action Buttons */}
                <div className="hidden lg:flex gap-2 shrink-0">
                  <button
                    onClick={addMedication}
                    className="p-2 bg-[#00C48C] text-white rounded-lg hover:bg-[#00B37E] transition-colors"
                    disabled={isPending}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => removeMedication(med.id)}
                    className="p-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#FF5252] transition-colors disabled:opacity-50"
                    disabled={medications.length === 1 || isPending}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={isPending}
            className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 text-sm font-medium"
          >
            Close
          </button>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={handleGeneratePrescription}
              disabled={isPending}
              className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-2 bg-indigo-50 border border-[#5164E8] text-[#5164E8] rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium"
            >
              Generate Prescription
            </button>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-2 bg-[#5164E8] text-white rounded-lg hover:bg-[#4153D7] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
