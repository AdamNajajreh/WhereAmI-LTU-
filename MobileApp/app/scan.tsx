import { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useFonts, Poppins_700Bold, Poppins_300Light } from "@expo-google-fonts/poppins";
import { useLocalSearchParams } from "expo-router";

const LIGHT = {
  bg: "#f0f4ff",
  card: "#ffffff",
  border: "#dbeafe",
  text: "#111827",
  mutedText: "#6b7280",
  accent: "#1e3a8a",
  iconBg: "#dbeafe",
};
const DARK = {
  bg: "#0d1b2a",
  card: "#152238",
  border: "#1e3a5f",
  text: "#ffffff",
  mutedText: "#4b6fa0",
  accent: "#60a5fa",
  iconBg: "#1e3a5f",
};

type Stage = "camera" | "loading" | "result";
type Prediction = { building: string; confidence: number };

// ─── API call ────────────────────────────────────────────────────────────────
// TODO: replace with EC2 public IP when deployed
const API_URL = "http://172.20.10.2:8000/predict";

async function classifyImage(uri: string): Promise<Prediction> {
  const formData = new FormData();
  formData.append("file", { uri, name: "photo.jpg", type: "image/jpeg" } as any);

  const res = await fetch(API_URL, { method: "POST", body: formData });
  if (!res.ok) throw new Error("Server error");
  const json = await res.json();
  return { building: json.building, confidence: json.confidence };
}

// ─── Screens ─────────────────────────────────────────────────────────────────

function LoadingScreen({ c }: { c: typeof LIGHT }) {
  return (
    <View className="flex-1 items-center justify-center gap-6" style={{ backgroundColor: c.bg }}>
      <View className="w-20 h-20 rounded-full items-center justify-center" style={{ backgroundColor: c.iconBg }}>
        <ActivityIndicator size="large" color={c.accent} />
      </View>
      <Text className="text-lg font-semibold" style={{ color: c.text }}>
        Analysing building...
      </Text>
      <Text className="text-sm" style={{ color: c.mutedText }}>
        Sending image to AI model
      </Text>
    </View>
  );
}

function ResultScreen({
  image,
  prediction,
  onRetry,
  c,
}: {
  image: string;
  prediction: Prediction;
  onRetry: () => void;
  c: typeof LIGHT;
}) {
  const pct = Math.round(prediction.confidence * 100);

  return (
    <View className="flex-1" style={{ backgroundColor: c.bg }}>
      {/* Captured image */}
      <Image source={{ uri: image }} className="w-full" style={{ height: 300 }} resizeMode="cover" />

      {/* Result card */}
      <View className="flex-1 px-6 py-8 gap-6">
        <View
          className="rounded-2xl p-6 border items-center gap-3"
          style={{ backgroundColor: c.card, borderColor: c.border }}
        >
          <Text className="text-sm font-semibold uppercase tracking-widest" style={{ color: c.mutedText }}>
            Identified as
          </Text>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 28, color: c.text }}>{prediction.building}</Text>

          {/* Confidence bar */}
          <View className="w-full gap-2">
            <View className="flex-row justify-between">
              <Text className="text-xs" style={{ color: c.mutedText }}>
                Confidence
              </Text>
              <Text className="text-xs font-bold" style={{ color: c.accent }}>
                {pct}%
              </Text>
            </View>
            <View className="w-full h-2 rounded-full" style={{ backgroundColor: c.iconBg }}>
              <View
                className="h-2 rounded-full"
                style={{ width: `${pct}%`, backgroundColor: pct > 85 ? "#22c55e" : pct > 60 ? "#f59e0b" : "#ef4444" }}
              />
            </View>
          </View>
        </View>

        {/* Scan again */}
        <TouchableOpacity
          className="rounded-2xl py-4 items-center"
          style={{ backgroundColor: c.accent }}
          onPress={onRetry}
        >
          <Text className="text-white text-base font-bold">Scan Another Building</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Scan() {
  const { colorScheme } = useColorScheme();
  const c = colorScheme === "dark" ? DARK : LIGHT;
  useFonts({ Poppins_700Bold, Poppins_300Light });

  const { imageUri } = useLocalSearchParams<{ imageUri?: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [stage, setStage] = useState<Stage>("camera");
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  // If opened from dashboard gallery picker, run prediction immediately
  useEffect(() => {
    if (imageUri) runPrediction(imageUri);
  }, [imageUri]);

  async function handleCapture() {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
    if (!photo) return;
    await runPrediction(photo.uri);
  }

  async function handleGallery() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 0.8,
    });
    if (result.canceled) return;
    await runPrediction(result.assets[0].uri);
  }

  async function runPrediction(uri: string) {
    setCapturedUri(uri);
    setStage("loading");
    setError(null);
    try {
      const pred = await classifyImage(uri);
      setPrediction(pred);
      setStage("result");
    } catch {
      setError("Could not reach the server. Check your connection.");
      setStage("camera");
    }
  }

  function reset() {
    setStage("camera");
    setCapturedUri(null);
    setPrediction(null);
    setError(null);
  }

  // Permission not yet determined
  if (!permission) return <View className="flex-1" style={{ backgroundColor: c.bg }} />;

  // Permission denied
  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center gap-4 px-8" style={{ backgroundColor: c.bg }}>
        <Ionicons name="camera-outline" size={56} color={c.mutedText} />
        <Text className="text-lg font-semibold text-center" style={{ color: c.text }}>
          Camera Access Required
        </Text>
        <Text className="text-sm text-center" style={{ color: c.mutedText }}>
          Allow camera access to scan campus buildings.
        </Text>
        <TouchableOpacity
          className="rounded-2xl py-4 px-8"
          style={{ backgroundColor: c.accent }}
          onPress={requestPermission}
        >
          <Text className="text-white font-bold">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (stage === "loading") return <LoadingScreen c={c} />;

  if (stage === "result" && capturedUri && prediction) {
    return <ResultScreen image={capturedUri} prediction={prediction} onRetry={reset} c={c} />;
  }

  // Camera view — overlays must be siblings of CameraView, not children
  return (
    <View className="flex-1 bg-black">
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />

      {/* Top hint */}
      <View className="absolute top-16 left-0 right-0 items-center">
        <View className="bg-black/40 rounded-full px-4 py-2">
          <Text className="text-white text-sm">Point at a campus building</Text>
        </View>
      </View>

      {/* Error toast */}
      {error && (
        <View className="absolute top-28 left-6 right-6 bg-red-500/90 rounded-xl px-4 py-3">
          <Text className="text-white text-sm text-center">{error}</Text>
        </View>
      )}

      {/* Bottom controls */}
      <View className="absolute bottom-12 left-0 right-0 flex-row items-center justify-center gap-12">
        {/* Gallery */}
        <TouchableOpacity
          className="w-12 h-12 rounded-full bg-white/20 items-center justify-center"
          onPress={handleGallery}
        >
          <Ionicons name="images-outline" size={22} color="white" />
        </TouchableOpacity>

        {/* Capture */}
        <TouchableOpacity
          className="w-20 h-20 rounded-full bg-white items-center justify-center"
          style={{ shadowColor: "#000", shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 }}
          onPress={handleCapture}
        >
          <View className="w-16 h-16 rounded-full border-4 border-gray-300" />
        </TouchableOpacity>

        {/* Spacer to balance layout */}
        <View className="w-12 h-12" />
      </View>
    </View>
  );
}
