interface Props {
  isBackground: boolean;
  isExpanded?: boolean;
}

function Logo({ isBackground = false, isExpanded = true }: Props) {
  return (
    <div
      className={`flex items-center ${isExpanded ? "min-w-[8.125rem]" : "min-w-0 justify-center w-full pl-0"} py-[0.563rem] px-[0.5rem] ${isBackground && " bg-primary-foreground rounded-[12px]"} transition-all duration-300`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
      >
        <rect width="24" height="24" rx="12" fill="white" />
        <g clipPath="url(#clip0_198_1098)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M14.5001 8.25838C13.76 7.76393 12.89 7.5 12 7.5V3C13.78 3 15.5201 3.52784 17.0001 4.51677C18.4802 5.5057 19.6337 6.91131 20.3149 8.55583C20.9961 10.2004 21.1743 12.01 20.8271 13.7558C20.4798 15.5016 19.6226 17.1053 18.3639 18.3639C17.1053 19.6226 15.5016 20.4798 13.7558 20.8271C12.01 21.1743 10.2004 20.9961 8.55583 20.3149C6.91131 19.6337 5.5057 18.4802 4.51677 17.0001C3.52784 15.5201 3 13.78 3 12H7.5C7.5 12.89 7.76393 13.76 8.25838 14.5001C8.75284 15.2401 9.45566 15.8169 10.2779 16.1575C11.1002 16.4981 12.005 16.5872 12.8779 16.4135C13.7508 16.2399 14.5526 15.8113 15.182 15.182C15.8113 14.5526 16.2399 13.7508 16.4135 12.8779C16.5872 12.005 16.4981 11.1002 16.1575 10.2779C15.8169 9.45566 15.2401 8.75284 14.5001 8.25838Z"
            fill="#5164E8"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M7.5 3C7.5 3.59095 7.38361 4.17611 7.15746 4.72208C6.93131 5.26804 6.59984 5.76412 6.18198 6.18198C5.76412 6.59985 5.26804 6.93131 4.72208 7.15746C4.17611 7.38361 3.59095 7.5 3 7.5L3 12C4.1819 12 5.35222 11.7672 6.44415 11.3149C7.53609 10.8626 8.52825 10.1997 9.36394 9.36395C10.1997 8.52825 10.8626 7.53609 11.3149 6.44415C11.7672 5.35222 12 4.1819 12 3L7.5 3Z"
            fill="#5164E8"
          />
        </g>
        <defs>
          <clipPath id="clip0_198_1098">
            <rect
              width="18"
              height="18"
              fill="white"
              transform="translate(3 3)"
            />
          </clipPath>
        </defs>
      </svg>
      {isExpanded && (
        <b className="text-[1.125rem] whitespace-nowrap animate-in fade-in duration-300">
          MediApp
        </b>
      )}
    </div>
  );
}

export default Logo;
