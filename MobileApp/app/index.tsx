import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useFonts, Poppins_700Bold, Poppins_300Light } from "@expo-google-fonts/poppins";

const RECENT_SCANS = [
  { id: "1", building: "Building 8", confidence: "97%", time: "2 min ago" },
  { id: "2", building: "Building 3", confidence: "91%", time: "Yesterday" },
];

// Light mode: navy blue  |  Dark mode: deep navy
const LIGHT = {
  bg: "#f0f4ff",
  header: "#1e3a8a",
  card: "#ffffff",
  border: "#dbeafe",
  accent: "#1e3a8a",
  iconBg: "#dbeafe",
  subtext: "#4b5563",
  text: "#111827",
  mutedText: "#9ca3af",
  scanBtn: "#1e3a8a",
  scanSub: "#93c5fd",
};

const DARK = {
  bg: "#0d1b2a",
  header: "#0a1628",
  card: "#152238",
  border: "#1e3a5f",
  accent: "#60a5fa",
  iconBg: "#1e3a5f",
  subtext: "#93c5fd",
  text: "#ffffff",
  mutedText: "#4b6fa0",
  scanBtn: "#1d4ed8",
  scanSub: "#93c5fd",
};

export default function Dashboard() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const c = colorScheme === "dark" ? DARK : LIGHT;
  useFonts({ Poppins_700Bold, Poppins_300Light }); // already loaded in _layout, cached

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: c.bg }}>
      {/* Header */}
      <View className="px-6 pt-16 pb-6 items-center gap-1" style={{ backgroundColor: c.header }}>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 32, color: "white", letterSpacing: 0.5 }}>LTU</Text>
        <Text
          style={{ fontFamily: "Poppins_300Light", fontSize: 14, color: "rgba(255,255,255,0.75)", letterSpacing: 4 }}
        >
          CAMPUS NAVIGATOR
        </Text>
      </View>

      <View className="px-6 py-6 gap-6">
        {/* Primary action */}
        <TouchableOpacity
          className="rounded-2xl py-8 items-center gap-3"
          style={{ backgroundColor: c.scanBtn }}
          onPress={() => router.push("/scan")}
        >
          <Ionicons name="camera" size={48} color="white" />
          <Text className="text-white text-2xl font-bold">Scan Building</Text>
          <Text className="text-sm" style={{ color: c.scanSub }}>
            Take a photo to identify
          </Text>
        </TouchableOpacity>

        {/* Upload from gallery */}
        <TouchableOpacity
          className="rounded-2xl py-5 flex-row items-center justify-center gap-3 border"
          style={{ backgroundColor: c.card, borderColor: c.border }}
          onPress={() => router.push("/scan")}
        >
          <Ionicons name="images-outline" size={24} color={c.accent} />
          <Text className="text-lg font-semibold" style={{ color: c.accent }}>
            Upload from Gallery
          </Text>
        </TouchableOpacity>

        {/* How it works */}
        <View className="rounded-2xl pt-3 px-5 border" style={{ backgroundColor: c.card, borderColor: c.border }}>
          <Text className="text-lg font-bold mb-4" style={{ color: c.text }}>
            How it works
          </Text>

          {[
            { step: "1", title: "Point & Shoot", desc: "Aim your camera at any building on LTU campus." },
            {
              step: "2",
              title: "AI Detection",
              desc: "Model analyses the image in seconds.",
            },
            { step: "3", title: "Get the Result", desc: "See the building name and confidence score instantly." },
          ].map(({ step, title, desc }, index) => (
            <View key={step} className="flex-row gap-4">
              {/* number bubble + connector line */}
              <View className="items-center">
                <View
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: c.accent }}
                >
                  <Text className="text-white text-sm font-bold">{step}</Text>
                </View>
                {index < 2 && <View className="w-px flex-1 my-1" style={{ backgroundColor: c.border }} />}
              </View>

              {/* text */}
              <View className="flex-1 pb-5">
                <Text className="font-semibold text-sm" style={{ color: c.text }}>
                  {title}
                </Text>
                <Text className="text-xs mt-0.5 leading-5" style={{ color: c.subtext }}>
                  {desc}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Recent scans */}
        <View className="rounded-2xl pt-3 px-5 border" style={{ backgroundColor: c.card, borderColor: c.border }}>
          <Text className="text-lg font-bold mb-4" style={{ color: c.text }}>
            Recent Scans
          </Text>

          <View className="gap-3">
            {RECENT_SCANS.map((scan) => (
              <View
                key={scan.id}
                className="rounded-xl px-4 py-4 flex-row items-center justify-between"
                style={{ backgroundColor: c.iconBg }}
              >
                <View className="flex-row items-center gap-3">
                  <View
                    className="rounded-full w-10 h-10 items-center justify-center"
                    style={{ backgroundColor: c.card }}
                  >
                    <Ionicons name="business-outline" size={20} color={c.accent} />
                  </View>
                  <View>
                    <Text className="font-semibold" style={{ color: c.text }}>
                      {scan.building}
                    </Text>
                    <Text className="text-xs" style={{ color: c.mutedText }}>
                      {scan.time}
                    </Text>
                  </View>
                </View>
                <Text className="text-green-500 font-semibold text-sm">{scan.confidence}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
