import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { Text, TextInput, Button, View, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import { useTheme } from '@react-navigation/native'
import { IconSymbol } from '@/components/ui/IconSymbol'

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()
  const theme = useTheme()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  // Handle the submission of the sign-in form
  const onSignInPress = React.useCallback(async () => {
    if (!isLoaded) return
    setLoading(true)

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      })

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.replace('/')
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    } finally {
      setLoading(false)
    }
  }, [isLoaded, emailAddress, password])

  const styles = StyleSheet.create({
    input: {
      marginBottom: 16,
      padding: 10,
      borderWidth: 1,
      borderColor: theme.dark ? "#52525b" : '#d4d4d8',
      backgroundColor: theme.dark ? "#333" : '#f0f0f0',
      color: theme.dark ? "#fff" : "#000",
      width: "100%",
      height: 50,
      fontSize: 16,
      borderRadius: 8,
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
    button3: {
      borderRadius: 8,
      width: '100%',
      display: 'flex',
      gap: 4,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      textAlign: 'center',
      backgroundColor: "#059669",
    opacity: 0.5   },
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

    account: {
      paddingTop: 16,
      display: 'flex',
      flexDirection: 'row',
      gap: 4,
      fontSize: 16,
    },
    title: {
      paddingTop: 32,
      fontSize: 38,
      fontWeight: 'bold',
      textAlign: 'left',
    },
    subtitle: {
      paddingTop: 4,
      paddingBottom: 16,
      fontSize: 16,
      fontWeight: '400',
      textAlign: 'left',
    },

  });

  return (
    <ThemedView style={{ paddingTop: 64, flex: 1, padding: 16 }}>
      <ThemedText style={styles.title}>Sign in</ThemedText>
      <ThemedText style={styles.subtitle}>
      Welcome back to NutriNAV, sign in to access your account.
      </ThemedText>

      <TextInput
        autoCapitalize="none"
        value={emailAddress}
        aria-disabled={loading}
        style={styles.input}
        placeholder="Enter email"
        onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
      />
      <TextInput
        value={password}
        style={styles.input}
        aria-disabled={loading}
        placeholder="Enter password"
        secureTextEntry={true}
        onChangeText={(password) => setPassword(password)}
      />
      <TouchableOpacity disabled={loading}  onPress={onSignInPress} style={loading ? styles.button3 :styles.button}>
        <ThemedText style={styles.btntext}>Sign in</ThemedText>
        <IconSymbol color={theme.dark ? "white" : "black"} name="arrow.right" size={16} />
      </TouchableOpacity>
      <ThemedView style={styles.account}>
        <ThemedText >Don't have an account?</ThemedText>
        <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <ThemedText style={styles.btntext}>Sign up</ThemedText>
          <IconSymbol color={theme.dark ? "white" : "black"} name="arrow.right" size={14} />

        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  )
}
