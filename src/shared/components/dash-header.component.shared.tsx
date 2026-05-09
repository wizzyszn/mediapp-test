import { ReactNode } from "react";
import { VscBell } from "react-icons/vsc";
import { Menu } from "lucide-react";
import Logo from "./logo.component.shared";

interface Props {
  headerChild?: ReactNode;
  leftContent?: ReactNode;
  onMobileMenuClick?: () => void;
  isMobileSidebarOpen?: boolean;
}
function DashHeader({
  headerChild,
  leftContent,
  onMobileMenuClick,
  isMobileSidebarOpen,
}: Props) {
  return (
    <header className="bg-white border-b border-[#E5E5E5] h-16 sm:h-20 md:h-[84px] w-full flex justify-between items-center px-5 sm:px-8 md:px-10 gap-2 sm:gap-4 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Logo - visible primarily on mobile where sidebar is hidden */}
        <div className="md:hidden flex items-center scale-90 origin-left">
          <Logo isBackground={false} isExpanded={false} />
        </div>
        {/* Mobile Menu Button */}
        <button
          onClick={onMobileMenuClick}
          className="md:hidden p-2 hover:bg-gray-100 active:bg-gray-200 rounded-md text-gray-600 hover:text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileSidebarOpen}
        >
          <Menu className="size-5 sm:size-6" />
        </button>
        {leftContent && leftContent}
      </div>
      <div className="flex items-center gap-3 sm:gap-5">
        <div className="flex items-center order-2 md:order-1">
          <button
            className="group size-10 sm:size-11 rounded-full flex justify-center items-center bg-gray-100 hover:bg-gray-200 cursor-pointer transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 active:scale-95 relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Notifications"
          >
            <VscBell
              size={20}
              color="#555"
              className="transition-transform duration-300 group-hover:rotate-[15deg] group-hover:scale-110 origin-top"
            />
            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white transition-transform duration-300 group-hover:scale-125"></span>
          </button>
        </div>
        <div className="flex items-center order-1 md:order-2">
          {headerChild ? headerChild : null}
        </div>
      </div>
    </header>
  );
}

export default DashHeader;
