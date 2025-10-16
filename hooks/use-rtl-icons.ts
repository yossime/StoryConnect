import { useRTL } from "./use-rtl";

/**
 * Hook that provides RTL-aware icon utilities
 */
export function useRTLIcons() {
  const { isRTL } = useRTL();

  /**
   * Flips an icon horizontally for RTL layouts
   */
  const flipIcon = (style: any) => {
    if (!isRTL) return style;

    return {
      ...style,
      transform: [...(style.transform || []), { scaleX: -1 }],
    };
  };

  /**
   * Gets the appropriate arrow direction for navigation
   */
  const getArrowDirection = (defaultDirection: "left" | "right") => {
    if (!isRTL) return defaultDirection;
    return defaultDirection === "left" ? "right" : "left";
  };

  /**
   * Gets the appropriate chevron direction
   */
  const getChevronDirection = (defaultDirection: "left" | "right") => {
    if (!isRTL) return defaultDirection;
    return defaultDirection === "left" ? "right" : "left";
  };

  /**
   * Gets RTL-aware margin for icons
   */
  const getIconMargin = (side: "start" | "end", value: number) => {
    if (!isRTL) {
      return side === "start" ? { marginLeft: value } : { marginRight: value };
    }
    return side === "start" ? { marginRight: value } : { marginLeft: value };
  };

  return {
    flipIcon,
    getArrowDirection,
    getChevronDirection,
    getIconMargin,
  };
}
