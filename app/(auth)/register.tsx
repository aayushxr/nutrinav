import { ThemedView } from "@/components/ThemedView";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function SignUpScreen() {
    const user = useUser()
    const router = useRouter()

    useEffect(() => {
        if (!user) {
            router.replace('/sign-in')
        }
        fetch('https://mark.aayus.me/user', { method: "POST", 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: user.user?.id,
            })
        })
        router.replace('/')
    })

    return (
        <ThemedView>
        </ThemedView>
    );
    }