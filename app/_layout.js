import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { Slot, useSegments, useRouter } from "expo-router";
import "../global.css"
import { AuthContextProvider, useAuth } from '../context/authContext';

const MainLayout = () => {
    const { isAuthenticated } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        // check if user is authenticated or not
        if (typeof isAuthenticated == "undefined") return;
        const inApp = segments[0] == '(app)';
        if (isAuthenticated && !inApp) {
            //redirect to Home!
            router.replace('Home')
        } else if (isAuthenticated == false) {
            //redirect to Signin!
            router.replace('signIn')
        }


    }, [isAuthenticated])


    return <Slot />
}

export default function RootLayout() {
    return (
        <AuthContextProvider>
            <MainLayout />
        </AuthContextProvider>
    )
}
