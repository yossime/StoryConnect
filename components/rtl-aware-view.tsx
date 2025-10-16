import { useRTL } from "@/hooks/use-rtl";
import React from "react";
import { View, ViewProps } from "react-native";

export interface RTLAwareViewProps extends ViewProps {
  /**
   * If true, automatically applies RTL-aware flex direction for horizontal layouts
   */
  horizontal?: boolean;
  /**
   * If true, automatically applies RTL-aware flex direction for vertical layouts
   */
  vertical?: boolean;
  /**
   * If true, automatically applies RTL-aware text alignment
   */
  textAlign?: boolean;
  /**
   * Custom RTL styles to apply
   */
  rtlStyles?: any;
}

/**
 * A View component that automatically handles RTL/LTR layouts
 */
export function RTLAwareView({
  style,
  horizontal = false,
  vertical = false,
  textAlign = false,
  rtlStyles,
  ...props
}: RTLAwareViewProps) {
  const { isRTL, rtlStyle, flexDirection, textAlign: rtlTextAlign } = useRTL();

  const getAutoStyles = () => {
    const autoStyles: any = {};

    if (horizontal) {
      autoStyles.flexDirection = flexDirection;
    }

    if (vertical) {
      autoStyles.flexDirection = "column";
    }

    if (textAlign) {
      autoStyles.textAlign = rtlTextAlign;
    }

    return autoStyles;
  };

  const combinedStyles = [
    getAutoStyles(),
    rtlStyles && rtlStyle(rtlStyles),
    style,
  ];

  return <View style={combinedStyles} {...props} />;
}

/**
 * A Row component that automatically handles RTL for horizontal layouts
 */
export function RTLRow({
  style,
  ...props
}: Omit<RTLAwareViewProps, "horizontal">) {
  return <RTLAwareView horizontal style={style} {...props} />;
}

/**
 * A Column component for vertical layouts (same as regular View)
 */
export function RTLColumn({ style, ...props }: RTLAwareViewProps) {
  return <RTLAwareView vertical style={style} {...props} />;
}
