import { useCallback, useRef } from "react";

export const useRipple = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    container.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  }, []);

  return { containerRef, handleMouseEnter };
};
