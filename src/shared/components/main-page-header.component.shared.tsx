import useNavigateToPage from "@/shared/hooks/use-navigate-to-page";
import { Button } from "../../components/ui/button";
import { CornerUpLeft } from "lucide-react";
import React from "react";
type Props = {
  btnTitle?: React.ReactNode;
  noBtn?: boolean;
  heading?: string;
  subHeading?: string;
  className?: string;
  handleBtnOnclick?: () => void;
  backBtn?: boolean;
  userId?: React.ReactNode;
};

function MainPageHeader({
  className,
  heading,
  subHeading,
  btnTitle,
  noBtn = false,
  handleBtnOnclick,
  backBtn,
  userId = null,
}: Props) {
  const navigate = useNavigateToPage({
    path: -1,
  });
  return (
    <header className={`p-2 flex justify-between ${className}`}>
      {!backBtn ? (
        <>
          {" "}
          <span>
            <h2 className=" text-xl sm:text-2xl font-semibold">{heading}</h2>
            {userId ? userId : null}
            {subHeading && (
              <p className=" text-wrap text-[#6C6C6C] sm:text-[1rem] text-sm">
                {subHeading}
              </p>
            )}
          </span>
          {noBtn && (
            <Button
              onClick={handleBtnOnclick}
              className="bg-[#2563eb] text-white px-6 py-7"
            >
              {btnTitle}
            </Button>
          )}
        </>
      ) : (
        <Button onClick={navigate} className="px-7 py-4">
          <CornerUpLeft />
          back
        </Button>
      )}
    </header>
  );
}

export default MainPageHeader;
