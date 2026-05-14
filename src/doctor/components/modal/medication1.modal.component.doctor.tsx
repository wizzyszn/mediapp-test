import { useState, useMemo } from "react";
import { Plus, Minus, Loader2, Trash2, Pill } from "lucide-react";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createMedicationForConsultationReq,
  deleteMedicationRecordReq,
  getMedicationsForConsultation,
  updateMedicationRecordReq,
} from "@/config/service/doctor.service";

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

/** Local shape for an existing (already-persisted) medication row. */
interface ExistingMedication {
  _id: string;
  formulary: Formulation | "";
  name: string;
  dose: string;
  unit: Unit | "";
  interval: Interval | "";
  durationNumber: string;
  durationUnit: DurationUnit | "";
}

/** Local shape for a brand-new medication row. */
interface NewMedication {
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

// ─── Shared row renderer ────────────────────────────────────────────────────
// Renders the 8-column medication form fields. Used for both existing and new rows.
function MedicationRow({
  med,
  index,
  label,
  onUpdate,
  actions,
  disabled,
}: {
  med: {
    formulary: string;
    name: string;
    dose: string;
    unit: string;
    interval: string;
    durationNumber: string;
    durationUnit: string;
  };
  index: number;
  label: string;
  onUpdate: (field: string, value: string) => void;
  actions: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="relative flex flex-col lg:flex-row items-start gap-4 lg:gap-3 bg-gray-50 lg:bg-transparent p-4 lg:p-0 rounded-lg border lg:border-none border-gray-200">
      {/* Mobile label */}
      <div className="lg:hidden flex items-center justify-between w-full mb-2">
        <span className="font-semibold text-gray-700 text-sm">
          {label} {index + 1}
        </span>
        <div className="flex gap-2">{actions}</div>
      </div>

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-8 gap-3 w-full">
        {/* Formulary */}
        <div className="space-y-1.5 lg:space-y-0">
          <label className="lg:hidden text-xs font-medium text-gray-600">
            Formulary
          </label>
          <Select
            value={med.formulary || undefined}
            onValueChange={(val) => onUpdate("formulary", val)}
            disabled={disabled}
          >
            <SelectTrigger className="w-full h-10 text-sm lg:text-base">
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

        {/* Medication Name */}
        <div className="space-y-1.5 lg:space-y-0 sm:col-span-2 lg:col-span-2">
          <label className="lg:hidden text-xs font-medium text-gray-600">
            Medication
          </label>
          <Input
            type="text"
            value={med.name}
            onChange={(e) => onUpdate("name", e.target.value)}
            placeholder="Enter medication"
            className="w-full h-10 text-sm lg:text-base"
            disabled={disabled}
          />
        </div>

        {/* Dose */}
        <div className="space-y-1.5 lg:space-y-0">
          <label className="lg:hidden text-xs font-medium text-gray-600">
            Dose
          </label>
          <Input
            type="number"
            value={med.dose}
            onChange={(e) => onUpdate("dose", e.target.value)}
            placeholder="Dose"
            className="w-full h-10 text-sm lg:text-base"
            disabled={disabled}
          />
        </div>

        {/* Unit */}
        <div className="space-y-1.5 lg:space-y-0">
          <label className="lg:hidden text-xs font-medium text-gray-600">
            Unit
          </label>
          <Select
            value={med.unit || undefined}
            onValueChange={(val) => onUpdate("unit", val)}
            disabled={disabled}
          >
            <SelectTrigger className="w-full h-10 text-sm lg:text-base">
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

        {/* Interval */}
        <div className="space-y-1.5 lg:space-y-0">
          <label className="lg:hidden text-xs font-medium text-gray-600">
            Interval
          </label>
          <Select
            value={med.interval || undefined}
            onValueChange={(val) => onUpdate("interval", val)}
            disabled={disabled}
          >
            <SelectTrigger className="w-full h-10 text-sm lg:text-base">
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

        {/* Duration Number */}
        <div className="space-y-1.5 lg:space-y-0">
          <label className="lg:hidden text-xs font-medium text-gray-600">
            Duration
          </label>
          <Input
            type="number"
            value={med.durationNumber}
            onChange={(e) => onUpdate("durationNumber", e.target.value)}
            placeholder="Num"
            className="w-full h-10 text-sm lg:text-base"
            disabled={disabled}
          />
        </div>

        {/* Duration Unit */}
        <div className="space-y-1.5 lg:space-y-0">
          <label className="lg:hidden text-xs font-medium text-gray-600">
            Duration Unit
          </label>
          <Select
            value={med.durationUnit || undefined}
            onValueChange={(val) => onUpdate("durationUnit", val)}
            disabled={disabled}
          >
            <SelectTrigger className="w-full h-10 text-sm lg:text-base">
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

      {/* Desktop action buttons */}
      <div className="hidden lg:flex gap-2 shrink-0">{actions}</div>
    </div>
  );
}

// ─── Column header (shared between both sections on desktop) ────────────────
function ColumnHeader() {
  return (
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
  );
}

// ─── Main Modal ─────────────────────────────────────────────────────────────

export function MedicationModal({
  onClose,
  consultationId,
}: MedicationModalProps) {
  const queryClient = useQueryClient();

  // ── New medications state (local-only, not yet persisted) ──
  const [newMedications, setNewMedications] = useState<NewMedication[]>([
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

  // ── Existing medications local edits (overrides from the fetched data) ──
  const [existingEdits, setExistingEdits] = useState<
    Record<string, Partial<ExistingMedication>>
  >({});

  // Track which existing row is being deleted
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Fetch existing medications for this consultation ──
  const { data: existingMedicationsRes, isLoading: isLoadingExisting } =
    useQuery({
      queryKey: ["consultation-medications", consultationId],
      queryFn: () => getMedicationsForConsultation(consultationId!),
      enabled: !!consultationId,
      retry: false,
    });

  // Filter to only unassigned medications and merge local edits
  const existingMedications: ExistingMedication[] = useMemo(() => {
    const items = existingMedicationsRes?.data;
    if (!items || !Array.isArray(items)) return [];

    return items
      .filter((m) => !m.assign_to_patient)
      .map((m) => {
        const edits = existingEdits[m._id] ?? {};
        return {
          _id: m._id,
          formulary: (edits.formulary ??
            (FORMULARY_OPTIONS.includes(m.formulary as Formulation)
              ? m.formulary
              : "")) as Formulation | "",
          name: edits.name ?? m.medication ?? "",
          dose: edits.dose ?? (m.dose != null ? String(m.dose) : ""),
          unit: (edits.unit ??
            (UNIT_OPTIONS.includes(m.unit as Unit) ? m.unit : "")) as Unit | "",
          interval: (edits.interval ??
            (INTERVAL_OPTIONS.includes(m.interval as Interval)
              ? m.interval
              : "")) as Interval | "",
          durationNumber:
            edits.durationNumber ??
            (m.duration != null ? String(m.duration) : ""),
          durationUnit: (edits.durationUnit ??
            (DURATION_UNIT_OPTIONS.includes(m.duration_unit as DurationUnit)
              ? m.duration_unit
              : "")) as DurationUnit | "",
        };
      });
  }, [existingMedicationsRes, existingEdits]);

  // ── Delete existing medication ──
  const { mutate: deleteMedication } = useMutation({
    mutationFn: (id: string) => deleteMedicationRecordReq(id),
    onMutate: (id) => setDeletingId(id),
    onSuccess: () => {
      toast.success("Medication deleted");
      queryClient.invalidateQueries({
        queryKey: ["consultation-medications", consultationId],
      });
      queryClient.invalidateQueries({ queryKey: ["medications_doc"] });
      queryClient.invalidateQueries({
        queryKey: ["medications", consultationId],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete medication");
    },
    onSettled: () => setDeletingId(null),
  });

  // ── Submit: creates new + patches existing ──
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateRow = (
    med: {
      formulary: string;
      name: string;
      unit: string;
      interval: string;
      durationUnit: string;
    },
    label: string,
  ): boolean => {
    if (!med.formulary) {
      toast.error(`Please select a formulary for ${label}`);
      return false;
    }
    if (!med.name.trim()) {
      toast.error(`Please enter a medication name for ${label}`);
      return false;
    }
    if (!med.unit) {
      toast.error(`Please select a unit for ${label}`);
      return false;
    }
    if (!med.interval) {
      toast.error(`Please select an interval for ${label}`);
      return false;
    }
    if (!med.durationUnit) {
      toast.error(`Please select a duration unit for ${label}`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (assignToPatient: boolean) => {
    if (!consultationId) {
      toast.error("Consultation ID is missing. Please try again.");
      return;
    }

    // Validate existing editable rows
    for (let i = 0; i < existingMedications.length; i++) {
      if (!validateRow(existingMedications[i], `existing medication ${i + 1}`))
        return;
    }

    // Only validate new rows that have been touched (have at least one field filled)
    const touchedNewMeds = newMedications.filter(
      (m) =>
        m.formulary ||
        m.name.trim() ||
        m.dose ||
        m.unit ||
        m.interval ||
        m.durationNumber ||
        m.durationUnit,
    );

    for (let i = 0; i < touchedNewMeds.length; i++) {
      if (!validateRow(touchedNewMeds[i], `new medication ${i + 1}`)) return;
    }

    setIsSubmitting(true);

    try {
      // 1) PATCH each existing medication
      const patchPromises = existingMedications.map((med) =>
        updateMedicationRecordReq(
          {
            formulary: med.formulary as Formulation,
            medication: med.name,
            unit: med.unit as Unit,
            dose: med.dose ? Number(med.dose) : undefined,
            interval: med.interval as Interval,
            duration_unit: med.durationUnit as DurationUnit,
            duration: med.durationNumber
              ? Number(med.durationNumber)
              : undefined,
            assign_to_patient: assignToPatient,
          },
          med._id,
        ),
      );

      // 2) CREATE new medications (only touched ones)
      let createPromise: Promise<unknown> = Promise.resolve();
      if (touchedNewMeds.length > 0) {
        createPromise = createMedicationForConsultationReq(consultationId, {
          medications: touchedNewMeds.map((med) => ({
            formulary: med.formulary as Formulation,
            medication: med.name,
            unit: med.unit as Unit,
            dose: med.dose ? Number(med.dose) : undefined,
            interval: med.interval as Interval,
            duration_unit: med.durationUnit as DurationUnit,
            duration: med.durationNumber
              ? Number(med.durationNumber)
              : undefined,
            assign_to_patient: assignToPatient,
          })),
        });
      }

      await Promise.all([...patchPromises, createPromise]);

      toast.success(
        assignToPatient
          ? "Prescription generated successfully"
          : "Medications saved successfully",
      );
      queryClient.invalidateQueries({
        queryKey: ["consultation-medications", consultationId],
      });
      queryClient.invalidateQueries({ queryKey: ["medications_doc"] });
      queryClient.invalidateQueries({
        queryKey: ["medications", consultationId],
      });
      onClose();
    } catch (error) {
      toast.error(
        (error as Error).message ||
          "Failed to save medications. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Helpers for new rows ──
  const addNewMedication = () => {
    setNewMedications([
      ...newMedications,
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

  const removeNewMedication = (id: number) => {
    if (newMedications.length > 1) {
      setNewMedications(newMedications.filter((m) => m.id !== id));
    }
  };

  const updateNewMedication = (id: number, field: string, value: string) => {
    setNewMedications(
      newMedications.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    );
  };

  // ── Helpers for existing rows ──
  const updateExistingMedication = (
    _id: string,
    field: string,
    value: string,
  ) => {
    setExistingEdits((prev) => ({
      ...prev,
      [_id]: { ...prev[_id], [field]: value },
    }));
  };

  const isBusy = isSubmitting || deletingId !== null;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-[780px] lg:max-w-[1100px] xl:max-w-[1400px] p-0 gap-0 overflow-hidden bg-white max-h-[90vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="px-4 sm:px-6 py-4 flex flex-row items-center justify-between border-b border-gray-200 space-y-0 shrink-0">
          <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900">
            Prescription Builder
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 max-h-[75vh]">
          {/* ─── Section 1: Existing Medications ─── */}
          {isLoadingExisting && (
            <div className="flex items-center justify-center py-8 text-gray-500 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading existing medications…</span>
            </div>
          )}

          {existingMedications.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Pill className="w-4 h-4 text-[#5164E8]" />
                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                  Existing Medications
                </h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {existingMedications.length}
                </span>
              </div>

              <ColumnHeader />

              <div className="space-y-4 lg:space-y-3">
                {existingMedications.map((med, index) => (
                  <MedicationRow
                    key={med._id}
                    med={med}
                    index={index}
                    label="Existing"
                    disabled={isBusy}
                    onUpdate={(field, value) =>
                      updateExistingMedication(med._id, field, value)
                    }
                    actions={
                      <button
                        onClick={() => deleteMedication(med._id)}
                        className="p-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#FF5252] transition-colors disabled:opacity-50"
                        disabled={isBusy}
                        title="Delete medication"
                      >
                        {deletingId === med._id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* ─── Section 2: Add New Medications ─── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-4 h-4 text-[#00C48C]" />
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                Add New Medications
              </h3>
            </div>

            <ColumnHeader />

            <div className="space-y-4 lg:space-y-3">
              {newMedications.map((med, index) => (
                <MedicationRow
                  key={med.id}
                  med={med}
                  index={index}
                  label="New"
                  disabled={isBusy}
                  onUpdate={(field, value) =>
                    updateNewMedication(med.id, field, value)
                  }
                  actions={
                    <>
                      <button
                        onClick={addNewMedication}
                        className="p-2 bg-[#00C48C] text-white rounded-lg hover:bg-[#00B37E] transition-colors"
                        disabled={isBusy}
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => removeNewMedication(med.id)}
                        className="p-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#FF5252] transition-colors disabled:opacity-50"
                        disabled={newMedications.length === 1 || isBusy}
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                    </>
                  }
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={isBusy}
            className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 text-sm font-medium"
          >
            Close
          </button>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => handleSubmit(false)}
              disabled={isBusy}
              className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-2 bg-[#5164E8] text-white rounded-lg hover:bg-[#4153D7] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              Save
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={isBusy}
              className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-2 bg-indigo-50 border border-[#5164E8] text-[#5164E8] rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium"
            >
              Generate Prescription
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
