import { useTranslation } from "@/lib/i18n";
import { StyleSheet, TextStyle, ViewStyle } from "react-native";

export interface RTLStyles {
  textAlign?: TextStyle["textAlign"];
  writingDirection?: TextStyle["writingDirection"];
  flexDirection?: ViewStyle["flexDirection"];
  textAlignVertical?: TextStyle["textAlignVertical"];
  alignSelf?: ViewStyle["alignSelf"];
  alignItems?: ViewStyle["alignItems"];
  justifyContent?: ViewStyle["justifyContent"];
  marginLeft?: ViewStyle["marginLeft"];
  marginRight?: ViewStyle["marginRight"];
  paddingLeft?: ViewStyle["paddingLeft"];
  paddingRight?: ViewStyle["paddingRight"];
  left?: ViewStyle["left"];
  right?: ViewStyle["right"];
  borderLeftWidth?: ViewStyle["borderLeftWidth"];
  borderRightWidth?: ViewStyle["borderRightWidth"];
  borderTopLeftRadius?: ViewStyle["borderTopLeftRadius"];
  borderTopRightRadius?: ViewStyle["borderTopRightRadius"];
  borderBottomLeftRadius?: ViewStyle["borderBottomLeftRadius"];
  borderBottomRightRadius?: ViewStyle["borderBottomRightRadius"];
}

/**
 * Hook that provides RTL-aware styling utilities
 */
export function useRTL() {
  const { isRTL } = useTranslation();

  /**
   * Automatically applies RTL-aware styles based on current locale
   */
  const rtlStyle = (styles: RTLStyles): any => {
    if (!isRTL) return styles;

    const rtlStyles: any = { ...styles };

    // Handle text alignment
    if (styles.textAlign === "left") {
      rtlStyles.textAlign = "right";
    } else if (styles.textAlign === "right") {
      rtlStyles.textAlign = "left";
    }

    // Handle writing direction
    if (styles.writingDirection) {
      rtlStyles.writingDirection = isRTL ? "rtl" : "ltr";
    }

    // Handle flex direction
    if (styles.flexDirection === "row") {
      rtlStyles.flexDirection = "row-reverse";
    } else if (styles.flexDirection === "row-reverse") {
      rtlStyles.flexDirection = "row";
    }

    // Handle margins and paddings
    if (styles.marginLeft !== undefined && styles.marginRight !== undefined) {
      const temp = rtlStyles.marginLeft;
      rtlStyles.marginLeft = rtlStyles.marginRight;
      rtlStyles.marginRight = temp;
    } else if (styles.marginLeft !== undefined) {
      rtlStyles.marginRight = rtlStyles.marginLeft;
      delete rtlStyles.marginLeft;
    } else if (styles.marginRight !== undefined) {
      rtlStyles.marginLeft = rtlStyles.marginRight;
      delete rtlStyles.marginRight;
    }

    if (styles.paddingLeft !== undefined && styles.paddingRight !== undefined) {
      const temp = rtlStyles.paddingLeft;
      rtlStyles.paddingLeft = rtlStyles.paddingRight;
      rtlStyles.paddingRight = temp;
    } else if (styles.paddingLeft !== undefined) {
      rtlStyles.paddingRight = rtlStyles.paddingLeft;
      delete rtlStyles.paddingLeft;
    } else if (styles.paddingRight !== undefined) {
      rtlStyles.paddingLeft = rtlStyles.paddingRight;
      delete rtlStyles.paddingRight;
    }

    // Handle positioning
    if (styles.left !== undefined && styles.right !== undefined) {
      const temp = rtlStyles.left;
      rtlStyles.left = rtlStyles.right;
      rtlStyles.right = temp;
    } else if (styles.left !== undefined) {
      rtlStyles.right = rtlStyles.left;
      delete rtlStyles.left;
    } else if (styles.right !== undefined) {
      rtlStyles.left = rtlStyles.right;
      delete rtlStyles.right;
    }

    // Handle borders
    if (
      styles.borderLeftWidth !== undefined &&
      styles.borderRightWidth !== undefined
    ) {
      const temp = rtlStyles.borderLeftWidth;
      rtlStyles.borderLeftWidth = rtlStyles.borderRightWidth;
      rtlStyles.borderRightWidth = temp;
    } else if (styles.borderLeftWidth !== undefined) {
      rtlStyles.borderRightWidth = rtlStyles.borderLeftWidth;
      delete rtlStyles.borderLeftWidth;
    } else if (styles.borderRightWidth !== undefined) {
      rtlStyles.borderLeftWidth = rtlStyles.borderRightWidth;
      delete rtlStyles.borderRightWidth;
    }

    // Handle border radius
    if (
      styles.borderTopLeftRadius !== undefined &&
      styles.borderTopRightRadius !== undefined
    ) {
      const temp = rtlStyles.borderTopLeftRadius;
      rtlStyles.borderTopLeftRadius = rtlStyles.borderTopRightRadius;
      rtlStyles.borderTopRightRadius = temp;
    } else if (styles.borderTopLeftRadius !== undefined) {
      rtlStyles.borderTopRightRadius = rtlStyles.borderTopLeftRadius;
      delete rtlStyles.borderTopLeftRadius;
    } else if (styles.borderTopRightRadius !== undefined) {
      rtlStyles.borderTopLeftRadius = rtlStyles.borderTopRightRadius;
      delete rtlStyles.borderTopRightRadius;
    }

    if (
      styles.borderBottomLeftRadius !== undefined &&
      styles.borderBottomRightRadius !== undefined
    ) {
      const temp = rtlStyles.borderBottomLeftRadius;
      rtlStyles.borderBottomLeftRadius = rtlStyles.borderBottomRightRadius;
      rtlStyles.borderBottomRightRadius = temp;
    } else if (styles.borderBottomLeftRadius !== undefined) {
      rtlStyles.borderBottomRightRadius = rtlStyles.borderBottomLeftRadius;
      delete rtlStyles.borderBottomLeftRadius;
    } else if (styles.borderBottomRightRadius !== undefined) {
      rtlStyles.borderBottomLeftRadius = rtlStyles.borderBottomRightRadius;
      delete rtlStyles.borderBottomRightRadius;
    }

    return rtlStyles;
  };

  /**
   * Creates RTL-aware StyleSheet
   */
  const createRTLStyleSheet = (styles: Record<string, any>) => {
    const rtlStyles: Record<string, any> = {};

    Object.keys(styles).forEach((key) => {
      rtlStyles[key] = rtlStyle(styles[key]);
    });

    return StyleSheet.create(rtlStyles);
  };

  /**
   * Gets the appropriate direction value
   */
  const direction = isRTL ? "rtl" : "ltr";

  /**
   * Gets the appropriate flex direction for horizontal layouts
   */
  const flexDirection = isRTL ? "row-reverse" : "row";

  /**
   * Gets the appropriate text alignment
   */
  const textAlign = isRTL ? "right" : "left";

  /**
   * Gets the appropriate margin/padding direction
   */
  const marginStart = (value: number) =>
    isRTL ? { marginRight: value } : { marginLeft: value };
  const marginEnd = (value: number) =>
    isRTL ? { marginLeft: value } : { marginRight: value };
  const paddingStart = (value: number) =>
    isRTL ? { paddingRight: value } : { paddingLeft: value };
  const paddingEnd = (value: number) =>
    isRTL ? { paddingLeft: value } : { paddingRight: value };

  return {
    isRTL,
    direction,
    flexDirection,
    textAlign,
    rtlStyle,
    createRTLStyleSheet,
    marginStart,
    marginEnd,
    paddingStart,
    paddingEnd,
  };
}
