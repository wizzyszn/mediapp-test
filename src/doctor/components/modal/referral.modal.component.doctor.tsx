import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createReferralForConsultationReq,
  deleteReferralRecordReq,
  listReferralsForConsultationReq,
  updateReferralRecordReq,
} from "@/config/service/doctor.service";

interface ReferralModalProps {
  onClose: () => void;
  consultationId: string;
}

const EMPTY_FORM = { specialist_name: "", hospital: "", referral_details: "" };

export function ReferralModal({ onClose, consultationId }: ReferralModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: referralsRes, isLoading: isFetching } = useQuery({
    queryKey: ["referrals", consultationId],
    queryFn: () => listReferralsForConsultationReq(consultationId),
    enabled: !!consultationId,
  });

  const referrals = referralsRes?.data ?? [];

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["referrals", consultationId] });

  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: () =>
      createReferralForConsultationReq(consultationId, formData),
    onSuccess: () => {
      toast.success("Referral created");
      setFormData(EMPTY_FORM);
      invalidate();
    },
    onError: () => toast.error("Failed to create referral"),
  });

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: () => updateReferralRecordReq(editingId!, formData),
    onSuccess: () => {
      toast.success("Referral updated");
      setFormData(EMPTY_FORM);
      setEditingId(null);
      invalidate();
    },
    onError: () => toast.error("Failed to update referral"),
  });

  const { mutate: remove } = useMutation({
    mutationFn: (id: string) => deleteReferralRecordReq(id),
    onSuccess: () => {
      toast.success("Referral deleted");
      invalidate();
    },
    onError: () => toast.error("Failed to delete referral"),
  });

  const handleStartEdit = (r: (typeof referrals)[number]) => {
    setEditingId(r._id);
    setFormData({
      specialist_name: r.specialist_name,
      hospital: r.hospital,
      referral_details: r.referral_details,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  const handleSubmit = () => {
    if (
      !formData.specialist_name ||
      !formData.hospital ||
      !formData.referral_details
    ) {
      toast.error("All fields are required");
      return;
    }
    if (editingId) {
      update();
    } else {
      create();
    }
  };

  const isSaving = isCreating || isUpdating;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] md:max-w-[700px] w-[95vw] p-0 gap-0 overflow-hidden bg-white max-h-[90vh] flex flex-col rounded-lg">
        {/* Header */}
        <DialogHeader className="px-4 sm:px-6 py-4 border-b border-gray-200 space-y-0 shrink-0">
          <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900">
            Referral
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Existing referrals */}
          {isFetching ? (
            <div className="flex justify-center items-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-[#5164E8]" />
            </div>
          ) : referrals.length > 0 ? (
            <div className="px-4 sm:px-6 pt-4 space-y-3">
              {referrals.map((r) => (
                <div
                  key={r._id}
                  className="border border-gray-200 rounded-lg p-4 text-sm space-y-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <p className="font-medium text-gray-900">
                        {r.specialist_name}
                      </p>
                      <p className="text-gray-500">{r.hospital}</p>
                      <p className="text-gray-700 mt-1">{r.referral_details}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleStartEdit(r)}
                        className="p-1.5 text-gray-400 hover:text-[#5164E8] transition-colors"
                        aria-label="Edit referral"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => remove(r._id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Delete referral"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* Form */}
          <div className="p-4 sm:p-6 space-y-4">
            {referrals.length > 0 && (
              <p className="text-sm font-medium text-gray-700">
                {editingId ? "Edit referral" : "Add new referral"}
              </p>
            )}
            <div>
              <label className="block text-sm sm:text-base text-gray-700 mb-1.5 sm:mb-2 font-medium">
                Specialist Name
              </label>
              <input
                type="text"
                value={formData.specialist_name}
                onChange={(e) =>
                  setFormData({ ...formData, specialist_name: e.target.value })
                }
                placeholder="Enter specialist name"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:border-[#5164E8]"
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base text-gray-700 mb-1.5 sm:mb-2 font-medium">
                Hospital Name
              </label>
              <input
                type="text"
                value={formData.hospital}
                onChange={(e) =>
                  setFormData({ ...formData, hospital: e.target.value })
                }
                placeholder="Enter hospital name"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:border-[#5164E8]"
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base text-gray-700 mb-1.5 sm:mb-2 font-medium">
                Referral Details
              </label>
              <textarea
                value={formData.referral_details}
                onChange={(e) =>
                  setFormData({ ...formData, referral_details: e.target.value })
                }
                placeholder="Enter detailed reason for referral"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:border-[#5164E8] min-h-[100px] sm:min-h-[120px] resize-y"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          {editingId && (
            <button
              onClick={handleCancelEdit}
              className="w-full sm:w-auto px-4 py-2 sm:px-6 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
            >
              Cancel Edit
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 sm:px-6 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2 sm:px-6 bg-[#5164E8] text-white rounded-lg hover:bg-[#4153D7] transition-colors disabled:opacity-60 text-sm font-medium"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {editingId ? "Update" : "Save"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
