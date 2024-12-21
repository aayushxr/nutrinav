import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth()

  if (isSignedIn) {
    return <Redirect href={'/'} />
  }
    return (
      <Stack screenOptions={{headerBackVisible: true}}>
        <Stack.Screen name="sign-in" options={{headerShown: false,headerBackVisible: true, headerTitle: "Sign In to NutriNAV"}} />
        <Stack.Screen name="sign-up" options={{headerShown: false}} />
      </Stack>
    );
  
}