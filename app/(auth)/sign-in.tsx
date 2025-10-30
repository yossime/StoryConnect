import LoadingAnimation from '@/components/ui/loading-animation';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SignInScreen() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { signIn, signInWithProvider, isLoading } = useAuthStore();
  const colors = Colors[colorScheme ?? 'light'];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoadingbygoogle, setIsLoadingbygoogle] = useState(false);
  const [isLoadingbyapple, setIsLoadingbyapple] = useState(false);


  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight?.() ?? 0;

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert(t('common.error'), t('auth.pleaseFillInAllFields'));
      return;
    }
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('auth.signInFailed'));
    }
  };

  const handleProviderSignIn = async (provider: 'google' | 'apple') => {
    try {
      if (provider === 'google') {
        setIsLoadingbygoogle(true);
      } else if (provider === 'apple') {
        setIsLoadingbyapple(true);
      }
      await signInWithProvider(provider);
      if (provider === 'google') {
        setIsLoadingbygoogle(false);
      } else if (provider === 'apple') {
        setIsLoadingbyapple(false);
      }
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('auth.providerSignInFailed'));
      if (provider === 'google') {
        setIsLoadingbygoogle(false);
      } else if (provider === 'apple') {
        setIsLoadingbyapple(false);
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: Layout.spacing.lg, paddingBottom: Math.max(insets.bottom, Layout.spacing.lg) }
          ]}
          keyboardShouldPersistTaps="handled"
          overScrollMode="always"
          contentInsetAdjustmentBehavior={Platform.OS === 'ios' ? 'automatic' : undefined}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{t('auth.welcome')}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('auth.signInToContinue')}</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>{t('auth.email')}</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }
                ]}
                placeholder={t('auth.enterYourEmail')}
                placeholderTextColor={colors.placeholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="username"
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>{t('auth.password')}</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }
                  ]}
                  placeholder={t('auth.enterYourPassword')}
                  placeholderTextColor={colors.placeholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="password"
                  returnKeyType="done"
                  onSubmitEditing={handleSignIn}
                />
                <TouchableOpacity style={styles.passwordToggle} onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.signInButton, { backgroundColor: colors.secondary, opacity: isLoading ? 0.6 : 1 }]}
              onPress={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <LoadingAnimation size={6} color={colors.primary} />
                  <Text
                    style={[styles.signInButtonText, { color: colors.primary, marginLeft: 8 }]}
                  >
                    {t('common.loading')}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.signInButtonText, { color: colors.primary }]}>
                  {t('auth.signIn')}
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textSecondary }]}>{t('auth.orContinueWith')}</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            <View style={styles.providerButtons}>
              <TouchableOpacity
                style={[
                  styles.providerButton, 
                  { 
                    backgroundColor: colors.surface, 
                    borderColor: colors.border,
                    opacity: isLoadingbygoogle ? 0.6 : 1,
                  }
                ]}
                onPress={() => handleProviderSignIn('google')}
                disabled={isLoadingbygoogle}
              >
                {isLoadingbygoogle ? (
                  <LoadingAnimation size={6} color={colors.text} />
                ) : (
                  <Ionicons name="logo-google" size={20} color="#DB4437" />
                )}
                <Text style={[styles.providerButtonText, { color: colors.text }]}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.providerButton, 
                  { 
                    backgroundColor: colors.surface, 
                    borderColor: colors.border,
                    opacity: isLoadingbyapple ? 0.6 : 1,
                  }
                ]}
                onPress={() => handleProviderSignIn('apple')}
                disabled={isLoadingbyapple}
              >
                {isLoadingbyapple ? (
                  <LoadingAnimation size={6} color={colors.text} />
                ) : (
                  <Ionicons name="logo-apple" size={20} color={colors.text} />
                )}
                <Text style={[styles.providerButtonText, { color: colors.text }]}>Apple</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>{t('auth.dontHaveAnAccount')}</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
              <Text style={[styles.footerLink, { color: colors.secondary }]}>{t('auth.signUp')}</Text>
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
  scrollContent: { flexGrow: 1 },
  header: { marginTop: Layout.spacing.xl, marginBottom: Layout.spacing.xl },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: Layout.spacing.sm },
  subtitle: { fontSize: 16 },
  form: { flexGrow: 1 },
  inputContainer: { marginBottom: Layout.spacing.lg },
  label: { fontSize: 16, fontWeight: '500', marginBottom: Layout.spacing.sm },
  input: {
    borderWidth: 1,
    borderRadius: Layout.borderRadius.lg,
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
    fontSize: 16
  },
  passwordContainer: { position: 'relative' },
  passwordInput: { paddingRight: 50 },
  passwordToggle: { position: 'absolute', right: Layout.spacing.md, top: Layout.spacing.md, padding: Layout.spacing.sm },
  signInButton: { paddingVertical: Layout.spacing.md, borderRadius: Layout.borderRadius.lg, alignItems: 'center', marginTop: Layout.spacing.lg },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInButtonText: { fontSize: 16, fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: Layout.spacing.xl },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: Layout.spacing.md, fontSize: 14 },
  providerButtons: { gap: Layout.spacing.md },
  providerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Layout.spacing.md, borderRadius: Layout.borderRadius.lg, borderWidth: 1, gap: Layout.spacing.sm },
  providerButtonText: { fontSize: 16, fontWeight: '500' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Layout.spacing.xl },
  footerText: { fontSize: 16 , marginRight: Layout.spacing.sm  },
  footerLink: { fontSize: 16, fontWeight: '500' },
});
