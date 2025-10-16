import { View, type ViewProps } from "react-native";

import { useRTL } from "@/hooks/use-rtl";
import { useThemeColor } from "@/hooks/use-theme-color";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  rtlAware?: boolean;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  rtlAware = true,
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );
  const { isRTL } = useRTL();

  const combinedStyle = [
    { backgroundColor },
    rtlAware && isRTL && { direction: "rtl" as const },
    style,
  ];

  return <View style={combinedStyle} {...otherProps} />;
}
