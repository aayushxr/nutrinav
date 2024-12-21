import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import { ThemedView } from "@/components/ThemedView";
import { Link, router, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { useNavigation, useTheme } from "@react-navigation/native";
import { useEffect, useState, useRef } from "react";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const initialRegion = {
  latitude: 25.28768,
  longitude: 51.52927,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

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

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fetch("https://mark.aayus.me/markers")
      .then((response) => response.json())
      .then((data) => setMarkers(data))
      .catch((error) => console.error("Error fetching markers:", error))
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleCalloutPress = (marker: any) => {
    router.push(`/details/${marker.id}`);
  };

  const styles = StyleSheet.create({
    // container: {
    //   flex: 1,
    //   backgroundColor: "#fff",
    //   alignItems: "center",
    //   justifyContent: "center",
    // },
    map: {
      width: Dimensions.get("window").width,
      height: Dimensions.get("window").height,
      // borderRadius: 10,
      // margin:10 // Reduce the height to accommodate the top bar
    },
    headerContainer: {
      paddingTop: 48,
      paddingBottom: 16,
      paddingLeft: 16,
      height: "auto",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
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
  
    headerText: {
      paddingTop: 16,
      lineHeight: 48,
      fontSize: 45,
      fontWeight: 800,
    },
    calloutContainer: {
      borderRadius: 12,
      padding: 10,
      marginBottom: 10,
      width: 200,
    },
    calloutTitle: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 5,
    },
    calloutDescription: {
      fontSize: 14,
      marginBottom: 5,
    },
    detailsButton: {
      backgroundColor: "#007AFF",
      padding: 5,
      borderRadius: 5,
      marginTop: 12,
      alignItems: "center",
    },
    detailsButtonText: {
      color: "white",
      textAlign: "center",
      fontSize: 14,
    },
  });

  console.log(markers);
  return (
    <ThemedView >
      {!isLoading && <MapView style={styles.map} initialRegion={initialRegion}>
        {markers.map((marker, index) => (
          <Marker key={index} coordinate={marker.latlng}>
            <Callout tooltip>
              <ThemedView style={styles.calloutContainer}>
                <ThemedText style={styles.calloutTitle}>{marker.title}</ThemedText>
                <ThemedText style={styles.calloutDescription}>
                  {marker.description}
                </ThemedText>
                <ThemedText style={marker.isEmpty ? styles.cardSubtitleEmpty : styles.cardSubtitle}>{marker.isEmpty ? "Empty" : "Unempty"}</ThemedText>

                <TouchableOpacity onPress={() => router.replace(`/details/${marker.id}`)} style={styles.detailsButton}>
                 
                    <ThemedText style={styles.detailsButtonText}>More Details</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </Callout>
          </Marker>
        ))}
      </MapView>}
    </ThemedView>
  );
}

