import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Modal,
  GestureResponderEvent,
} from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";
import { Radio, Play, Pause, X, Volume2, VolumeX, MessageCircle } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Linking from "expo-linking";
import { useTheme } from "@/hooks/useTheme";

const STREAM_URL = "https://cast4.hoost.com.br:8207/stream";
const WHATSAPP_NUMBER = "5511930008592";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Olá! Estou ouvindo a Rádio Aviva! 📻")}`;


export function LiveFAB({ hidden = false }: { hidden?: boolean }) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [isMinimized, setIsMinimized] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fabAnim = useRef(new Animated.Value(hidden ? 0 : 1)).current;
  const sliderWidth = useRef(0);

  // Fade in/out when hidden changes
  useEffect(() => {
    Animated.spring(fabAnim, {
      toValue: hidden ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [hidden]);

  useEffect(() => {
    if (isPlaying) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isPlaying]);

  // Sync volume with sound
  useEffect(() => {
    if (soundRef.current) {
      const vol = isMuted ? 0 : volume;
      soundRef.current.setVolumeAsync(vol).catch(() => {});
    }
  }, [volume, isMuted]);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      if (status.isPlaying) {
        setIsPlaying(true);
        setIsLoading(false);
      }
      if (status.didJustFinish) {
        setIsPlaying(false);
      }
    } else if (status.error) {
      setIsPlaying(false);
      setIsLoading(false);
    }
  }, []);

  const togglePlay = useCallback(async () => {
    if (isLoading) return;

    if (isPlaying) {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
        });
        const { sound } = await Audio.Sound.createAsync(
          { uri: STREAM_URL },
          { shouldPlay: true, volume: isMuted ? 0 : volume }
        );
        soundRef.current = sound;
        sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      } catch (error) {
        console.error("Erro ao reproduzir áudio:", error);
        setIsLoading(false);
      }
    }
  }, [isPlaying, isLoading, volume, isMuted, onPlaybackStatusUpdate]);

  const toggleMute = useCallback(() => {
    setIsMuted((m) => !m);
  }, []);

  const handleSliderTouch = useCallback(
    (e: GestureResponderEvent) => {
      if (sliderWidth.current <= 0) return;
      const x = e.nativeEvent.locationX;
      const newVol = Math.max(0, Math.min(1, x / sliderWidth.current));
      setVolume(newVol);
      if (newVol > 0 && isMuted) setIsMuted(false);
    },
    [isMuted]
  );

  const primary = isDark ? "#367EE2" : "#123E7D";
  const cardBg = isDark ? "#171D26" : "#FFFFFF";
  const fg = isDark ? "#FAFAFA" : "#1D2530";
  const muted_ = isDark ? "#9DA4AF" : "#627084";
  const border = isDark ? "#29313D" : "#E2E5E9";
  const secBg = isDark ? "#252C37" : "#F3F5F6";
  const sliderBg = isDark ? "#252C37" : "#E2E5E9";
  const fabBottom = Math.max(insets.bottom, 16) + 24;
  const displayVol = isMuted ? 0 : volume;

  // ── Minimized: floating circle ──
  if (isMinimized) {
    return (
      <Animated.View
        pointerEvents={hidden ? "none" : "auto"}
        style={{
          position: "absolute",
          right: 20,
          bottom: fabBottom,
          opacity: fabAnim,
          transform: [{ scale: fabAnim }],
        }}
      >
        <Pressable
          onPress={() => setIsMinimized(false)}
          style={[styles.fab, { backgroundColor: primary }]}
        >
          <Radio size={24} color="#ffffff" />
          {isPlaying && (
            <View style={styles.liveDot}>
              <Animated.View
                style={[styles.dotInner, { opacity: pulseAnim }]}
              />
            </View>
          )}
        </Pressable>
      </Animated.View>
    );
  }

  // ── Expanded: Modal player ──
  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={() => setIsMinimized(true)}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <Pressable
          style={styles.backdrop}
          onPress={() => setIsMinimized(true)}
        />

        <View style={{ marginHorizontal: 16, marginBottom: fabBottom }}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: cardBg,
                borderColor: border,
              },
            ]}
          >
            <View style={[styles.accent, { backgroundColor: primary }]} />

            <View style={styles.body}>
              {/* Header */}
              <View style={styles.row}>
                <View style={styles.headerLeft}>
                  <View style={[styles.iconBox, { backgroundColor: primary }]}>
                    <Radio size={20} color="#fff" />
                    {isPlaying && (
                      <View style={styles.liveDotSm}>
                        <Animated.View
                          style={[styles.dotInnerSm, { opacity: pulseAnim }]}
                        />
                      </View>
                    )}
                  </View>
                  <View>
                    <Text style={[styles.title, { color: fg }]}>
                      Rádio Aviva
                    </Text>
                    {isPlaying ? (
                      <View style={styles.liveRow}>
                        <Animated.View
                          style={[styles.liveCircle, { opacity: pulseAnim }]}
                        />
                        <Text style={styles.liveLabel}>AO VIVO</Text>
                      </View>
                    ) : (
                      <Text style={[styles.sub, { color: muted_ }]}>
                        Toque para ouvir
                      </Text>
                    )}
                  </View>
                </View>
                <Pressable
                  onPress={() => setIsMinimized(true)}
                  style={[styles.closeBtn, { backgroundColor: secBg }]}
                >
                  <X size={16} color={muted_} />
                </Pressable>
              </View>

              {/* Waves */}
              {isPlaying && (
                <View style={styles.waves}>
                  {Array.from({ length: 16 }).map((_, i) => (
                    <WaveBar key={i} index={i} color={primary} />
                  ))}
                </View>
              )}

              {/* Controls: Play + Volume */}
              <View style={styles.controls}>
                {/* Play / Pause */}
                <Pressable
                  onPress={togglePlay}
                  disabled={isLoading}
                  style={[
                    styles.playBtn,
                    { backgroundColor: primary },
                    isLoading && { opacity: 0.5 },
                  ]}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : isPlaying ? (
                    <Pause size={24} color="#fff" />
                  ) : (
                    <Play size={24} color="#fff" style={{ marginLeft: 2 }} />
                  )}
                </Pressable>

                {/* Volume */}
                <View style={styles.volumeRow}>
                  <Pressable onPress={toggleMute} style={[styles.muteBtn, { backgroundColor: secBg }]}>
                    {isMuted || volume === 0 ? (
                      <VolumeX size={18} color={muted_} />
                    ) : (
                      <Volume2 size={18} color={muted_} />
                    )}
                  </Pressable>

                  {/* Slider */}
                  <View
                    style={[styles.sliderTrack, { backgroundColor: sliderBg }]}
                    onLayout={(e) => {
                      sliderWidth.current = e.nativeEvent.layout.width;
                    }}
                    onStartShouldSetResponder={() => true}
                    onMoveShouldSetResponder={() => true}
                    onResponderGrant={handleSliderTouch}
                    onResponderMove={handleSliderTouch}
                  >
                    <View
                      style={[
                        styles.sliderFill,
                        {
                          backgroundColor: primary,
                          width: `${displayVol * 100}%`,
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.sliderThumb,
                        {
                          backgroundColor: primary,
                          left: `${displayVol * 100}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* WhatsApp Button */}
          <View style={styles.whatsappBtn}>
            <Pressable
              onPress={() => Linking.openURL(WHATSAPP_URL)}
              style={styles.whatsappInner}
            >
              <MessageCircle size={18} color="#ffffff" />
              <Text style={styles.whatsappText}>Enviar mensagem para a Web Rádio</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* ── WaveBar ─────────────────────────────────────────────── */

function WaveBar({ index, color }: { index: number; color: string }) {
  const h = useRef(new Animated.Value(6)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(h, {
          toValue: 20 + Math.random() * 8,
          duration: 350 + Math.random() * 200,
          useNativeDriver: false,
        }),
        Animated.timing(h, {
          toValue: 4 + Math.random() * 6,
          duration: 350 + Math.random() * 200,
          useNativeDriver: false,
        }),
      ])
    );
    const t = setTimeout(() => loop.start(), index * 60);
    return () => {
      clearTimeout(t);
      loop.stop();
    };
  }, []);

  return (
    <Animated.View
      style={{ width: 3, borderRadius: 2, backgroundColor: color, height: h }}
    />
  );
}

/* ── Styles ──────────────────────────────────────────────── */

const styles = StyleSheet.create({
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  liveDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  dotInner: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#fff",
  },

  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  accent: { height: 3, width: "100%" },
  body: { padding: 16 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  liveDotSm: {
    position: "absolute",
    bottom: -3,
    right: -3,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#ef4444",
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  dotInnerSm: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#fff",
  },
  title: { fontSize: 14, fontWeight: "600" },
  sub: { fontSize: 12 },
  liveRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  liveCircle: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ef4444",
  },
  liveLabel: { fontSize: 12, fontWeight: "600", color: "#ef4444" },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  waves: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 3,
    height: 32,
    marginBottom: 16,
  },

  /* Controls row */
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  /* Volume */
  volumeRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  muteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sliderTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    justifyContent: "center",
  },
  sliderFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 4,
  },
  sliderThumb: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: -8,
    top: -4,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },

  whatsappBtn: {
    backgroundColor: "#25D366",
    borderRadius: 12,
    marginTop: 10,
    elevation: 6,
    shadowColor: "#25D366",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  whatsappInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  whatsappText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});
