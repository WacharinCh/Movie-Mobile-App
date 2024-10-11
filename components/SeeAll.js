import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Loading from './Loading';
import { Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import config from '../config';

export default function SeeAll({ route }) {
    const { category, genreId } = route.params;
    const [movies, setMovies] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState(genreId);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const navigation = useNavigation();
    const genreScrollViewRef = React.useRef(null);
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
        fetchMovies();
    }, [category, selectedGenre, page]);

    const fetchMovies = async () => {
        setLoading(true);
        try {
            const API_KEY = config().TMDB_API_KEY;
            let url;

            switch (category) {
                case 'recommended':
                    url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`;
                    break;
                case 'upcoming':
                    url = `https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}&language=en-US&page=${page}`;
                    break;
                case 'genres':
                    url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US&with_genres=${selectedGenre}&page=${page}`;
                    break;
                default:
                    url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (page === 1) {
                setMovies(data.results);
            } else {
                setMovies(prevMovies => [...prevMovies, ...data.results]);
            }

            setHasMore(data.page < data.total_pages);
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการดึงข้อมูลหนัง:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMoreMovies = () => {
        if (hasMore && !loading) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const genres = [
        { id: 28, name: 'Action' },
        { id: 12, name: 'Adventure' },
        { id: 35, name: 'Comedy' },
        { id: 10749, name: 'Romance' },
        { id: 878, name: 'Sci-Fi' },
        { id: 53, name: 'Thriller' },
        { id: 36, name: 'History' },
        { id: 9648, name: 'Mystery' },
        { id: 16, name: 'Animation' }  // เพิ่มหมวดหมู่การ์ตูน
    ];

    const handleGenrePress = (genreId) => {
        setSelectedGenre(genreId);
        setPage(1);
        setMovies([]);
        const index = genres.findIndex(genre => genre.id === genreId);
        if (index !== -1 && genreScrollViewRef.current) {
            const itemWidth = 110; // ความกว้างของแต่ละปุ่มหมวดหมู่
            const offset = index * itemWidth;
            const centerOffset = containerWidth / 2 - itemWidth / 2;
            genreScrollViewRef.current.scrollTo({
                x: offset - centerOffset,
                animated: true
            });
        }
    };

    const MovieItem = ({ movie }) => (
        <TouchableOpacity onPress={() => navigation.navigate('DetailsAndPlay', { movie })} style={styles.movieItem}>
            <ImageBackground
                source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
                style={styles.moviePoster}
                imageStyle={styles.moviePosterImage}
            >
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.9)']}
                    style={styles.gradientOverlay}
                >
                    <View style={styles.movieInfo}>
                        <Text style={styles.movieTitle} numberOfLines={2}>{movie.title}</Text>
                        <View style={styles.ratingContainer}>
                            <Text style={styles.imdbText}>IMDb</Text>
                            <Text style={styles.movieRating}>{movie.vote_average.toFixed(1)}</Text>
                        </View>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </TouchableOpacity>
    );

    const handleSearchPress = () => {
        navigation.navigate('Search');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>
                    {category === 'recommended' ? 'แนะนำ' : category === 'upcoming' ? 'เร็วๆ นี้' : 'ประเภท'}
                </Text>
                <TouchableOpacity onPress={handleSearchPress} style={styles.searchButton}>
                    <Ionicons name="search" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {category === 'genres' && (
                <View
                    style={styles.genreScrollViewContainer}
                    onLayout={(event) => {
                        const { width } = event.nativeEvent.layout;
                        setContainerWidth(width);
                    }}
                >
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        ref={genreScrollViewRef}
                        contentContainerStyle={styles.genreScrollViewContent}
                    >
                        {genres.map((genre) => (
                            <TouchableOpacity
                                key={genre.id}
                                style={[styles.genreButton, selectedGenre === genre.id && styles.selectedGenreButton]}
                                onPress={() => handleGenrePress(genre.id)}
                            >
                                <Text style={[styles.genreButtonText, selectedGenre === genre.id && styles.selectedGenreButtonText]}>
                                    {genre.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {loading && movies.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <Loading size={100} />
                </View>
            ) : (
                <FlatList
                    data={movies}
                    renderItem={({ item }) => <MovieItem movie={item} />}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    contentContainerStyle={styles.listContainer}
                    onEndReached={loadMoreMovies}
                    onEndReachedThreshold={0.1}
                    ListFooterComponent={() =>
                        loading && (
                            <View style={styles.footerLoadingContainer}>
                                <Loading size={100} />
                            </View>
                        )
                    }
                />
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
        height: '50%',
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
    genreScrollViewContainer: {
        marginBottom: 20,
    },
    genreScrollViewContent: {
        paddingHorizontal: 10,
    },
    genreButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 25,
        marginHorizontal: 5,
        minWidth: 100,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,

    },
    selectedGenreButton: {
        backgroundColor: '#e50914',
        borderColor: '#e50914',
    },
    genreButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    selectedGenreButtonText: {
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerLoadingContainer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 15,
    },
    backButton: {
        padding: 5,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    title: {
        flex: 1,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginRight: 40,
    },
    searchButton: {
        padding: 5,
    },
});
