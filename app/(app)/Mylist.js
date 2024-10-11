import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuth } from '../../context/authContext';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

export default function Mylist() {
    const { user } = useAuth();
    const [myList, setMyList] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        if (user && user.myList) {
            setMyList(user.myList);
        }
    }, [user]);

    const handleMoviePress = (movie) => {
        navigation.navigate('DetailsAndPlay', { movie });
    };

    const renderMovieItem = ({ item }) => (
        <TouchableOpacity onPress={() => handleMoviePress(item)} style={styles.movieItem}>
            <Image
                source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
                style={styles.moviePoster}
            />
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.gradientOverlay}
            />
            <View style={styles.movieInfo}>
                <Text style={styles.movieTitle} numberOfLines={2}>{item.title}</Text>
                <Icon name="play-circle-outline" size={24} color="#fff" />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>รายการหนังของฉัน</Text>
            {myList.length > 0 ? (
                <FlatList
                    data={myList}
                    renderItem={renderMovieItem}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    contentContainerStyle={styles.listContainer}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Icon name="film-outline" size={80} color="#555" />
                    <Text style={styles.emptyText}>คุณยังไม่มีหนังในรายการ</Text>
                    <TouchableOpacity style={styles.exploreButton}>
                        <Text style={styles.exploreButtonText}>สำรวจหนัง</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginVertical: 20,
        marginLeft: 20,
    },
    listContainer: {
        paddingHorizontal: 10,
    },
    movieItem: {
        width: '47%',
        marginHorizontal: '1.5%',
        marginBottom: 20,
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 5,
    },
    moviePoster: {
        width: '100%',
        height: 250,
    },
    gradientOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '50%',
    },
    movieInfo: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        right: 10,
    },
    movieTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#555',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    exploreButton: {
        backgroundColor: '#E50914',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
    },
    exploreButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});