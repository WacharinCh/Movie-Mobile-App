import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Loading from './Loading';
import FilterModal from './FilterModal';
import config from '../config';

export default function Search() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
    const [filters, setFilters] = useState({
        categories: [],
        genre: [],
        timePeriods: [],
        sort: 'popularity.desc'
    });
    const [genres, setGenres] = useState([]);

    useEffect(() => {
        fetchGenres();
    }, []);

    const fetchGenres = async () => {
        try {
            const API_KEY = config().TMDB_API_KEY;
            const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`);
            const data = await response.json();
            setGenres(data.genres);
        } catch (error) {
            console.error('Error fetching genres:', error);
        }
    };

    useEffect(() => {
        if (searchQuery.length > 0) {
            searchMovies();
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    const toggleFilterModal = () => {
        setIsFilterModalVisible(!isFilterModalVisible);
    };

    const applyFilters = (newFilters) => {
        setFilters(newFilters);
        setIsFilterModalVisible(false);
        // เรียกฟังก์ชันค้นหาใหม่โดยใช้ตัวกรอง
        searchMovies(newFilters);
    };

    const searchMovies = async (appliedFilters = filters) => {
        setLoading(true);
        try {
            const API_KEY = config().TMDB_API_KEY;
            let url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US&page=1`;

            if (searchQuery) {
                url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(searchQuery)}&page=1`;
            }

            if (appliedFilters.categories.length > 0) {
                url += `&with_genres=${appliedFilters.categories.join(',')}`;
            }

            if (appliedFilters.timePeriods.length > 0) {
                const [startYear, endYear] = getYearRangeFromPeriod(appliedFilters.timePeriods[0]);
                url += `&primary_release_date.gte=${startYear}-01-01&primary_release_date.lte=${endYear}-12-31`;
            }

            url += `&sort_by=${appliedFilters.sort}`;

            const response = await fetch(url);
            const data = await response.json();
            setSearchResults(data.results);
        } catch (error) {
            console.error('Error searching movies:', error);
        } finally {
            setLoading(false);
        }
    };

    // ฟังก์ชันช่วยในการแปลงช่วงเวลาเป็นปี
    const getYearRangeFromPeriod = (period) => {
        switch (period) {
            case '2020s': return [2020, 2029];
            case '2010s': return [2010, 2019];
            case '2000s': return [2000, 2009];
            case '1990s': return [1990, 1999];
            default: return [1900, 2029]; // ค่าเริ่มต้น
        }
    };

    const renderMovieItem = ({ item }) => (
        <TouchableOpacity
            style={styles.movieItem}
            onPress={() => navigation.navigate('DetailsAndPlay', { movie: item })}
        >
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
                        <Text style={styles.movieTitle} numberOfLines={2}>
                            {item.title}
                        </Text>
                        <View style={styles.ratingContainer}>
                            <Text style={styles.imdbText}>IMDb</Text>
                            <Text style={styles.movieRating}>{item.vote_average.toFixed(1)}</Text>
                        </View>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search movies..."
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <TouchableOpacity onPress={toggleFilterModal} style={styles.filterButton}>
                    <MaterialIcons name="filter-list" size={28} color="#fff" />
                </TouchableOpacity>
            </View>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <Loading size={50} />
                </View>
            ) : searchResults.length > 0 ? (
                <FlatList
                    data={searchResults}
                    renderItem={renderMovieItem}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    contentContainerStyle={styles.movieList}
                />
            ) : searchQuery.length > 2 ? (
                <View style={styles.noResultsContainer}>
                    <Text style={styles.noResultsText}>No results found</Text>
                </View>
            ) : null}
            <FilterModal
                isVisible={isFilterModalVisible}
                onClose={toggleFilterModal}
                onApply={applyFilters}
                currentFilters={filters}
                genres={genres}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    backButton: {
        marginRight: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        padding: 8,
    },
    searchInput: {
        flex: 1,
        height: 40,
        backgroundColor: '#333',
        borderRadius: 20,
        paddingHorizontal: 15,
        color: '#fff',
        placeholder: 'Search movies...',
    },
    filterButton: {
        marginLeft: 10,
    },
    movieList: {
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
    noResultsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noResultsText: {
        color: '#fff',
        fontSize: 18,
        text: 'No results found',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
