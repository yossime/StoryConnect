import { RTLAwareText, RTLBody, RTLHeader } from "@/components/rtl-aware-text";
import { RTLAwareView, RTLRow } from "@/components/rtl-aware-view";
import { Colors } from "@/constants/Colors";
import { Layout } from "@/constants/Layout";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "@/lib/i18n";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const { t, setLocale } = useTranslation();
  const colors = Colors[colorScheme ?? "light"];
  // setLocale("he");

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <RTLAwareView style={styles.content}>
        {/* Logo/Brand */}
        <RTLAwareView style={styles.logoContainer}>
          <RTLAwareView
            style={[styles.logo, { backgroundColor: colors.secondary }]}
          >
            <RTLAwareText style={[styles.logoText, { color: colors.primary }]}>
              SC
            </RTLAwareText>
          </RTLAwareView>
          <RTLHeader style={[styles.appName, { color: colors.text }]}>
            StoryConnect
          </RTLHeader>
          <RTLBody style={[styles.tagline, { color: colors.textSecondary }]}>
            {t("auth.shareStoriesThatDisappearIn24Hours")}
          </RTLBody>
        </RTLAwareView>

        {/* Features */}
        <RTLAwareView style={styles.features}>
          <RTLRow style={styles.feature}>
            <RTLAwareText
              style={[styles.featureIcon, { color: colors.secondary }]}
            >
              📱
            </RTLAwareText>
            <RTLBody style={[styles.featureText, { color: colors.text }]}>
              {t("auth.sharePhotosVideosText")}
            </RTLBody>
          </RTLRow>
          <RTLRow style={styles.feature}>
            <RTLAwareText
              style={[styles.featureIcon, { color: colors.secondary }]}
            >
              ⏰
            </RTLAwareText>
            <RTLBody style={[styles.featureText, { color: colors.text }]}>
              {t("auth.autoDeleteAfter24Hours")}
            </RTLBody>
          </RTLRow>
          <RTLRow style={styles.feature}>
            <RTLAwareText
              style={[styles.featureIcon, { color: colors.secondary }]}
            >
              🔒
            </RTLAwareText>
            <RTLBody style={[styles.featureText, { color: colors.text }]}>
              {t("auth.followersOnlyOrPublic")}
            </RTLBody>
          </RTLRow>
          <RTLRow style={styles.feature}>
            <RTLAwareText
              style={[styles.featureIcon, { color: colors.secondary }]}
            >
              📊
            </RTLAwareText>
            <RTLBody style={[styles.featureText, { color: colors.text }]}>
              {t("auth.viewAnalytics")}
            </RTLBody>
          </RTLRow>
        </RTLAwareView>

        {/* Action Buttons */}
        <RTLAwareView style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: colors.secondary },
            ]}
            onPress={() => router.push("/(auth)/sign-in")}
            activeOpacity={0.8}
          >
            <RTLBody
              style={[styles.primaryButtonText, { color: colors.primary }]}
            >
              {t("auth.signIn")}
            </RTLBody>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.border }]}
            onPress={() => router.push("/(auth)/sign-up")}
            activeOpacity={0.8}
          >
            <RTLBody
              style={[styles.secondaryButtonText, { color: colors.text }]}
            >
              {t("auth.signUp")}
            </RTLBody>
          </TouchableOpacity>
        </RTLAwareView>

        {/* Footer */}
        <RTLBody style={[styles.footer, { color: colors.textTertiary }]}>
          {t("auth.byContinuing")}
        </RTLBody>
      </RTLAwareView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Layout.spacing.lg,
    justifyContent: "space-between",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: Layout.spacing.xxl * 2,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: Layout.borderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Layout.spacing.lg,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: Layout.spacing.sm,
  },
  tagline: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  features: {
    flex: 1,
    justifyContent: "center",
    gap: Layout.spacing.lg,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: Layout.spacing.md,
  },
  featureIcon: {
    fontSize: 24,
    width: 40,
    textAlign: "center",
  },
  featureText: {
    fontSize: 16,
    flex: 1,
  },
  actions: {
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  primaryButton: {
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    alignItems: "center",
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: Layout.spacing.md,
  },
});
