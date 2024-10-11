import { View, Text } from 'react-native';
import React from 'react';
import { Stack } from 'expo-router';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import Home from './Home';
import Mylist from './Mylist';
import Explore from './Explore';
import Profile from './Profile';
import Search from '../../components/Search';
import DetailsAndPlay from '../../components/DetailsAndPlay';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SeeAll from '../../components/SeeAll';

const Tab = createBottomTabNavigator();
const NativeStack = createNativeStackNavigator();

function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'My list') {
                        iconName = focused ? 'bookmarks' : 'bookmarks-outline';
                    } else if (route.name === 'Explore') {
                        iconName = focused ? 'compass' : 'compass-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Icon name={iconName} size={size} color={color} />;
                },
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: 'black',
                    borderTopWidth: 0,
                    elevation: 8,
                    height: 90,
                    paddingBottom: 20,
                    position: 'absolute',
                },
                tabBarActiveTintColor: '#e50914',
                tabBarInactiveTintColor: '#808080',
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                    marginBottom: 5,
                },
            })}
        >
            <Tab.Screen name="Home" component={Home} />
            <Tab.Screen name="Explore" component={Explore} />
            <Tab.Screen name="My list" component={Mylist} />
            <Tab.Screen name="Profile" component={Profile} />

        </Tab.Navigator>
    );
}

export default function Layout() {
    return (
        <NativeStack.Navigator screenOptions={{ headerShown: false }}>
            <NativeStack.Screen name="TabNavigator" component={TabNavigator} />
            <NativeStack.Screen name="DetailsAndPlay" component={DetailsAndPlay} />
            <NativeStack.Screen name="Search" component={Search} />
            <NativeStack.Screen name="SeeAll" component={SeeAll} />
        </NativeStack.Navigator>
    );
}