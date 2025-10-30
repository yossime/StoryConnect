# RTL/LTR Support - תמיכה בעברית ואנגלית

הפרויקט כולל תמיכה מלאה ב-RTL עבור עברית ו-LTR עבור אנגלית.

## התקנה מהירה

הכל כבר מוגדר! פשוט השתמש בקומפוננטים החדשים:

```tsx
import { RTLAwareView, RTLRow } from "@/components/rtl-aware-view";
import { RTLAwareText, RTLHeader } from "@/components/rtl-aware-text";
import { useRTL } from "@/hooks/use-rtl";

function MyComponent() {
  const { isRTL } = useRTL();

  return (
    <RTLAwareView>
      <RTLHeader>כותרת</RTLHeader>
      <RTLRow>
        <RTLAwareText>טקסט עם RTL אוטומטי</RTLAwareText>
      </RTLRow>
    </RTLAwareView>
  );
}
```

## מה כלול

✅ **Hooks חכמים** - `useRTL()`, `useRTLIcons()`  
✅ **קומפוננטים אוטומטיים** - `RTLAwareView`, `RTLAwareText`  
✅ **תמיכה ב-Navigation** - כיוון מסכים אוטומטי  
✅ **תמיכה ב-Tabs** - כיוון טאבים אוטומטי  
✅ **תמיכה באייקונים** - היפוך אוטומטי  
✅ **תמיכה בטקסט** - יישור אוטומטי

## החלפת שפה

```tsx
import { useTranslation } from "@/lib/i18n";

function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();

  return (
    <TouchableOpacity onPress={() => setLocale(locale === "he" ? "en" : "he")}>
      <Text>{locale === "he" ? "English" : "עברית"}</Text>
    </TouchableOpacity>
  );
}
```

## דוגמאות

ראה `examples/RTLExample.tsx` לדוגמה מלאה.

ראה `docs/RTL-Usage.md` למדריך מפורט.

## מה השתנה

- ✅ `hooks/use-rtl.ts` - Hook בסיסי ל-RTL
- ✅ `hooks/use-rtl-icons.ts` - Hook לאייקונים
- ✅ `components/rtl-aware-view.tsx` - קומפוננטי View עם RTL
- ✅ `components/rtl-aware-text.tsx` - קומפוננטי Text עם RTL
- ✅ `components/themed-view.tsx` - עודכן לתמיכה ב-RTL
- ✅ `components/themed-text.tsx` - עודכן לתמיכה ב-RTL
- ✅ `lib/i18n.ts` - עודכן עם פונקציות RTL
- ✅ `app/_layout.tsx` - עודכן עם כיוון Navigation
- ✅ `app/(tabs)/_layout.tsx` - עודכן עם כיוון Tabs
- ✅ `app/(auth)/welcome.tsx` - דוגמה לשימוש

## איך זה עובד

1. **זיהוי שפה** - המערכת מזהה אם השפה הנוכחית היא עברית או אנגלית
2. **החלפת כיוון** - אוטומטית מחליפה בין RTL ו-LTR
3. **עדכון UI** - כל הקומפוננטים מתעדכנים אוטומטית
4. **שמירה** - השפה נשמרת ב-AsyncStorage/localStorage

## תמיכה

הכל עובד אוטומטית! פשוט השתמש בקומפוננטים החדשים במקום הרגילים:

- `RTLAwareView` במקום `View`
- `RTLAwareText` במקום `Text`
- `RTLRow` עבור layouts אופקיים
- `useRTL()` עבור לוגיקה מותאמת אישית




