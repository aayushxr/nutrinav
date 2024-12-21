import { Image, StyleSheet, Platform, Button, TouchableOpacity } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SignedIn, SignedOut, useClerk, useUser } from '@clerk/clerk-expo';
import { Link, router } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/ui/IconSymbol';

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
  const { user } = useUser()
  const { signOut } = useClerk()
  const theme = useTheme()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

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
    }
  });

  return (

    <ThemedView style={styles.titleContainer}>
      <ThemedText style={styles.title} type="title">Welcome!</ThemedText>
      <SignedIn>
        <ThemedView style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <ThemedView style={styles.card}>
            <ThemedText style={styles.numtext}>0 </ThemedText>
            <ThemedText style={styles.subtext}>Submitted Contributions </ThemedText>
          </ThemedView>
          <ThemedView style={styles.card}>
            <ThemedText style={styles.numtext}>0 </ThemedText>
            <ThemedText style={styles.subtext}>Accepted Submissions </ThemedText>
          </ThemedView>
        </ThemedView>
        <ThemedText style={styles.subtext}>You are signed in as {user?.emailAddresses[0].emailAddress}</ThemedText>
        <ThemedText style={styles.subtext}>Thanks for helping out the community!</ThemedText>
        <ThemedView style={{paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12}}>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/add-fridge')}>
          <ThemedText style={styles.btntext}>Found a Community Fridge?</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button2} onPress={handleSignOut}>
          <ThemedText style={styles.btntext}>Sign Out</ThemedText>
        </TouchableOpacity>
        </ThemedView>
      </SignedIn>

      <SignedOut>
        <ThemedView style={styles.signin}>
          <ThemedText style={styles.signintext}>Sign in or sign up to start contributing to the community!</ThemedText>
          <ThemedView style={styles.signin2}>
            <TouchableOpacity style={styles.button} onPress={() => router.push('/sign-in')}>
              <ThemedText style={styles.btntext}>Sign in</ThemedText>
              <IconSymbol color={theme.dark? "white": "black"} name="arrow.right" size={16} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.button2} onPress={() => router.push('/sign-up')}>
              <ThemedText style={styles.btntext}>Sign up</ThemedText>
              <IconSymbol color={theme.dark? "white": "black"} name="arrow.right" size={16} />
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </SignedOut>
    </ThemedView>
  );
}

