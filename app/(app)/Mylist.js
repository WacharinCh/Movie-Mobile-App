import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, SafeAreaView, ImageBackground } from 'react-native';
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
            <ImageBackground
                source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
                style={styles.moviePoster}
                imageStyle={styles.moviePosterImage}
            >
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.9)']}
                    style={styles.gradientOverlay}
                >
                    <View style={styles.movieInfo}>
                        <Text style={styles.movieTitle} numberOfLines={2}>{item.title}</Text>
                        <View style={styles.ratingContainer}>
                            <Text style={styles.imdbText}>IMDb</Text>
                            <Text style={styles.movieRating}>{item.vote_average.toFixed(1)}</Text>
                        </View>
                        <TouchableOpacity style={styles.playButton}>
                            <Icon name="play-circle-outline" size={24} color="#fff" />
                            <Text style={styles.playButtonText}>เล่น</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </ImageBackground>
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
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 5,
    },
    moviePoster: {
        width: '100%',
        height: 250,
        justifyContent: 'flex-end',
    },
    moviePosterImage: {
        borderRadius: 15,
    },
    gradientOverlay: {
        height: '100%',
        justifyContent: 'flex-end',
        padding: 15,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
    },
    movieInfo: {
        justifyContent: 'flex-end',
    },
    movieTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 5
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    imdbText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#f3ce13',
        marginRight: 5,
    },
    movieRating: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    playButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(229, 9, 20, 0.8)',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 15,
        alignSelf: 'flex-start',
    },
    playButtonText: {
        color: '#fff',
        fontSize: 14,
        marginLeft: 5,
        fontWeight: 'bold',
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
