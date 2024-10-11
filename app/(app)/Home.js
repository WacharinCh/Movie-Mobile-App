import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Dimensions, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/authContext';
import config from '../../config';

export default function Home() {
    const navigation = useNavigation();
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [recommendedMovies, setRecommendedMovies] = useState([]);
    const [upcomingMovies, setUpcomingMovies] = useState([]);
    const [error, setError] = useState(null);
    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;
    const { user, addToMyList, removeFromMyList } = useAuth();
    const [selectedGenre, setSelectedGenre] = useState(28);  // Set initial value to 28 (Action)
    const [genreMovies, setGenreMovies] = useState([]);
    const genreScrollViewRef = React.useRef(null);
    const [currentPage, setCurrentPage] = useState(0);
    const scrollViewRef = useRef(null);

    useEffect(() => {
        fetchTrendingMovies();
        fetchRecommendedMovies();
        fetchUpcomingMovies();
        fetchMoviesByGenre(selectedGenre);  // Call this function immediately when the component loads
    }, []);

    useEffect(() => {
        if (selectedGenre) {
            fetchMoviesByGenre(selectedGenre);
        }
    }, [selectedGenre]);

    const fetchTrendingMovies = async () => {
        try {
            const API_KEY = config().TMDB_API_KEY;
            const response = await fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${API_KEY}&language=en-US`);
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid or expired API key. Please check your API key.');
                }
                throw new Error(`Incomplete server response: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            if (data.results && Array.isArray(data.results)) {
                setTrendingMovies(data.results.slice(0, 10));
                setError(null);
            } else {
                throw new Error('Invalid data structure');
            }
        } catch (error) {
            console.error('Error fetching trending movies:', error.message);
            setError(error.message);
            setTrendingMovies([]);
        }
    };

    const fetchRecommendedMovies = async () => {
        try {
            const API_KEY = config().TMDB_API_KEY;
            const response = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US`);
            if (!response.ok) {
                throw new Error(`Incomplete server response: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            if (data.results && Array.isArray(data.results)) {
                setRecommendedMovies(data.results.slice(0, 10));
            } else {
                throw new Error('Invalid data structure');
            }
        } catch (error) {
            console.error('Error fetching recommended movies:', error.message);
        }
    };

    const fetchUpcomingMovies = async () => {
        try {
            const API_KEY = config().TMDB_API_KEY;
            const response = await fetch(`https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}&language=en-US`);
            if (!response.ok) {
                throw new Error(`Incomplete server response: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            if (data.results && Array.isArray(data.results)) {
                setUpcomingMovies(data.results.slice(0, 10));
            } else {
                throw new Error('Invalid data structure');
            }
        } catch (error) {
            console.error('Error fetching upcoming movies:', error.message);
        }
    };

    const fetchMoviesByGenre = async (genreId) => {
        try {
            const API_KEY = config().TMDB_API_KEY;
            const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US&with_genres=${genreId}`);
            if (!response.ok) {
                throw new Error(`Incomplete server response: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            if (data.results && Array.isArray(data.results)) {
                setGenreMovies(data.results.slice(0, 10));
            } else {
                throw new Error('Invalid data structure');
            }
        } catch (error) {
            console.error('Error fetching movies by genre:', error.message);
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
        { id: 16, name: 'Animation' }  // Add animation genre
    ];

    const handleMoviePress = (movie) => {
        navigation.navigate('DetailsAndPlay', { movie });
    };

    const handleAddRemoveMyList = async (movie) => {
        if (user) {
            const isInMyList = user.myList && user.myList.some(item => item.id === movie.id);
            if (isInMyList) {
                const result = await removeFromMyList(user.userId, movie);
                if (result.success) {
                    // Update UI or show success message
                    console.log('Successfully removed movie from My List');
                }
            } else {
                const result = await addToMyList(user.userId, movie);
                if (result.success) {
                    // Update UI or show success message
                    console.log('Successfully added movie to My List');
                }
            }
        } else {
            // Notify user to log in
            console.log('Please log in to add movies to My List');
        }
    };

    const handleSeeAll = (category) => {
        if (category === 'genres') {
            navigation.navigate('SeeAll', { category, genreId: selectedGenre });
        } else {
            navigation.navigate('SeeAll', { category });
        }
    };

    const handleGenrePress = (genreId) => {
        setSelectedGenre(genreId);
        const index = genres.findIndex(genre => genre.id === genreId);
        if (index !== -1 && genreScrollViewRef.current) {
            genreScrollViewRef.current.scrollTo({
                x: index * 110 - (Dimensions.get('window').width / 2) + 55,
                animated: true
            });
        }
    };

    const handleScroll = (event) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const page = Math.round(contentOffsetX / windowWidth);
        setCurrentPage(page);
    };

    const handleSearchPress = () => {
        navigation.navigate('Search');
    };

    const retryFetchMovies = () => {
        setError(null);
        fetchTrendingMovies();
        fetchRecommendedMovies();
        fetchUpcomingMovies();
        fetchMoviesByGenre(selectedGenre);
    };

    return (
        <LinearGradient
            colors={['#121212', '#121212', '#121212']}
            style={styles.gradient}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Home</Text>
                <TouchableOpacity onPress={handleSearchPress} style={styles.searchButton}>
                    <Ionicons name="search" size={24} color="#fff" />
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Top 10 Trending Today</Text>
                </View>
                <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    style={styles.scrollView}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    ref={scrollViewRef}
                >
                    {error ? (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle-outline" size={64} color="#ff6b6b" />
                            <Text style={styles.errorText}>{`Error: ${error}`}</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={retryFetchMovies}>
                                <Text style={styles.retryText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : trendingMovies.length > 0 ? (
                        trendingMovies.map((movie, index) => (
                            <TouchableOpacity key={index} onPress={() => handleMoviePress(movie)}>
                                <View style={styles.movieContainer}>
                                    <ImageBackground
                                        source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
                                        style={styles.movieImage}
                                        imageStyle={styles.movieImageStyle}
                                    >
                                        <LinearGradient
                                            colors={['transparent', 'rgba(0,0,0,0.9)']}
                                            style={styles.movieGradient}
                                        >
                                            <View style={styles.movieContent}>
                                                <Text style={styles.movieRank}>Rank {index + 1}</Text>
                                                <Text style={styles.movieTitle}>{movie.title}</Text>
                                                <Text style={styles.movieOverview} numberOfLines={2}>{movie.overview}</Text>
                                                <View style={styles.ratingContainer}>
                                                    <Text style={styles.imdbText}>IMDb</Text>
                                                    <Text style={styles.ratingText}>{movie.vote_average.toFixed(1)}</Text>
                                                </View>
                                                <TouchableOpacity
                                                    style={styles.myListButton}
                                                    onPress={() => handleAddRemoveMyList(movie)}
                                                >
                                                    <Ionicons
                                                        name={user && user.myList && user.myList.some(item => item.id === movie.id) ? "checkmark-circle" : "add-circle-outline"}
                                                        size={20}
                                                        color="#fff"
                                                    />
                                                    <Text style={styles.myListButtonText}>
                                                        {user && user.myList && user.myList.some(item => item.id === movie.id) ? "Remove" : "Add to My list"}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        </LinearGradient>
                                    </ImageBackground>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.loadingContainer}>
                            <Ionicons name="film-outline" size={64} color="#fff" />
                            <Text style={styles.loadingText}>Loading movies...</Text>
                        </View>
                    )}
                </ScrollView>
                <View style={styles.paginationContainer}>
                    {trendingMovies.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.paginationDot,
                                { backgroundColor: index === currentPage ? '#e50914' : 'rgba(255, 255, 255, 0.5)' }
                            ]}
                        />
                    ))}
                </View>

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Recommended This Week</Text>
                    <TouchableOpacity onPress={() => handleSeeAll('recommended')}>
                        <Text style={styles.seeAllButton}>See All</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.recommendedScrollView}
                >
                    {recommendedMovies.map((movie, index) => (
                        <TouchableOpacity key={index} onPress={() => handleMoviePress(movie)}>
                            <View style={styles.recommendedMovieContainer}>
                                <ImageBackground
                                    source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
                                    style={styles.recommendedMovieImage}
                                    imageStyle={styles.recommendedMovieImageStyle}
                                >
                                    <LinearGradient
                                        colors={['transparent', 'rgba(0,0,0,0.9)']}
                                        style={styles.recommendedMovieGradient}
                                    >
                                        <Text style={styles.recommendedMovieTitle}>{movie.title}</Text>
                                        <View style={styles.ratingContainer}>
                                            <Text style={styles.imdbText}>IMDb</Text>
                                            <Text style={styles.recommendedRatingText}>{movie.vote_average.toFixed(1)}</Text>
                                        </View>
                                    </LinearGradient>
                                </ImageBackground>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Upcoming Movies</Text>
                    <TouchableOpacity onPress={() => handleSeeAll('upcoming')}>
                        <Text style={styles.seeAllButton}>See All</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.recommendedScrollView}
                >
                    {upcomingMovies.map((movie, index) => (
                        <TouchableOpacity key={index} onPress={() => handleMoviePress(movie)}>
                            <View style={styles.recommendedMovieContainer}>
                                <ImageBackground
                                    source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
                                    style={styles.recommendedMovieImage}
                                    imageStyle={styles.recommendedMovieImageStyle}
                                >
                                    <LinearGradient
                                        colors={['transparent', 'rgba(0,0,0,0.9)']}
                                        style={styles.recommendedMovieGradient}
                                    >
                                        <Text style={styles.recommendedMovieTitle}>{movie.title}</Text>
                                        <View style={styles.releaseDateContainer}>
                                            <Ionicons name="calendar-outline" size={16} color="#fff" />
                                            <Text style={styles.upcomingReleaseDate}>{movie.release_date}</Text>
                                        </View>
                                    </LinearGradient>
                                </ImageBackground>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Popular Categories</Text>
                    <TouchableOpacity onPress={() => handleSeeAll('genres')}>
                        <Text style={styles.seeAllButton}>See All</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreScrollView} ref={genreScrollViewRef}>
                    <View style={styles.genreButtonContainer}>
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
                    </View>
                </ScrollView>

                {selectedGenre && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.recommendedScrollView}
                    >
                        {genreMovies.map((movie, index) => (
                            <TouchableOpacity key={index} onPress={() => handleMoviePress(movie)}>
                                <View style={styles.recommendedMovieContainer}>
                                    <ImageBackground
                                        source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
                                        style={styles.recommendedMovieImage}
                                        imageStyle={styles.recommendedMovieImageStyle}
                                    >
                                        <LinearGradient
                                            colors={['transparent', 'rgba(0,0,0,0.9)']}
                                            style={styles.recommendedMovieGradient}
                                        >
                                            <Text style={styles.recommendedMovieTitle}>{movie.title}</Text>
                                            <View style={styles.ratingContainer}>
                                                <Text style={styles.imdbText}>IMDb</Text>
                                                <Text style={styles.recommendedRatingText}>{movie.vote_average.toFixed(1)}</Text>
                                            </View>
                                        </LinearGradient>
                                    </ImageBackground>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,

    },
    contentContainer: {
        paddingBottom: 100

    },
    gradient: {
        flex: 1,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20,
        paddingHorizontal: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#e50914',
        paddingLeft: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    seeAllButton: {
        fontSize: 16,
        color: '#e50914',
        fontWeight: 'bold',
        backgroundColor: 'rgba(229, 9, 20, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    scrollView: {
        height: Dimensions.get('window').width,
    },
    errorContainer: {
        width: Dimensions.get('window').width,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        textAlign: 'center',
        color: '#e50914',
        marginVertical: 20,
    },
    retryButton: {
        backgroundColor: '#4ecdc4',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
    },
    retryText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
    movieContainer: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').width,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
    movieImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end',
    },
    movieImageStyle: {
        borderRadius: 15,
    },
    movieGradient: {
        height: '50%',
        justifyContent: 'flex-end',
        padding: 15,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
    },
    movieContent: {
        alignItems: 'flex-start',
    },
    movieRank: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#FFD700',
        marginBottom: 5,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 5
    },
    movieTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 5
    },
    movieOverview: {
        fontSize: 12,
        color: '#ddd',
        marginBottom: 5,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    imdbText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#f3ce13',
        marginRight: 5,
    },
    ratingText: {
        fontSize: 14,
        color: '#fff',
    },
    myListButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(229, 9, 20, 0.8)',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 15,
    },
    myListButtonText: {
        color: '#fff',
        fontSize: 12,
        marginLeft: 3,
        fontWeight: 'bold',
    },
    loadingContainer: {
        width: Dimensions.get('window').width,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        fontSize: 20,
        textAlign: 'center',
        color: '#fff',
        marginTop: 20,
    },
    recommendedScrollView: {
        height: 280,
        paddingLeft: 20,
    },
    recommendedMovieContainer: {
        width: 180,
        height: 270,
        marginRight: 15,
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    recommendedMovieImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end',
    },
    recommendedMovieImageStyle: {
        borderRadius: 15,
    },
    recommendedMovieGradient: {
        height: '50%',
        justifyContent: 'flex-end',
        padding: 15,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
    },
    recommendedMovieTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'left',
        marginBottom: 8,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 5
    },
    recommendedRatingText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: 'bold',
    },
    releaseDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(229, 9, 20, 0.8)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        alignSelf: 'flex-start',
    },
    upcomingReleaseDate: {
        fontSize: 14,
        color: '#fff',
        marginLeft: 5,
        fontWeight: 'bold',
    },
    genreScrollView: {
        marginBottom: 20,
        paddingLeft: 20,
    },
    genreButtonContainer: {
        flexDirection: 'row',
    },
    genreButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 25,
        marginRight: 12,
        minWidth: 100,
    },
    selectedGenreButton: {
        backgroundColor: '#e50914',
    },
    genreButtonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '500',
    },
    selectedGenreButtonText: {
        fontWeight: 'bold',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    searchButton: {
        padding: 5,
    },
});