import { View, Text, StatusBar, Image, TextInput, TouchableOpacity, Pressable, Alert } from 'react-native'
import React, { useRef, useState } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import { useRouter } from 'expo-router';
import Loading from '../components/Loading';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import CustomKeyboardView from '../components/CustomKeyboardView';
import { useAuth } from '../context/authContext';

export default function SignUP() {

    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [confirmpassword, setConfirmPassword] = useState('')

    const { register } = useAuth()

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    const handleRegister = async () => {

        if (!email || !password || !username || !confirmpassword) {
            Alert.alert('Sign Up', "Please fill all the fields!")
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert('Sign Up', "Invalid email format!")
            return;
        }

        if (password !== confirmpassword) {
            Alert.alert('Sign Up', "Passwords do not match!")
            return;
        }

        setLoading(true);
        let response = await register(email, password, username)
        setLoading(false);
        if (!response.success) {
            Alert.alert('Sign Up', response.msg)
            return;
        }

    }

    return (
        <CustomKeyboardView>
            <StatusBar style='dark' />
            <View style={{ paddingHorizontal: wp(4) }} className='flex-1 gap-12'>
                <View className='gap-10'>
                    <View className='items-center'>
                        <Image style={{ height: hp(50), width: wp(50) }} resizeMode='contain' source={require('../assets/images/logo.png')} />
                    </View>

                    <View className='gap-4 mt-[-150px]'>
                        <Text style={{ fontSize: hp(4) }} className='font-bold tracking-wider text-center text-neutral-800'> Sign UP </Text>

                        <View style={{ height: hp(7) }} className='flex-row gap-4 px-4 bg-neutral-100 items-center rounded-2xl'>
                            <FontAwesome5 name="user-alt" size={hp(2.5)} color="gray" />
                            <TextInput
                                onChangeText={value => setUsername(value)}
                                style={{ fontSize: hp(2) }}
                                className='flex-1 font-semibold text-neutral-700'
                                placeholder='Username'
                                placeholderTextColor={'gray'}
                            />
                        </View>

                        <View style={{ height: hp(7) }} className='flex-row gap-4 px-4 bg-neutral-100 items-center rounded-2xl'>
                            <Entypo name="mail" size={hp(2.7)} color="gray" />
                            <TextInput
                                onChangeText={value => setEmail(value)}
                                style={{ fontSize: hp(2) }}
                                className='flex-1 font-semibold text-neutral-700'
                                placeholder='Email address'
                                placeholderTextColor={'gray'}
                            />
                        </View>

                        <View style={{ height: hp(7) }} className='flex-row gap-4 px-4 bg-neutral-100 items-center rounded-2xl'>
                            <Entypo name="key" size={hp(2.7)} color="gray" />
                            <TextInput
                                onChangeText={value => setPassword(value)}
                                style={{ fontSize: hp(2) }}
                                className='flex-1 font-semibold text-neutral-700'
                                placeholder='Password'
                                secureTextEntry
                                placeholderTextColor={'gray'}
                            />
                        </View>

                        <View style={{ height: hp(7) }} className='flex-row gap-4 px-4 bg-neutral-100 items-center rounded-2xl'>
                            <Entypo name="key" size={hp(2.7)} color="gray" />
                            <TextInput
                                onChangeText={value => setConfirmPassword(value)}
                                style={{ fontSize: hp(2) }}
                                className='flex-1 font-semibold text-neutral-700'
                                placeholder='Confirm Password'
                                secureTextEntry
                                placeholderTextColor={'gray'}
                            />
                        </View>

                        <View>
                            {loading ? (
                                <View className='flex-row justify-center'>
                                    <Loading size={hp(15)} />
                                </View>
                            ) : (
                                <TouchableOpacity onPress={handleRegister} style={{ height: hp(7) }} className='bg-indigo-500 rounded-xl justify-center items-center'>
                                    <Text style={{ fontSize: hp(2.7) }} className='text-white font-bold tracking-wider'>
                                        Sign Up
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View className='flex-row justify-center gap-2'>
                            <Text style={{ fontSize: hp(1.8) }} className='text-neutral-500 font-semibold '>
                                Already have an account?
                            </Text>
                            <Pressable onPress={() => router.push('signIn')}>
                                <Text style={{ fontSize: hp(1.8) }} className='text-indigo-500 font-semibold '>
                                    Sign In
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        </CustomKeyboardView>
    )
}
