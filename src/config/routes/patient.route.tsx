// import ProtectedRoute from "@/components/Route/ProtectedRoutes";
import { SideNavOption } from "@/lib/types";
import BookConsultationBtn from "@/patient/components/book-consultation-btn.component.patient";
import DashLayout from "@/shared/components/layouts/dash.layout.component";

import ProtectedRoute from "@/shared/components/protected-route.component";
import HomeIcon from "@/shared/components/svgs/icons/home.icon";
import MedicineBottleIcon from "@/shared/components/svgs/icons/medicine-bottle.icon";
import SendIcon from "@/shared/components/svgs/icons/send.icon";
import { MdMedicalServices } from "react-icons/md";
import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import { BsCalendarCheckFill } from "react-icons/bs";
const LoginPatient = lazy(
  () => import("@/auth/patient/pages/login.patient.page.auth"),
);
const RegisterPatient = lazy(
  () => import("@/auth/patient/pages/register.patient.page.auth"),
);
const PatientSchedules = lazy(
  () => import("@/patient/pages/schedules.page.patient"),
);
const PatientDashboard = lazy(
  () => import("@/patient/pages/dashboard.page.patient"),
);

// const ViewAppointment = lazy(
//   () => import("@/patient/pages/view-appointment.page.patient"),
// );
const Medications = lazy(
  () => import("@/patient/pages/medications.page.patient"),
);
const ForgotPassword = lazy(
  () => import("@/auth/patient/pages/forgot-password.page.auth"),
);
const PatientProfile = lazy(
  () => import("@/patient/pages/profile.page.patient"),
);

const Appointment = lazy(
  () => import("@/patient/pages/appointment.page.patient"),
);
const Consultation = lazy(
  () => import("@/patient/pages/consultation.page.patient"),
);
const ViewConsultationDetails = lazy(
  () => import("@/patient/pages/single-consultation-details.page.patient"),
);
const AppointmentDetails = lazy(
  () => import("@/patient/pages/appointment-detail.page.patient"),
);
// const VideoConsultationPagePatient = lazy(
//   () => import("@/patient/pages/video-consultation.page.patient"),
// );

const Investigation = lazy(
  () => import("@/patient/pages/investigation.page.patient"),
);
const Referrals = lazy(() => import("@/patient/pages/referrals.page.patient"));
const ViewReferralDetails = lazy(
  () => import("@/patient/pages/view-referral.page.patient"),
);

const sideNavOptions: SideNavOption[] = [
  {
    url: "",
    title: "Dashboard",
    Icon: HomeIcon,
  },
  {
    url: "/patient/dashboard/consultations",
    title: "Consultations",
    Icon: MdMedicalServices,
  },
  {
    url: "appointments",
    title: "Appointments",
    Icon: BsCalendarCheckFill,
    iconProps: {
      className: "size-[20px]",
    },
  },
  {
    url: "/patient/dashboard/medications",
    title: "Medications",
    Icon: MedicineBottleIcon,
  },
  {
    url: "/patient/dashboard/referrals",
    title: "Referrals",
    Icon: SendIcon,
  },
  {
    url: "/patient/dashboard/investigation",
    title: "Investigations",
    Icon: MedicineBottleIcon,
  },
];

const patient_routes: RouteObject[] = [
  {
    path: "login",
    element: <LoginPatient />,
  },
  {
    path: "sign-up",
    element: <RegisterPatient />,
  },
  {
    path: "forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "dashboard",
    handle: {
      headerChild: (
        <div className="flex gap-2">
          <BookConsultationBtn />
        </div>
      ),
    },
    element: (
      <ProtectedRoute>
        <DashLayout
          sideNavOptions={sideNavOptions}
          redirectPath="/patient/dashboard"
        />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        path: "",
        element: <PatientDashboard />,
      },
      {
        path: "schedules",
        element: <PatientSchedules />,
      },
      {
        path: "profile",
        element: <PatientProfile />,
      },
      {
        path: "appointments",
        children: [
          {
            index: true,
            element: <Appointment />,
          },
          {
            path: ":id",
            element: <AppointmentDetails />,
          },
        ],
      },
      {
        path: "consultations",

        children: [
          {
            index: true,
            element: <Consultation />,
          },
          {
            path: ":id",
            element: <ViewConsultationDetails />,
          },
        ],
      },
      {
        path: "medications",
        element: <Medications />,
      },
      {
        path: "investigation",
        element: <Investigation />,
      },
      {
        path: "referrals",
        children: [
          {
            index: true,
            element: <Referrals />,
          },
          {
            path: ":id",
            element: <ViewReferralDetails />,
          },
        ],
      },
    ],
  },
];

export default patient_routes;
