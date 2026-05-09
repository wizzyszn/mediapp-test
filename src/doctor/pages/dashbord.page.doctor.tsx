import { Doctor } from "@/lib/types";
import { AuthState } from "@/config/stores/slices/auth.slice";
import { RootState } from "@/config/stores/store";
import MainPageHeader from "@/shared/components/main-page-header.component.shared";
import { Activity, Clock, Users, BarChart3 } from "lucide-react";
import { useSelector } from "react-redux";
import { MetricCard } from "../components/metric-card.component.doctor";
import { DoctorConsultationAndAppointmentList } from "../components/consultation-and-appointment-list.component.doctor";

const MOCK_METRICS = [
  {
    label: "Consultations",
    value: 36,
    trend: "+10%",
    trendDir: "up" as const,
    icon: Activity,
    gradient: "from-blue-500 to-indigo-600",
    bgLight: "bg-blue-50",
    textAccent: "text-blue-600",
  },
  {
    label: "Appointments",
    value: 12,
    trend: "+5%",
    trendDir: "up" as const,
    icon: Clock,
    gradient: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50",
    textAccent: "text-emerald-600",
  },
  {
    label: "Patients",
    value: 84,
    trend: "+3%",
    trendDir: "up" as const,
    icon: Users,
    gradient: "from-amber-500 to-orange-600",
    bgLight: "bg-amber-50",
    textAccent: "text-amber-600",
  },
  {
    label: "Reports",
    value: 7,
    trend: "-1%",
    trendDir: "down" as const,
    icon: BarChart3,
    gradient: "from-violet-500 to-purple-600",
    bgLight: "bg-violet-50",
    textAccent: "text-violet-600",
  },
];

function DoctorDash() {
  const { user } = useSelector(
    (state: RootState) => state.auth,
  ) as AuthState<Doctor>;

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <MainPageHeader
        heading={`Welcome, Dr. ${user?.doctor && user.doctor.first_name + " " + user?.doctor?.last_name}👋🏽`}
        userId={
          user && (
            <p className="mt-1 text-sm text-[#6C6C6C] font-medium">
              Doctor ID: {user.doctor?.doctor_no}
            </p>
          )
        }
      />

      {/* Metric cards */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {MOCK_METRICS.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>
      </section>

      {/* Consultations & Appointments */}
      <section>
        <DoctorConsultationAndAppointmentList />
      </section>
    </div>
  );
}

export default DoctorDash;
