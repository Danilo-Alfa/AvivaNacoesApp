import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  FlatList,
  View,
  Text,
  useWindowDimensions,
  StyleSheet,
  ViewToken,
} from 'react-native';
import { Image } from 'expo-image';

const DIAS_SEMANA = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

function formatarDataEvento(dataStr: string): string {
  const [ano, mes, dia] = dataStr.split('-').map(Number);
  const date = new Date(ano, mes - 1, dia);
  const diaSemana = DIAS_SEMANA[date.getDay()];
  return `${diaSemana} (${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')})`;
}

interface CarouselPhoto {
  id: string;
  url_imagem: string;
  titulo: string | null;
  data_evento: string | null;
}

interface PhotoCarouselProps {
  photos: CarouselPhoto[];
  autoPlayInterval?: number;
  colors: Record<string, string>;
}

export const PhotoCarousel = React.memo(function PhotoCarousel({
  photos,
  autoPlayInterval = 4000,
  colors,
}: PhotoCarouselProps) {
  const { width } = useWindowDimensions();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isUserScrolling = useRef(false);
  const autoPlayTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const itemWidth = width - 32;

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const startAutoPlay = useCallback(() => {
    if (autoPlayTimer.current) clearInterval(autoPlayTimer.current);
    autoPlayTimer.current = setInterval(() => {
      if (isUserScrolling.current) return;
      setCurrentIndex((prev) => {
        const next = (prev + 1) % photos.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, autoPlayInterval);
  }, [photos.length, autoPlayInterval]);

  useEffect(() => {
    if (photos.length > 1) startAutoPlay();
    return () => {
      if (autoPlayTimer.current) clearInterval(autoPlayTimer.current);
    };
  }, [startAutoPlay, photos.length]);

  const onScrollBeginDrag = useCallback(() => {
    isUserScrolling.current = true;
  }, []);

  const onMomentumScrollEnd = useCallback(() => {
    isUserScrolling.current = false;
    startAutoPlay();
  }, [startAutoPlay]);

  const renderItem = useCallback(
    ({ item }: { item: CarouselPhoto }) => {
      const hasCaption = item.titulo || item.data_evento;
      return (
        <View style={{ width: itemWidth }}>
          <View style={{ position: 'relative' }}>
            <Image
              source={{ uri: item.url_imagem }}
              style={{ width: '100%', aspectRatio: 16 / 9, borderRadius: 16 }}
              contentFit="cover"
              cachePolicy="disk"
              recyclingKey={item.id}
            />
            {hasCaption && (
              <View style={styles.captionWrapper}>
                <View style={[styles.captionCard, { backgroundColor: colors.bg + 'E6' }]}>
                  {item.titulo && (
                    <Text style={[styles.captionTitle, { color: colors.foreground }]}>
                      {item.titulo}
                    </Text>
                  )}
                  {item.data_evento && (
                    <Text style={[styles.captionDate, { color: colors.muted }]}>
                      {formatarDataEvento(item.data_evento)}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>
      );
    },
    [itemWidth, colors]
  );

  const keyExtractor = useCallback((item: CarouselPhoto) => item.id, []);

  const onScrollToIndexFailed = useCallback(
    (info: { index: number; averageItemLength: number }) => {
      flatListRef.current?.scrollToOffset({
        offset: info.averageItemLength * info.index,
        animated: true,
      });
    },
    []
  );

  if (photos.length === 0) return null;

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={photos}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScrollBeginDrag={onScrollBeginDrag}
        onMomentumScrollEnd={onMomentumScrollEnd}
        snapToInterval={itemWidth}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          length: itemWidth,
          offset: itemWidth * index,
          index,
        })}
        onScrollToIndexFailed={onScrollToIndexFailed}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
        contentContainerStyle={{ paddingHorizontal: 0 }}
      />
      {photos.length > 1 && (
        <View style={styles.dotContainer}>
          {photos.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === currentIndex ? colors.primary : colors.muted,
                  opacity: i === currentIndex ? 1 : 0.4,
                  width: i === currentIndex ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  captionWrapper: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captionCard: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  captionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  captionDate: {
    fontSize: 12,
    marginTop: 2,
  },
});
