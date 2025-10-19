import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18nManager, Platform } from "react-native";

// Import locale files
import en from "../locales/en.json";
import he from "../locales/he.json";

export type Locale = "he" | "en";
export type TranslationKey = keyof typeof he;

const translations = {
  he,
  en,
};

class I18n {
  private currentLocale: Locale = "he"; // Default to Hebrew
  private translations = translations;

  constructor() {
    this.loadStoredLocale();
  }

  private async loadStoredLocale(): Promise<void> {
    try {
      // Only try to load from AsyncStorage on native platforms
      if (Platform.OS !== "web") {
        const stored = await AsyncStorage.getItem("locale");
        if (stored && (stored === "he" || stored === "en")) {
          this.currentLocale = stored;
          this.setRTL(stored === "he");
        }
      } else {
        // For web, try localStorage as fallback
        if (typeof window !== "undefined" && window.localStorage) {
          const stored = window.localStorage.getItem("locale");
          if (stored && (stored === "he" || stored === "en")) {
            this.currentLocale = stored;
            this.setRTL(stored === "he");
          }
        }
      }
    } catch (error) {
      console.error("Error loading stored locale:", error);
    }
  }

  private setRTL(isRTL: boolean): void {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
  }

  async setLocale(locale: Locale): Promise<void> {
    this.currentLocale = locale;
    this.setRTL(locale === "he");

    try {
      if (Platform.OS !== "web") {
        await AsyncStorage.setItem("locale", locale);
      } else if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("locale", locale);
      }
    } catch (error) {
      console.error("Error saving locale:", error);
    }
  }

  getLocale(): Locale {
    return this.currentLocale;
  }

  t(key: string, params?: Record<string, string | number>): string {
    // Try to get nested translation first
    const nestedTranslation = this.getNestedTranslation(key);
    if (nestedTranslation) {
      if (params) {
        return this.interpolate(nestedTranslation, params);
      }
      return nestedTranslation;
    }

    // Fallback to flat key (for backward compatibility)
    const translation =
      this.translations[this.currentLocale][key as TranslationKey];

    if (!translation || typeof translation !== "string") {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }

    if (params) {
      return this.interpolate(translation, params);
    }

    return translation;
  }

  private getNestedTranslation(key: string): string | null {
    const keyArray = key.split(".");
    let translation: any = this.translations[this.currentLocale];

    for (const keyPart of keyArray) {
      if (translation && typeof translation === "object") {
        translation = translation[keyPart];
      } else {
        return null;
      }
    }

    return typeof translation === "string" ? translation : null;
  }

  private interpolate(
    text: string,
    params: Record<string, string | number>
  ): string {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key]?.toString() || match;
    });
  }

  // Helper method to get nested translations
  tNested(keys: string, params?: Record<string, string | number>): string {
    const keyArray = keys.split(".");
    let translation: any = this.translations[this.currentLocale];

    for (const key of keyArray) {
      if (translation && typeof translation === "object") {
        translation = translation[key];
      } else {
        console.warn(`Translation missing for nested key: ${keys}`);
        return keys;
      }
    }

    if (typeof translation !== "string") {
      console.warn(`Translation is not a string for key: ${keys}`);
      return keys;
    }

    if (params) {
      return this.interpolate(translation, params);
    }

    return translation;
  }

  // Check if current locale is RTL
  isRTL(): boolean {
    return this.currentLocale === "en" ? false : true;
  }

}

export const i18n = new I18n();

// Hook for React components
export const useTranslation = () => {
  return {
    t: i18n.t.bind(i18n),
    tNested: i18n.tNested.bind(i18n),
    locale: i18n.getLocale(),
    setLocale: i18n.setLocale.bind(i18n),
    isRTL: i18n.isRTL(),
  };
};
