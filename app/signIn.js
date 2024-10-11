import { View, Text, StatusBar, Image, TextInput, TouchableOpacity, Pressable, Alert } from 'react-native'
import React, { useState } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Entypo from '@expo/vector-icons/Entypo';
import { useRouter } from 'expo-router';
import Loading from '../components/Loading';
import CustomKeyboardView from '../components/CustomKeyboardView';
import { useAuth } from '../context/authContext';


export default function SignIn() {

    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const { login } = useAuth();
    // ฟังก์ชันตรวจสอบอีเมล
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    const handleLogin = async () => {
        // ตรวจสอบว่าทุกฟิลด์ถูกกรอกครบถ้วนหรือไม่
        if (!email || !password) {
            Alert.alert('Sign In', "Please fill all the fields!")
            return;
        }

        // ตรวจสอบรูปแบบอีเมล
        if (!validateEmail(email)) {
            Alert.alert('Sign In', "Invalid email format!")
            return;
        }


        setLoading(true);

        let response = await login(email, password)

        setLoading(false);

        // console.log('====================================');
        // console.log("got result", response);

        if (!response.success) {
            Alert.alert('Sign In', response.msg)
            return;
        }
    }

    return (
        <CustomKeyboardView>
            <StatusBar style='dark' />
            <View style={{ paddingHorizontal: wp(4) }} className='flex-1 '>
                <View className='gap-10'>
                    <View className=' items-center '>
                        <Image style={{ height: hp(50), width: wp(50) }} resizeMode='contain' source={require('../assets/images/logo.png')} />
                    </View>

                    <View className='gap-4 mt-[-150px]'>
                        <Text style={{ fontSize: hp(4) }} className='font-bold tracking-wider text-center text-neutral-800'> Sign In </Text>
                        <View style={{ height: hp(7) }} className='flex-row gap-4 px-4 bg-neutral-100 items-center rounded-2xl'>
                            <Entypo name="mail" size={hp(2.7)} color="gray" />
                            <TextInput
                                onChangeText={value => setEmail(value)}
                                style={{ fontSize: hp(2) }}
                                className='flex-1 font-semibold text-neutral-700'
                                placeholder='Email address'
                                placeholderTextColor={'gray'}
                                keyboardType='email-address'
                                autoCapitalize='none'
                            />
                        </View>
                        <View className='gap-3'>
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
                            <Text style={{ fontSize: hp(1.8) }} className=" font-semibold text-right text-neutral-500 ">Forgot Password</Text>
                        </View>


                        {/* submit button */}

                        <View>
                            {loading ? (
                                <View className='flex-row justify-center'>
                                    <Loading size={hp(15)} />
                                </View>
                            ) : (<TouchableOpacity onPress={handleLogin} style={{ height: hp(7) }} className='bg-indigo-500 rounded-xl justify-center items-center'>
                                <Text style={{ fontSize: hp(2.7) }} className='text-white font-bold tracking-wider'>
                                    Sign In
                                </Text>
                            </TouchableOpacity>)
                            }
                        </View>

                        <View className='flex-row justify-center gap-2'>
                            <Text style={{ fontSize: hp(1.8) }} className='text-neutral-500 font-semibold '>
                                Don't have an account?
                            </Text>
                            <Pressable onPress={() => router.push('signUp')}>
                                <Text style={{ fontSize: hp(1.8) }} className='text-indigo-500 font-semibold '>
                                    Sign Up
                                </Text>
                            </Pressable>

                        </View>


                    </View>
                </View>
            </View>
        </CustomKeyboardView>
    )
}
