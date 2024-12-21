import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  useColorScheme,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Switch,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

const { width, height } = Dimensions.get("window");

export default function DetailsScreen() {
  interface Place {
    title: string;
    description: string;
    isEmpty: boolean;
    gallery_images: string[];
    banner_image: string;
    latlng: { latitude: number; longitude: number };
  }
  
  const { id } = useLocalSearchParams();
    const colorScheme = useColorScheme();
    const [place, setPlace] = useState<Place | undefined>(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [Edit, setEdit] = useState(false);
  const [status, setStatus] = useState(place?.isEmpty || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("https://mark.aayus.me/markers/" + id)
      .then((response) => response.json())
      .then((data) => setPlace(data))
      .catch((error) => console.error("Error fetching markers:", error))

  }, []);

  console.log(place);

  if (!place) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Place not found</ThemedText>
      </ThemedView>
    );
  }


  const openImage = (image: any) => {
    setSelectedImage(image);
  };


  const closeImage = () => {
    setSelectedImage(null);
  };


  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          title: place.title,
          // headerBackTitleVisible: true,
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />

      <Image source={{ uri: place.banner_image }} style={styles.bannerImage} />
      {place && <ThemedView style={styles.contentContainer}>
        <ThemedView style={styles.titleflex}>
          <ThemedView style={styles.titles}>
            <ThemedText style={styles.title}>{place.description}</ThemedText>
            <ThemedText style={styles.description}>
              {place.description}
            </ThemedText>
          </ThemedView>

          <ThemedText style={styles.empty}>
            {place.isEmpty ? "Empty" : "Not Empty"}
          </ThemedText>
        </ThemedView>
        <ThemedText style={styles.sectionTitle}>Gallery</ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.gallery}
        >
            {place.gallery_images?.map((image, index) => (
            <TouchableOpacity key={index} onPress={() => openImage(image)}>
              <Image source={{ uri: image }} style={styles.galleryImage} />
            </TouchableOpacity>
            ))}
        </ScrollView>

        <ThemedText style={styles.sectionTitle}>Location</ThemedText>
        <MapView
          style={styles.map}
          initialRegion={{
            ...place.latlng,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005
          }}
        >
          <Marker coordinate={place.latlng} />
        </MapView>
      </ThemedView>}
      <Modal
        visible={selectedImage !== null}
        transparent={true}
        onRequestClose={closeImage}
      >
        <SafeAreaView style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={closeImage}>
            <ThemedText style={styles.closeButtonText}>Close</ThemedText>
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
        </SafeAreaView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  titleflex: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  detailsButton: {
    backgroundColor: "#007AFF",
    margin: 16,
    marginTop: 32,
    marginBottom: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  detailsButtonText: {
    color: "white",
    fontWeight: "bold",
  },

  empty: {
    fontSize: 16,
    padding: 10,
    backgroundColor: "#007AFF",
    borderRadius: 10,
    height: 40,
    lineHeight: 24,
  },

  titles: {
    display: "flex",
    flexDirection: "column",
  },

  bannerImage: {
    width: "100%",
    height: 200,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },

  description: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },

  gallery: {
    flexDirection: "row",
    marginBottom: 20,
  },
  galleryImage: {
    width: 150,
    height: 150,
    marginRight: 10,
    borderRadius: 10,
  },
  map: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: width,
    height: height,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
  },
  closeButtonText: {
    color: "white",
    fontSize: 18,
  },

  editModal: {
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    padding: 15,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#gray',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
});