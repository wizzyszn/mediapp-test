import { SideNavOption } from "@/lib/types";
import { Outlet, useMatches, UIMatch } from "react-router-dom";

// import useCheckOnlineStatus from "@/shared/hooks/use-internet-connection";
import {
  Suspense,
  // useEffect,
  useState,
} from "react";
// import OnlineIndicator from "@/shared/components/online-indicator.component";
import Spinner from "@/shared/components/spinner.component";
import SideNav from "../sidenav.component.shared";
import DashHeader from "../dash-header.component.shared";
import { useQuery } from "@tanstack/react-query";
import { refreshTokenReq } from "@/config/service/auth.service";
import { useSelector } from "react-redux";
import { RootState } from "@/config/stores/store";

const LoadingFallback = () => (
  <div className="grid h-svh w-full place-items-center">
    <Spinner />
  </div>
);

export type BreadcrumbHandle = {
  headerChild?: React.ReactNode;
};

function HeaderContent() {
  const matches = useMatches() as UIMatch<unknown, BreadcrumbHandle>[];
  // Find the deepest match that provides header content
  const currentMatch = matches
    .slice()
    .reverse()
    .find((match) => Boolean(match.handle?.headerChild));

  return currentMatch?.handle?.headerChild ?? null;
}

interface DashLayoutProps {
  sideNavOptions: SideNavOption[];
  redirectPath?: string;
}

function DashLayout({ sideNavOptions, redirectPath }: DashLayoutProps) {
  const { refreshToken, role } = useSelector((state: RootState) => state.auth);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const shouldRefresh = Boolean(refreshToken && role);

  useQuery({
    queryKey: ["refresh-auth"],
    queryFn: async () => {
      if (!refreshToken || !role) throw new Error("Missing token or role");
      return refreshTokenReq({ refreshToken, role });
    },
    enabled: shouldRefresh,
    retry: 1,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // // Close mobile sidebar when navigation occurs
  // const handleMobileSidebarClose = () => setIsMobileSidebarOpen(false);

  return (
    <div
      className={`h-svh max-w-[1920px] mx-auto bg-muted overflow-hidden flex flex-col md:grid ${isSidebarExpanded ? "md:grid-cols-[250px_1fr]" : "md:grid-cols-[80px_1fr]"} md:grid-rows-[auto_1fr] transition-[grid-template-columns] duration-300`}
    >
      {/* Desktop Sidebar */}
      <SideNav
        navOptions={sideNavOptions}
        redirectPath={redirectPath}
        isExpanded={isSidebarExpanded}
        toggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
        className="hidden md:flex border-r border-[#E5E5E5] row-span-full z-10 sticky top-0 h-svh"
      />

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
          role="presentation"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed top-0 left-0 h-svh w-[250px] bg-white z-30 md:hidden transform transition-transform duration-300 overflow-y-auto ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SideNav
          navOptions={sideNavOptions}
          redirectPath={redirectPath}
          isExpanded={true}
          toggleSidebar={() => setIsMobileSidebarOpen(false)}
          className="flex border-none"
        />
      </div>

      {/* Header always on top row */}
      <DashHeader
        headerChild={<HeaderContent />}
        onMobileMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />

      {/* Main content */}
      <div className="relative overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10">
        <Suspense fallback={<LoadingFallback />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}

export default DashLayout;
