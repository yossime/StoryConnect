import { Stack } from "expo-router";
// import { useTranslation } from '@/lib/i18n';

export default function AuthLayout() {
  // const { t } = useTranslation();
  const t = (key: string) => key; // Temporary fallback

  return (
    <Stack>
      <Stack.Screen
        name="welcome"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="sign-in"
        options={{
          title: t("auth.signIn"),
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="sign-up"
        options={{
          title: t("auth.signUp"),
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="pick-handle"
        options={{
          title: t("auth.pickHandle"),
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="suggested-follows"
        options={{
          title: t("auth.suggestedFollows"),
          headerBackTitleVisible: false,
        }}
      />
    </Stack>
  );
}
