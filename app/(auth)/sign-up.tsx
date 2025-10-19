import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "@/lib/i18n";
import { useAuthStore } from "@/store/authStore";
import { Colors } from "@/constants/Colors";
import { Layout } from "@/constants/Layout";
import { useHeaderHeight } from "@react-navigation/elements";

export default function SignUpScreen() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { signUp, signInWithProvider, isLoading } = useAuthStore();
  const colors = Colors[colorScheme ?? "light"];

  const [email, setEmail] = useState("");
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const headerHeight = useHeaderHeight?.() ?? 0;

  const validate = () => {
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const handleRx = /^[a-zA-Z0-9_]{3,20}$/;

    if (!email || !handle || !displayName || !password || !confirm) {
      Alert.alert(t("common.error"), "Please fill in all fields");
      return false;
    }
    if (!emailRx.test(email)) {
      Alert.alert(t("common.error"), "Please enter a valid email");
      return false;
    }
    if (!handleRx.test(handle)) {
      Alert.alert(
        t("common.error"),
        "Handle must be 3–20 chars: letters, numbers, or underscores"
      );
      return false;
    }
    if (password.length < 6) {
      Alert.alert(t("common.error"), "Password must be at least 6 characters");
      return false;
    }
    if (password !== confirm) {
      Alert.alert(t("common.error"), "Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    try {
      await signUp(email.trim(), password, handle.trim(), displayName.trim());
      Alert.alert(t("auth.signUp"), "Account created. Please sign in.", [
        { text: "OK", onPress: () => router.replace("/(auth)/sign-in") },
      ]);
    } catch (error: any) {
      Alert.alert(t("common.error"), error?.message || "Sign up failed");
    }
  };

  const handleProviderSignIn = async (provider: "google" | "apple") => {
    try {
      await signInWithProvider(provider);
      // OAuth flow will handle navigation (redirect)
    } catch (error: any) {
      Alert.alert(
        t("common.error"),
        error?.message || "Provider sign in failed"
      );
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {t("auth.signUp")}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t("auth.createYourAccount")}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                {t("auth.email")}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder={t("auth.enterYourEmail")}
                placeholderTextColor={colors.placeholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.rowItem]}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {t("auth.handle")}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  placeholder={t("auth.handlePlaceholder")}
                  placeholderTextColor={colors.placeholder}
                  value={handle}
                  onChangeText={setHandle}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={[styles.inputContainer, styles.rowItem]}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {t("auth.displayName") ?? "Display name"}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  placeholder={t("auth.displayNamePlaceholder")}
                  placeholderTextColor={colors.placeholder}
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                {t("auth.password")}
              </Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  placeholder={t("auth.createAPassword")}
                  placeholderTextColor={colors.placeholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword((v) => !v)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                {t("auth.confirmPassword")}
              </Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  placeholder={t("auth.reEnterYourPassword")}
                  placeholderTextColor={colors.placeholder}
                  value={confirm}
                  onChangeText={setConfirm}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowConfirm((v) => !v)}
                >
                  <Ionicons
                    name={showConfirm ? "eye-off" : "eye"}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.signUpButton,
                {
                  backgroundColor: colors.secondary,
                  opacity: isLoading ? 0.6 : 1,
                },
              ]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <Text
                style={[styles.signUpButtonText, { color: colors.primary }]}
              >
                {isLoading ? t("common.loading") : t("auth.signUp")}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View
                style={[styles.dividerLine, { backgroundColor: colors.border }]}
              />
              <Text
                style={[styles.dividerText, { color: colors.textSecondary }]}
              >
                {t("auth.orContinueWith")}
              </Text>
              <View
                style={[styles.dividerLine, { backgroundColor: colors.border }]}
              />
            </View>

            <View style={styles.providerButtons}>
              <TouchableOpacity
                style={[
                  styles.providerButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => handleProviderSignIn("google")}
                disabled={isLoading}
              >
                <Ionicons name="logo-google" size={20} color="#DB4437" />
                <Text
                  style={[styles.providerButtonText, { color: colors.text }]}
                >
                  Google
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.providerButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => handleProviderSignIn("apple")}
                disabled={isLoading}
              >
                <Ionicons name="logo-apple" size={20} color={colors.text} />
                <Text
                  style={[styles.providerButtonText, { color: colors.text }]}
                >
                  Apple
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              {t("auth.alreadyHaveAnAccount")}
            </Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)/sign-in")}>
              <Text style={[styles.footerLink, { color: colors.secondary }]}>
                {t("auth.signIn")}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: { marginTop: Layout.spacing.xl, marginBottom: Layout.spacing.xl },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: Layout.spacing.sm },
  subtitle: { fontSize: 16 },
  form: { flex: 1 },
  inputContainer: { marginBottom: Layout.spacing.lg },
  label: { fontSize: 16, fontWeight: "500", marginBottom: Layout.spacing.sm },
  input: {
    borderWidth: 1,
    borderRadius: Layout.borderRadius.lg,
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  rowItem: { flex: 1, marginBottom: 0 },
  passwordContainer: { position: "relative" },
  passwordInput: { paddingRight: 50 },
  passwordToggle: {
    position: "absolute",
    right: Layout.spacing.md,
    top: Layout.spacing.md,
    padding: Layout.spacing.sm,
  },
  signUpButton: {
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    alignItems: "center",
    marginTop: Layout.spacing.lg,
  },
  signUpButtonText: { fontSize: 16, fontWeight: "600" },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Layout.spacing.xl,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: Layout.spacing.md, fontSize: 14 },
  providerButtons: { gap: Layout.spacing.md },
  providerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    gap: Layout.spacing.sm,
  },
  providerButtonText: { fontSize: 16, fontWeight: "500" },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: Layout.spacing.lg,
    marginTop: Layout.spacing.xl,
  },

  footerText: { fontSize: 16, textAlign: "center" , marginRight: Layout.spacing.sm  },
  footerLink: { fontSize: 16, fontWeight: "500", textAlign: "center" },
});
