import { Check } from "lucide-react";
import { motion } from "framer-motion";

const STEPS = [
  "Personal Details",
  "Choose a time slot",
  "Find a Doctor",
  // "Choose Payment",
  "Confirm appointment",
];

interface StepSidebarProps {
  currentStep: number;
}

const StepSidebar = ({ currentStep }: StepSidebarProps) => {
  return (
    <div className=" col-span-1 py-5">
      <div className="space-y-0">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <div key={step} className="relative pb-4 last:pb-0">
              {index < STEPS.length - 1 && (
                <div
                  className={`absolute left-[25.9px] top-5 h-full w-[1.5px] -translate-x-1/2 rounded-full ${
                    isCompleted ? "bg-[#969696]" : "bg-border"
                  }`}
                />
              )}
              <div
                className={`flex items-center gap-2 pl-4 relative z-10 h-[40px]`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-step-bg"
                    className="absolute inset-0 bg-[#EFF1FF] rounded-[8px] -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div
                  className={`size-[20px] rounded-full flex items-center justify-center shrink-0 ${
                    isCompleted
                      ? "bg-[#969696] text-white"
                      : isActive
                        ? "border-2 border-primary bg-[#EFF1FF]"
                        : "border-2 border-border bg-card"
                  }`}
                >
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                    >
                      <Check size={11} strokeWidth={3} />
                    </motion.div>
                  )}
                </div>
                <span
                  className={`text-sm transition-colors duration-200  ${
                    isActive ? "text-primary font-medium" : "text-[#969696]"
                  }`}
                >
                  {step}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepSidebar;
