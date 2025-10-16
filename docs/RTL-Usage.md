# RTL/LTR Support Guide

הפרויקט כולל תמיכה מלאה ב-RTL (Right-to-Left) עבור עברית ו-LTR (Left-to-Right) עבור אנגלית.

## רכיבים זמינים

### 1. Hooks

#### `useRTL()`

Hook בסיסי שמספק פונקציונליות RTL:

```tsx
import { useRTL } from "@/hooks/use-rtl";

function MyComponent() {
  const { isRTL, textAlign, flexDirection, rtlStyle } = useRTL();

  return (
    <View
      style={rtlStyle({
        marginLeft: 10,
        paddingRight: 20,
        textAlign: "left",
      })}
    >
      <Text>הטקסט הזה יתאים אוטומטית לכיוון השפה</Text>
    </View>
  );
}
```

#### `useTranslation()`

Hook משופר שכולל גם RTL:

```tsx
import { useTranslation } from "@/lib/i18n";

function MyComponent() {
  const { t, isRTL, textAlign, flexDirection, writingDirection } =
    useTranslation();

  return (
    <Text style={{ textAlign, writingDirection }}>{t("common.loading")}</Text>
  );
}
```

#### `useRTLIcons()`

Hook לטיפול באייקונים:

```tsx
import { useRTLIcons } from "@/hooks/use-rtl-icons";

function MyComponent() {
  const { flipIcon, getArrowDirection } = useRTLIcons();

  return (
    <Ionicons
      name={getArrowDirection("left")} // יהפוך ל-right בעברית
      style={flipIcon({ transform: [{ rotate: "45deg" }] })}
    />
  );
}
```

### 2. Components

#### `RTLAwareView` / `RTLRow` / `RTLColumn`

קומפוננטים שמטפלים ב-RTL אוטומטית:

```tsx
import { RTLAwareView, RTLRow, RTLColumn } from "@/components/rtl-aware-view";

function MyComponent() {
  return (
    <RTLAwareView style={{ padding: 10 }}>
      <RTLRow style={{ alignItems: "center" }}>
        <Icon />
        <Text>טקסט</Text>
      </RTLRow>
      <RTLColumn style={{ gap: 10 }}>
        <Text>פריט 1</Text>
        <Text>פריט 2</Text>
      </RTLColumn>
    </RTLAwareView>
  );
}
```

#### `RTLAwareText` / `RTLHeader` / `RTLBody`

קומפוננטי טקסט שמטפלים ב-RTL:

```tsx
import { RTLAwareText, RTLHeader, RTLBody } from "@/components/rtl-aware-text";

function MyComponent() {
  return (
    <RTLAwareView>
      <RTLHeader>כותרת</RTLHeader>
      <RTLBody>טקסט רגיל</RTLBody>
      <RTLAwareText forceAlign="center">טקסט במרכז</RTLAwareText>
    </RTLAwareView>
  );
}
```

#### `ThemedView` / `ThemedText` (משודרגים)

הקומפוננטים הקיימים עודכנו לתמיכה ב-RTL:

```tsx
import { ThemedView, ThemedText } from "@/components/themed-view";

function MyComponent() {
  return (
    <ThemedView rtlAware={true}>
      <ThemedText rtlAware={true}>טקסט עם תמיכה ב-RTL</ThemedText>
    </ThemedView>
  );
}
```

## דוגמאות שימוש

### 1. רשימה עם אייקונים

```tsx
function FeatureList() {
  return (
    <RTLAwareView>
      {features.map((feature, index) => (
        <RTLRow key={index} style={styles.feature}>
          <RTLAwareText style={styles.icon}>{feature.icon}</RTLAwareText>
          <RTLBody>{feature.text}</RTLBody>
        </RTLRow>
      ))}
    </RTLAwareView>
  );
}
```

### 2. כפתורים עם אייקונים

```tsx
function ActionButton({ icon, text, onPress }) {
  const { getIconMargin } = useRTLIcons();

  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <RTLRow style={styles.buttonContent}>
        <Ionicons
          name={icon}
          style={[styles.icon, getIconMargin("start", 8)]}
        />
        <RTLBody>{text}</RTLBody>
      </RTLRow>
    </TouchableOpacity>
  );
}
```

### 3. טופס עם שדות

```tsx
function FormField({ label, value, onChangeText }) {
  return (
    <RTLAwareView style={styles.field}>
      <RTLBody style={styles.label}>{label}</RTLBody>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        textAlign={useRTL().textAlign}
      />
    </RTLAwareView>
  );
}
```

## טיפים וכללים

1. **השתמש בקומפוננטים החדשים** - הם מטפלים ב-RTL אוטומטית
2. **הימנע מ-marginLeft/marginRight** - השתמש ב-marginStart/marginEnd
3. **הימנע מ-paddingLeft/paddingRight** - השתמש ב-paddingStart/paddingEnd
4. **עבור אייקונים** - השתמש ב-useRTLIcons() או flipIcon()
5. **עבור טקסט** - השתמש ב-RTLAwareText או הגדר textAlign אוטומטית

## הגדרת שפה

השפה מוגדרת אוטומטית על פי ה-locale הנוכחי:

- `he` (עברית) = RTL
- `en` (אנגלית) = LTR

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

## תמיכה ב-Navigation

ה-Navigation מוגדר אוטומטית ל-RTL/LTR על פי השפה הנוכחית:

```tsx
// app/_layout.tsx
<Stack
  screenOptions={{
    direction: isRTL ? 'rtl' : 'ltr',
  }}
>
```

## בדיקת RTL

כדי לבדוק את תמיכת ה-RTL:

1. שנה את השפה לעברית
2. בדוק שהטקסט מיושר לימין
3. בדוק שה-layouts מתהפכים (אייקונים, כפתורים)
4. בדוק שה-navigation עובד בכיוון הנכון
