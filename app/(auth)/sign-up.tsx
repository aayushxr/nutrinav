import * as React from 'react'
import { Text, TextInput, Button, View, StyleSheet, TouchableOpacity } from 'react-native'
import { useSignUp } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import { useTheme } from '@react-navigation/native'
import { IconSymbol } from '@/components/ui/IconSymbol'

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()
  const theme = useTheme()

  const [emailAddress, setEmailAddress] = React.useState('')
  // const [name, setName] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [code, setCode] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return
    setLoading(true)
    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      })
      // await signUp.update({ firstName: name });


      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true)
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      alert("Invalid email or password")
      console.error(JSON.stringify(err, null, 2))
    } finally {
      setLoading(false)
    }
  }

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return
    setLoading(true)
    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      })

      
      
      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        // await signUp.update({ firstName: name });
        router.replace('/(auth)/register')
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2))
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      alert("Invalid code")
      console.error(JSON.stringify(err, null, 2))
    } finally {
      setLoading(false)
    }
  }

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
      opacity: 0.5
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


  if (pendingVerification) {
    return (
      <>

        <ThemedView style={{ paddingTop: 64, flex: 1, padding: 16 }}>
      <ThemedText style={styles.title}>Verify</ThemedText>
      <ThemedText style={styles.subtitle}>
        Verify your email address to complete the sign up process.
      </ThemedText>
      <TextInput
style={styles.input}
        value={code}
        aria-disabled={loading}
        keyboardType='number-pad'
        onChangeText={(code) => setCode(code)}
        placeholder="Enter your verification code"

      />
      <TouchableOpacity disabled={loading}  onPress={onVerifyPress} style={loading ? styles.button3 :styles.button}>
        <ThemedText style={styles.btntext}>Verify</ThemedText>
        <IconSymbol color={theme.dark ? "white" : "black"} name="arrow.right" size={16} />
      </TouchableOpacity>    
      </ThemedView>
      </>
    )
  }

  return (
    <ThemedView style={{ paddingTop: 64, flex: 1, padding: 16 }}>
      <ThemedText style={styles.title}>Sign up</ThemedText>
      <ThemedText style={styles.subtitle}>
        Create an account to access all the features of NutriNAV.
      </ThemedText>
      {/* <TextInput
        autoCapitalize="none"
        style={styles.input}
        aria-disabled={loading}
        value={name}
        placeholder="Enter your Name"
        onChangeText={(name) => setName(name)}
      /> */}
      <TextInput
        autoCapitalize="none"
        style={styles.input}
        value={emailAddress}
        aria-disabled={loading}
        placeholder="Enter email"
        onChangeText={(email) => setEmailAddress(email)}
      />
      <TextInput
        value={password}
        style={styles.input}
        aria-disabled={loading}
        placeholder="Enter password"
        secureTextEntry={true}
        onChangeText={(password) => setPassword(password)}
      />
      <TouchableOpacity disabled={loading}  onPress={onSignUpPress} style={loading ? styles.button3 :styles.button}>
        <ThemedText style={styles.btntext}>Continue</ThemedText>
        <IconSymbol color={theme.dark ? "white" : "black"} name="arrow.right" size={16} />
      </TouchableOpacity>    
      <ThemedView style={styles.account}>
              <ThemedText >Already have an account?</ThemedText>
              <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <ThemedText style={styles.btntext}>Sign in</ThemedText>
                <IconSymbol color={theme.dark ? "white" : "black"} name="arrow.right" size={14} />
      
              </TouchableOpacity>
            </ThemedView>
      </ThemedView>
  )
}