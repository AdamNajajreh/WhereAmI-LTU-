import { View, Text, Switch, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useRouter } from "expo-router";
import { useFonts, Poppins_700Bold, Poppins_300Light } from "@expo-google-fonts/poppins";

const LIGHT = {
  bg: "#f0f4ff",
  header: "#1e3a8a",
  card: "#ffffff",
  border: "#dbeafe",
  text: "#111827",
  mutedText: "#9ca3af",
  label: "#6b7280",
  iconBg: "#dbeafe",
  accent: "#1e3a8a",
};
const DARK = {
  bg: "#0d1b2a",
  header: "#0a1628",
  card: "#152238",
  border: "#1e3a5f",
  text: "#ffffff",
  mutedText: "#4b6fa0",
  label: "#4b6fa0",
  iconBg: "#1e3a5f",
  accent: "#60a5fa",
};

const BUILDINGS = [
  "Building 2",
  "Building 3",
  "Building 4",
  "Building 5",
  "Building 7",
  "Building 8",
  "Building 9",
  "Building 10",
];

function SectionLabel({ label, c }: { label: string; c: typeof LIGHT }) {
  return (
    <Text className="text-xs font-semibold uppercase tracking-wider mb-2 mt-2" style={{ color: c.label }}>
      {label}
    </Text>
  );
}

function SettingsRow({
  icon,
  label,
  sublabel,
  onPress,
  right,
  c,
  isLast = false,
}: {
  icon: string;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  c: typeof LIGHT;
  isLast?: boolean;
}) {
  const Inner = (
    <View
      className={`flex-row items-center justify-between px-4 py-3 ${!isLast ? "border-b" : ""}`}
      style={{ borderBottomColor: c.border }}
    >
      <View className="flex-row items-center gap-3">
        <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: c.iconBg }}>
          <Ionicons name={icon as any} size={17} color={c.accent} />
        </View>
        <View>
          <Text className="text-sm font-medium" style={{ color: c.text }}>
            {label}
          </Text>
          {sublabel && (
            <Text className="text-xs" style={{ color: c.mutedText }}>
              {sublabel}
            </Text>
          )}
        </View>
      </View>
      {right ?? (onPress && <Ionicons name="chevron-forward" size={16} color={c.mutedText} />)}
    </View>
  );

  return onPress ? <TouchableOpacity onPress={onPress}>{Inner}</TouchableOpacity> : <View>{Inner}</View>;
}

export default function Settings() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const c = isDark ? DARK : LIGHT;
  const router = useRouter();
  useFonts({ Poppins_700Bold, Poppins_300Light });

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: c.bg }}>
      {/* Header */}
      <View className="px-6 pt-16 pb-6 items-center gap-1" style={{ backgroundColor: c.header }}>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 32, color: "white", letterSpacing: 0.5 }}>
          Settings
        </Text>
        <Text
          style={{ fontFamily: "Poppins_300Light", fontSize: 14, color: "rgba(255,255,255,0.75)", letterSpacing: 4 }}
        >
          PREFERENCES
        </Text>
      </View>

      <View className="px-5 py-5 gap-1">
        {/* Appearance */}
        <SectionLabel label="Appearance" c={c} />
        <View className="rounded-2xl overflow-hidden border" style={{ backgroundColor: c.card, borderColor: c.border }}>
          <SettingsRow
            icon={isDark ? "moon" : "sunny"}
            label="Dark Mode"
            sublabel={isDark ? "Currently dark" : "Currently light"}
            c={c}
            isLast
            right={
              <Switch
                value={isDark}
                onValueChange={(val) => setColorScheme(val ? "dark" : "light")}
                trackColor={{ false: "#dbeafe", true: "#1d4ed8" }}
                thumbColor="white"
              />
            }
          />
        </View>

        {/* AI Model */}
        <SectionLabel label="AI Model" c={c} />
        <View className="rounded-2xl overflow-hidden border" style={{ backgroundColor: c.card, borderColor: c.border }}>
          <SettingsRow
            icon="hardware-chip-outline"
            label="Architecture"
            sublabel="MobileNetV2 (Transfer Learning)"
            c={c}
          />
          <SettingsRow icon="analytics-outline" label="Test Accuracy" sublabel="94.02% on held-out test set" c={c} />
          <SettingsRow icon="layers-outline" label="Input Size" sublabel="224 × 224 RGB image" c={c} />
          <SettingsRow icon="school-outline" label="Framework" sublabel="TensorFlow 2.16 / Keras 3" c={c} />
          <SettingsRow icon="server-outline" label="Inference" sublabel="Cloud — FastAPI on AWS EC2" c={c} isLast />
        </View>

        {/* Supported Buildings */}
        <SectionLabel label="Supported Buildings" c={c} />
        <View className="rounded-2xl border p-4" style={{ backgroundColor: c.card, borderColor: c.border }}>
          <View className="flex-row flex-wrap gap-2">
            {BUILDINGS.map((b) => (
              <View key={b} className="rounded-lg px-3 py-1.5" style={{ backgroundColor: c.iconBg }}>
                <Text className="text-xs font-semibold" style={{ color: c.accent }}>
                  {b}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* About */}
        <SectionLabel label="About" c={c} />
        <View className="rounded-2xl overflow-hidden border" style={{ backgroundColor: c.card, borderColor: c.border }}>
          <SettingsRow
            icon="information-circle-outline"
            label="About this App"
            onPress={() => router.push("/about")}
            c={c}
          />
          <SettingsRow icon="code-slash-outline" label="Version" sublabel="1.0.0" c={c} isLast />
        </View>
      </View>
    </ScrollView>
  );
}
