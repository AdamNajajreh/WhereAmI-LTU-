import { View, Text, ScrollView, TouchableOpacity } from "react-native";
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
  mutedText: "#6b7280",
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
  iconBg: "#1e3a5f",
  accent: "#60a5fa",
};

export default function About() {
  const { colorScheme } = useColorScheme();
  const c = colorScheme === "dark" ? DARK : LIGHT;
  const router = useRouter();
  useFonts({ Poppins_700Bold, Poppins_300Light });

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: c.bg }}>
      {/* Header */}
      <View className="px-6 pt-16 pb-6 items-center gap-1" style={{ backgroundColor: c.header }}>
        <TouchableOpacity className="absolute left-5 top-14 bg-white/20 rounded-full p-2" onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 32, color: "white", letterSpacing: 0.5 }}>About</Text>
        <Text
          style={{ fontFamily: "Poppins_300Light", fontSize: 14, color: "rgba(255,255,255,0.75)", letterSpacing: 4 }}
        >
          THE PROJECT
        </Text>
      </View>

      <View className="px-5 py-5 gap-4">
        {/* What is this */}
        <View className="rounded-2xl p-5 border" style={{ backgroundColor: c.card, borderColor: c.border }}>
          <Text className="text-base font-bold mb-2" style={{ color: c.text }}>
            What is Campus Navigator?
          </Text>
          <Text className="text-sm leading-6" style={{ color: c.mutedText }}>
            Campus Navigator is an AI-powered mobile app that identifies buildings at Luleå University of Technology
            (LTU) from a single photo. Point your camera at any supported building and the model will recognise it
            instantly.
          </Text>
        </View>

        {/* How it was built */}
        <View className="rounded-2xl p-5 border" style={{ backgroundColor: c.card, borderColor: c.border }}>
          <Text className="text-base font-bold mb-3" style={{ color: c.text }}>
            How it was built
          </Text>

          {[
            { icon: "images-outline", label: "Dataset", value: "~500 photos across 8 LTU buildings" },
            { icon: "hardware-chip-outline", label: "Model", value: "MobileNetV2 fine-tuned with TensorFlow" },
            { icon: "cloud-outline", label: "Backend", value: "FastAPI served on AWS EC2" },
            { icon: "phone-portrait-outline", label: "Frontend", value: "React Native with Expo" },
          ].map(({ icon, label, value }) => (
            <View key={label} className="flex-row items-center gap-3 mb-3">
              <View className="w-9 h-9 rounded-xl items-center justify-center" style={{ backgroundColor: c.iconBg }}>
                <Ionicons name={icon as any} size={18} color={c.accent} />
              </View>
              <View>
                <Text className="text-xs font-semibold" style={{ color: c.accent }}>
                  {label}
                </Text>
                <Text className="text-sm" style={{ color: c.text }}>
                  {value}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Project context */}
        <View className="rounded-2xl p-5 border" style={{ backgroundColor: c.card, borderColor: c.border }}>
          <Text className="text-base font-bold mb-2" style={{ color: c.text }}>
            Project Context
          </Text>
          <Text className="text-sm leading-6" style={{ color: c.mutedText }}>
            This app was developed as a Deep Learning Capstone project at LTU during the spring semester of 2026. The
            goal was to build an end-to-end computer vision pipeline — from data collection and model training to cloud
            deployment and mobile integration.
          </Text>
        </View>

        {/* Version */}
        <View
          className="rounded-2xl px-5 py-4 items-center border"
          style={{ backgroundColor: c.card, borderColor: c.border }}
        >
          <Text className="text-xs" style={{ color: c.mutedText }}>
            LTU Campus Navigator • v1.0.0 • 2026
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
