import { Patient } from "@/lib/types";
import { AuthState } from "@/config/stores/slices/auth.slice";
import { RootState } from "@/config/stores/store";
import MainPageHeader from "@/shared/components/main-page-header.component.shared";
import { Activity, Clock, Beaker, Pill } from "lucide-react";
import { useSelector } from "react-redux";
import { MetricCard } from "../components/metric-card.component.patient";
import { ConsultationAndAppointmentList } from "../components/consultation-and-appointment-list.component.patient";

/* ------------------------------------------------------------------ */
/*  Mock data — replace with real API calls when ready                */
/* ------------------------------------------------------------------ */

const MOCK_METRICS = [
  {
    label: "Consultations",
    value: 24,
    trend: "+12%",
    trendDir: "up" as const,
    icon: Activity,
    gradient: "from-blue-500 to-indigo-600",
    bgLight: "bg-blue-50",
    textAccent: "text-blue-600",
  },
  {
    label: "Schedules",
    value: 8,
    trend: "+4%",
    trendDir: "up" as const,
    icon: Clock,
    gradient: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50",
    textAccent: "text-emerald-600",
  },
  {
    label: "Investigations",
    value: 5,
    trend: "-2%",
    trendDir: "down" as const,
    icon: Beaker,
    gradient: "from-amber-500 to-orange-600",
    bgLight: "bg-amber-50",
    textAccent: "text-amber-600",
  },
  {
    label: "Medications",
    value: 12,
    trend: "+8%",
    trendDir: "up" as const,
    icon: Pill,
    gradient: "from-violet-500 to-purple-600",
    bgLight: "bg-violet-50",
    textAccent: "text-violet-600",
  },
];

/* ------------------------------------------------------------------ */
/*  Dashboard page                                                    */
/* ------------------------------------------------------------------ */

function PatientDash() {
  const { user } = useSelector(
    (state: RootState) => state.auth,
  ) as AuthState<Patient>;

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <MainPageHeader
        heading={`Welcome, ${user?.user && user.user.first_name + " " + user?.user?.last_name}👋🏼`}
        subHeading="Connect with trusted medical practitioners anytime, anywhere, and get the care you deserve."
      />

      {/* Metric cards */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {MOCK_METRICS.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>
      </section>

      <section>
        <ConsultationAndAppointmentList />
      </section>
    </div>
  );
}

export default PatientDash;
