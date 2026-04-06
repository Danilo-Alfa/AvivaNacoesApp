import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Image } from 'expo-image';
import { Play } from 'lucide-react-native';

interface YouTubePlayerProps {
  videoId: string;
  height?: number;
}

export const YouTubePlayer = React.memo(function YouTubePlayer({ videoId, height = 220 }: YouTubePlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  const onStateChange = useCallback((state: string) => {
    if (state === 'ended') {
      setPlaying(false);
    }
  }, []);

  if (!playing) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => { setPlaying(true); setLoading(true); }}
        className="w-full bg-black items-center justify-center"
        style={{ height }}
      >
        <Image
          source={{ uri: thumbnailUrl }}
          style={{ width: '100%', height: '100%', position: 'absolute' }}
          contentFit="cover"
          cachePolicy="disk"
        />
        <View className="absolute inset-0 bg-black/30 items-center justify-center">
          <View className="w-16 h-16 bg-red-600 rounded-full items-center justify-center">
            <Play size={32} color="#ffffff" fill="#ffffff" />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={{ height }}>
      {loading && (
        <View className="absolute inset-0 items-center justify-center bg-black z-10">
          <ActivityIndicator color="#ffffff" size="large" />
        </View>
      )}
      <YoutubePlayer
        height={height}
        videoId={videoId}
        play={playing}
        onChangeState={onStateChange}
        onReady={() => setLoading(false)}
        webViewProps={{
          allowsInlineMediaPlayback: true,
        }}
      />
    </View>
  );
});
