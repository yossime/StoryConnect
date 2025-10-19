import { RTLAwareText, RTLBody, RTLHeader } from "@/components/rtl-aware-text";
import { RTLAwareView, RTLRow } from "@/components/rtl-aware-view";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRTL } from "@/hooks/use-rtl";
import { useRTLIcons } from "@/hooks/use-rtl-icons";
import { useTranslation } from "@/lib/i18n";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

/**
 * דוגמה לשימוש ב-RTL hooks ו-components
 */
export function RTLExample() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const { t, locale, setLocale, isRTL } = useTranslation();
  const { textAlign, flexDirection, rtlStyle } = useRTL();
  const { flipIcon, getArrowDirection, getIconMargin } = useRTLIcons();

  const toggleLanguage = () => {
    setLocale(locale === "he" ? "en" : "he");
  };

  return (
    <RTLAwareView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* כותרת */}
      <RTLHeader style={[styles.title, { color: colors.text }]}>
        {t("auth.welcome")}
      </RTLHeader>

      {/* מידע על כיוון השפה */}
      <RTLAwareView style={[styles.infoBox, { backgroundColor: colors.card }]}>
        <RTLRow style={styles.infoRow}>
          <RTLAwareText style={[styles.infoLabel, { color: colors.text }]}>
            {t("common.loading")}:
          </RTLAwareText>
          <RTLAwareText style={[styles.infoValue, { color: colors.primary }]}>
            {locale} ({isRTL ? "RTL" : "LTR"})
          </RTLAwareText>
        </RTLRow>

        <RTLRow style={styles.infoRow}>
          <RTLAwareText style={[styles.infoLabel, { color: colors.text }]}>
            Text Align:
          </RTLAwareText>
          <RTLAwareText style={[styles.infoValue, { color: colors.primary }]}>
            {textAlign}
          </RTLAwareText>
        </RTLRow>

        <RTLRow style={styles.infoRow}>
          <RTLAwareText style={[styles.infoLabel, { color: colors.text }]}>
            Flex Direction:
          </RTLAwareText>
          <RTLAwareText style={[styles.infoValue, { color: colors.primary }]}>
            {flexDirection}
          </RTLAwareText>
        </RTLRow>
      </RTLAwareView>

      {/* רשימת תכונות */}
      <RTLAwareView style={styles.featuresContainer}>
        <RTLBody style={[styles.sectionTitle, { color: colors.text }]}>
          Features:
        </RTLBody>

        {[
          { icon: "📱", text: t("auth.sharePhotosVideosText") },
          { icon: "⏰", text: t("auth.autoDeleteAfter24Hours") },
          { icon: "🔒", text: t("auth.followersOnlyOrPublic") },
          { icon: "📊", text: t("auth.viewAnalytics") },
        ].map((feature, index) => (
          <RTLRow
            key={index}
            style={[styles.feature, { borderBottomColor: colors.border }]}
          >
            <RTLAwareText style={styles.featureIcon}>
              {feature.icon}
            </RTLAwareText>
            <RTLBody style={[styles.featureText, { color: colors.text }]}>
              {feature.text}
            </RTLBody>
          </RTLRow>
        ))}
      </RTLAwareView>

      {/* כפתור החלפת שפה */}
      <TouchableOpacity
        style={[styles.languageButton, { backgroundColor: colors.secondary }]}
        onPress={toggleLanguage}
      >
        <RTLRow style={styles.buttonContent}>
          <Ionicons
            size={20}
            color={colors.primary}
            style={flipIcon(getIconMargin("start", 8))}
          />
          <RTLAwareText style={[styles.buttonText, { color: colors.primary }]}>
            {locale === "he" ? "Switch to English" : "החלף לעברית"}
          </RTLAwareText>
        </RTLRow>
      </TouchableOpacity>

      {/* דוגמה ל-rtlStyle */}
      <RTLAwareView
        style={rtlStyle({
          marginLeft: 20,
          paddingRight: 30,
          borderLeftWidth: 2,
          borderRightWidth: 2,
        })}
      >
        <RTLBody style={[styles.rtlDemoText, { color: colors.text }]}>
          This box uses rtlStyle() - margins and borders flip automatically!
        </RTLBody>
      </RTLAwareView>
    </RTLAwareView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
  },
  infoBox: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoRow: {
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: "600",
  },
  infoValue: {
    fontWeight: "bold",
  },
  featuresContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 10,
  },
  feature: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  featureIcon: {
    fontSize: 20,
    marginHorizontal: 10,
  },
  featureText: {
    flex: 1,
  },
  languageButton: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontWeight: "600",
  },
  rtlDemoText: {
    padding: 10,
    fontStyle: "italic",
  },
});
