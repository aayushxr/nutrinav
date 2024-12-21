import { StyleSheet, Image, Platform, FlatList, TouchableOpacity } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

interface Marker {
  id: string;
  title: string;
  description: string;
  latlng: {
    latitude: number;
    longitude: number;
  }
  isEmpty: boolean;
}


export default function TabTwoScreen() {
  const theme = useTheme();
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter()
  useEffect(() => {
    fetch("https://mark.aayus.me/markers")
      .then((response) => response.json())
      .then((data) => setMarkers(data))
      .catch((error) => console.error("Error fetching markers:", error))
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const styles = StyleSheet.create({
    titleContainer: {
      flexDirection: 'column',
      paddingTop: 32,
      height: '100%',
      padding: 16,
      gap: 8,
    },
    title: {
      paddingTop: 64,
      fontSize: 48,
      fontWeight: 'bold',
      textAlign: 'left',
    },
    card: {
      padding: 16,
      borderRadius: 8,
      backgroundColor: theme.dark ? '#333' : '#f0f0f0',
      width: '48%',
      marginBottom: 16,
    },
    numcard: {
      padding: 16,
      borderRadius: 12,
      backgroundColor: '#f0f0f0',
      width: '100%',
      marginBottom: 16,
    },
    numtext: {
      fontSize: 38,
      paddingTop: 10,
      fontWeight: '800',
    },
    subtext: {
      fontSize: 16,
      fontWeight: '400',
    },
    signin: {
      padding: 48,
      display: 'flex',
      gap: 16,
      height: '70%',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    signin2: {
      display: 'flex',
      gap: 16,
      width: '70%',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    signintext: {
      fontSize: 24,
      fontWeight: '600',
      textAlign: 'center',
    },
    button: {
      borderRadius: 8,
      width: '100%',
      display: 'flex',
      gap: 4,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      textAlign: 'center',
      backgroundColor: "#059669"
    },
    button2: {
      borderRadius: 8,
      width: '100%',
      display: 'flex',
      gap: 4,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      backgroundColor: "#065f46"
    },
    btntext: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    listContainer: {
      padding: 16,
    },
    crd: {
      flexDirection: "row",
      overflow: "hidden",
      marginBottom: 16,
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    cardImage: {
      width: 100,
      borderRadius: 10,
      height: 100,
    },
    cardContent: {
      flex: 1,
      justifyContent: "center",
      padding: 16,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "700",
    },
    cardSubtitle: {
      fontSize: 12,
      backgroundColor: theme.dark ? "#064e3b" : "#6ee7b7",
      borderRadius: 8,
      color: theme.dark ? "#6ee7b7" : "064e3b",
      width: 80,
      textAlign: "center",
      marginTop: 6,
    },
    cardSubtitleEmpty: {
      fontSize: 12,
      backgroundColor: theme.dark ? "#7f1d1d" : "#fca5a5",
      borderRadius: 8,
      color: theme.dark ? "#fca5a5" : "#7f1d1d",
      width: 80,
      textAlign: "center",
      marginTop: 6,
    },
    detailsButton: {
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 16,
    },
    detailsButtonText: {
      color: "white",
      fontWeight: "bold",
    },
  });

  const renderItem = ({ item }: any) => (
    <ThemedView style={styles.crd}>
      <Image source={{ uri: item.banner_image }} style={styles.cardImage} />
      <ThemedView style={styles.cardContent}>
        <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
        <ThemedText style={item.isEmpty ? styles.cardSubtitleEmpty : styles.cardSubtitle}>{item.isEmpty ? "Empty" : "Unempty"}</ThemedText>
      </ThemedView>
      <TouchableOpacity onPress={() => router.push(`/details/${item.id}`,)} style={styles.detailsButton}>
        <IconSymbol color={theme.dark ? "white" : "black"} name="arrow.right" size={24} />
      </TouchableOpacity>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.titleContainer}>
      <ThemedText style={styles.title}>Explore</ThemedText>

      {isLoading && <ThemedText>Loading...</ThemedText>}
      {!isLoading &&
        <FlatList
          data={markers}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
