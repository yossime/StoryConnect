import { useRTL } from "@/hooks/use-rtl";
import React from "react";
import { Text, TextProps } from "react-native";

export interface RTLAwareTextProps extends TextProps {
  /**
   * If true, automatically applies RTL-aware text alignment
   */
  autoAlign?: boolean;
  /**
   * Custom RTL styles to apply
   */
  rtlStyles?: any;
  /**
   * Force specific text alignment (overrides autoAlign)
   */
  forceAlign?: "left" | "right" | "center" | "justify";
}

/**
 * A Text component that automatically handles RTL/LTR text rendering
 */
export function RTLAwareText({
  style,
  autoAlign = true,
  rtlStyles,
  forceAlign,
  ...props
}: RTLAwareTextProps) {
  const { isRTL, rtlStyle, textAlign } = useRTL();

  const getAutoStyles = () => {
    const autoStyles: any = {};

    if (forceAlign) {
      autoStyles.textAlign = forceAlign;
    } else if (autoAlign) {
      autoStyles.textAlign = textAlign;
    }

    autoStyles.writingDirection = isRTL ? ("rtl" as const) : ("ltr" as const);

    return autoStyles;
  };

  const combinedStyles = [
    getAutoStyles(),
    rtlStyles && rtlStyle(rtlStyles),
    style,
  ];

  return <Text style={combinedStyles} {...props} />;
}

/**
 * A Text component for headers that automatically centers in RTL
 */
export function RTLHeader({ style, ...props }: RTLAwareTextProps) {
  return (
    <RTLAwareText
      forceAlign="center"
      style={[{ fontWeight: "bold" as const, fontSize: 24 }, style]}
      {...props}
    />
  );
}

/**
 * A Text component for body text with automatic RTL alignment
 */
export function RTLBody({ style, ...props }: RTLAwareTextProps) {
  return (
    <RTLAwareText
      style={[{ fontSize: 16, lineHeight: 24 }, style]}
      {...props}
    />
  );
}
