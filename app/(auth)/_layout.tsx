import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "@/lib/i18n";

export default function AuthLayout() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
          }}
        />
        <Stack.Screen
          name="sign-up"
          options={{
            title: t("auth.signUp"),
          }}
        />
      </Stack>
    </SafeAreaView>
  );
}
