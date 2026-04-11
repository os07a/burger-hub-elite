import riyalSvg from "@/assets/riyal.svg";

interface RiyalIconProps {
  size?: number;
  className?: string;
}

const RiyalIcon = ({ size = 12, className = "" }: RiyalIconProps) => (
  <img
    src={riyalSvg}
    alt="ر.س"
    width={size}
    height={size}
    className={`inline-block align-baseline ${className}`}
    style={{ filter: "var(--riyal-filter, none)" }}
  />
);

export default RiyalIcon;
