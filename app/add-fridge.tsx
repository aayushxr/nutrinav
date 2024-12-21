import { useSignIn, useUser } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { Text, TextInput, Button, View, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import { useTheme } from '@react-navigation/native'
import { IconSymbol } from '@/components/ui/IconSymbol'

export default function Page() {
  const router = useRouter()
  const theme = useTheme()
  const user = useUser()

  const [name, setName] = React.useState('')
  const [link, setLink] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const onSubmitPress = React.useCallback(async () => {
    setLoading(true)

    try {
     fetch ('https://mark.aayus.me/requests', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            'userID': user.user?.id || '',
         },
         body: JSON.stringify({
            title: name,
            description: link,
         })

      })
        router.replace('/') 
    } catch (err) {

      console.error(JSON.stringify(err, null, 2))
    } finally {
      setLoading(false)
    }
  }, [ name, link])

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
      <ThemedText style={styles.title}>Submit</ThemedText>
      <ThemedText style={styles.subtitle}>
      Found a Community Fridge? Fill this form and we will add add it to our site after a thorough review.
      </ThemedText>

      <TextInput
        autoCapitalize="none"
        value={name}
        aria-disabled={loading}
        style={styles.input}
        placeholder="Enter Name"
        onChangeText={(name) => setName(name)}
      />
      <TextInput
        value={link}
        style={styles.input}
        aria-disabled={loading}
        placeholder="Enter Google Maps Link"
        onChangeText={(link) => setLink(link)}
      />
      <TouchableOpacity disabled={loading}  onPress={onSubmitPress} style={loading ? styles.button3 :styles.button}>
        <ThemedText style={styles.btntext}>Submit</ThemedText>
        <IconSymbol color={theme.dark ? "white" : "black"} name="arrow.right" size={16} />
      </TouchableOpacity>
      
    </ThemedView>
  )
}
