import { Patient } from "@/lib/types";
import { AuthState } from "@/config/stores/slices/auth.slice";
import { RootState } from "@/config/stores/store";
import MainPageHeader from "@/shared/components/main-page-header.component.shared";
import { Activity, Clock, Beaker, Pill } from "lucide-react";
import { useSelector } from "react-redux";
import { MetricCard } from "../components/metric-card.component.patient";
import { ConsultationAndAppointmentList } from "../components/consultation-and-appointment-list.component.patient";
import { useQuery } from "@tanstack/react-query";
import {
  MetricTrend,
  getPatientDashMetrics,
} from "@/config/service/patient.service";

const METRICS_MAPPER = {
  consultations: {
    icon: Activity,
    gradient: "from-blue-500 to-indigo-600",
    bgLight: "bg-blue-50",
    textAccent: "text-blue-600",
  },
  appointments: {
    icon: Clock,
    gradient: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50",
    textAccent: "text-emerald-600",
  },
  investigations: {
    icon: Beaker,
    gradient: "from-amber-500 to-orange-600",
    bgLight: "bg-amber-50",
    textAccent: "text-amber-600",
  },
  medications: {
    icon: Pill,
    gradient: "from-violet-500 to-purple-600",
    bgLight: "bg-violet-50",
    textAccent: "text-violet-600",
  },
};

function PatientDash() {
  const { user } = useSelector(
    (state: RootState) => state.auth,
  ) as AuthState<Patient>;

  const { data, isLoading } = useQuery({
    queryKey: ["patient-dash-metrics"],
    queryFn: () => getPatientDashMetrics(),
  });

  const metrics = data?.data ?? {
    consultations: {
      total: 0,
      current: 0,
      previous: 0,
      change_percent: 0,
      trend: "0%",
    },
    medications: {
      total: 0,
      current: 0,
      previous: 0,
      change_percent: 0,
      trend: "0%",
    },
    investigations: {
      total: 0,
      current: 0,
      previous: 0,
      change_percent: 0,
      trend: "0%",
    },
    appointments: {
      total: 0,
      current: 0,
      previous: 0,
      change_percent: 0,
      trend: "0%",
    },
  };

  const values = Object.entries(metrics).map(([key, value]) => {
    const k = key as keyof typeof METRICS_MAPPER;
    const v = value as MetricTrend;

    return {
      ...METRICS_MAPPER[k],
      label: k.charAt(0).toUpperCase() + k.slice(1),
      value: v.total,
      current: v.current,
      trend: v.trend,
      trendDir: (v.change_percent >= 0 ? "up" : "down") as "up" | "down",
    };
  });

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
          {values.map((m, index) => (
            <MetricCard key={index} {...m} isLoading={isLoading} />
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
