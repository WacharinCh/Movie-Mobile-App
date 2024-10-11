import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Video } from 'expo-av';
import { useAuth } from '../context/authContext';
import { BlurView } from 'expo-blur';
import config from '../config';
const { width, height } = Dimensions.get('window');

const DetailsAndPlay = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { movie } = route.params;
    const [isPlaying, setIsPlaying] = useState(false);
    const [isInMyList, setIsInMyList] = useState(false);
    const { user, addToMyList, removeFromMyList } = useAuth();
    const [availablePlatforms, setAvailablePlatforms] = useState({});

    useEffect(() => {
        if (user && user.myList) {
            setIsInMyList(user.myList.some(item => item.id === movie.id));
        }
        checkAvailablePlatforms(movie.id);
    }, [user, movie]);

    const checkAvailablePlatforms = async (movieId) => {
        try {
            const API_KEY = config().TMDB_API_KEY;
            const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${API_KEY}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.results && data.results.TH) {
                const platforms = {};
                ['flatrate', 'rent', 'buy'].forEach(type => {
                    if (data.results.TH[type]) {
                        platforms[type] = data.results.TH[type].map(provider => provider.provider_name);
                    }
                });
                setAvailablePlatforms(platforms);
            } else {
                setAvailablePlatforms({});
            }
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการดึงข้อมูลแพลตฟอร์ม:', error.message);
            setAvailablePlatforms({});
        }
    };

    const handleClose = () => {
        navigation.goBack();
    };

    const handlePlay = async () => {
        setIsPlaying(true);
    };

    const handleMyList = async () => {
        if (user) {
            if (isInMyList) {
                const result = await removeFromMyList(user.userId, movie);
                if (result.success) {
                    setIsInMyList(false);
                    console.log('ลบหนังออกจาก My List สำเร็จ');
                } else {
                    console.error('เกิดข้อผิดพลาดในการลบหนังออกจาก My List:', result.error);
                }
            } else {
                const result = await addToMyList(user.userId, movie);
                if (result.success) {
                    setIsInMyList(true);
                    console.log('เพิ่มหนังลงใน My List สำเร็จ');
                } else {
                    console.error('เกิดข้อผิดพลาดในการเพิ่มหนังลงใน My List:', result.error);
                }
            }
        } else {
            console.log('กรุณาเข้าสู่ระบบเพื่อเพิ่มหนังลงใน My List');
        }
    };

    const handleWatchOn = (platform) => {
        let url;
        switch (platform.toLowerCase()) {
            case 'netflix':
                url = 'https://www.netflix.com/search?q=' + encodeURIComponent(movie.title);
                break;
            case 'primevideo':
            case 'amazon prime video':
            case 'amazon':
                url = 'https://www.primevideo.com/search/ref=atv_sr_sug_1?phrase=' + encodeURIComponent(movie.title);
                break;
            case 'disney':
            case 'hotstar':
                url = 'https://www.disneyplus.com/search?q=' + encodeURIComponent(movie.title);
                break;
            case 'apple':
            case 'itunes':
            case 'appletv':
            case 'apple tv':
                url = 'https://tv.apple.com/search?term=' + encodeURIComponent(movie.title);
                break;
            case 'hbo':
            case 'hbomax':
            case 'hbo go':
                url = 'https://www.hbogo.co.th//search?q=' + encodeURIComponent(movie.title);
                break;
            case 'google play':
            case 'google play movies':
            case 'play movies':
                url = 'https://play.google.com/store/search?q=' + encodeURIComponent(movie.title) + '&c=movies';
                break;
            default:
                console.warn(`ไม่พบ URL สำหรับแพลตฟอร์ม: ${platform}`);
                return;
        }
        Linking.openURL(url);
    };

    const getPlatformLogo = (platform) => {
        const lowercasePlatform = platform.toLowerCase();
        if (lowercasePlatform.includes('netflix')) {
            return require('../assets/logo/netflix-logo.png');
        } else if (lowercasePlatform.includes('prime') || lowercasePlatform.includes('amazon')) {
            return require('../assets/logo/primevideo-logo.png');
        } else if (lowercasePlatform.includes('disney') || lowercasePlatform.includes('hotstar')) {
            return require('../assets/logo/disney-logo.png');
        } else if (lowercasePlatform.includes('hbo')) {
            return require('../assets/logo/hbomax-logo.png');
        } else if (lowercasePlatform.includes('apple') || lowercasePlatform.includes('itunes') || lowercasePlatform.includes('appletv')) {
            return require('../assets/logo/appletv-logo.png');
        } else if (lowercasePlatform.includes('google') || lowercasePlatform.includes('play')) {
            return require('../assets/logo/googleplay-logo.png');
        } else {
            console.warn(`ไม่พบโลโก้สำหรับแพลตฟอร์ม: ${platform}`);
            return require('../assets/logo/default-logo.png');
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
            >
                <View style={styles.headerContainer}>
                    {isPlaying ? (
                        <Video
                            source={{ uri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' }}
                            rate={1.0}
                            volume={1.0}
                            isMuted={false}
                            resizeMode="cover"
                            shouldPlay
                            useNativeControls
                            style={styles.video}
                        />
                    ) : (
                        <Image
                            source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
                            style={styles.poster}
                        />
                    )}
                    <LinearGradient
                        colors={['rgba(0,0,0,0.8)', 'transparent']}
                        style={styles.gradientHeader}
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.9)']}
                        style={styles.gradientFooter}
                    />
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.title}>{movie.title}</Text>
                    <Text style={styles.releaseDate}>Release Date: {movie.release_date}</Text>

                    <View style={styles.ratingContainer}>
                        <BlurView intensity={80} tint="dark" style={styles.ratingBlur}>
                            <Text style={styles.imdbText}>IMDb</Text>
                            <Text style={styles.rating}>{movie.vote_average.toFixed(1)}</Text>
                        </BlurView>
                    </View>

                    <Text style={styles.overview}>{movie.overview}</Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.myListButton} onPress={handleMyList}>
                            <Ionicons name={isInMyList ? "checkmark-circle" : "add-circle-outline"} size={24} color="#fff" />
                            <Text style={styles.myListButtonText}>
                                {isInMyList ? "Remove from My List" : "Add to My List"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.playButton} onPress={handlePlay}>
                            <Ionicons name="play" size={24} color="#fff" />
                            <Text style={styles.playButtonText}>Watch Trailer</Text>
                        </TouchableOpacity>
                    </View>

                    {Object.keys(availablePlatforms).length > 0 && (
                        <>
                            {Object.entries(availablePlatforms).map(([type, platforms]) => (
                                <View key={type}>
                                    <Text style={styles.platformTypeText}>{getPlatformTypeText(type)}:</Text>
                                    <View style={styles.watchOnContainer}>
                                        {platforms.map((platform, index) => {
                                            const logo = getPlatformLogo(platform);
                                            return (
                                                <TouchableOpacity
                                                    key={index}
                                                    onPress={() => handleWatchOn(platform)}
                                                    style={styles.platformButton}
                                                >
                                                    {logo ? (
                                                        <Image source={logo} style={styles.platformLogo} />
                                                    ) : (
                                                        <Text style={styles.platformText}>{platform}</Text>
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            ))}
                        </>
                    )}
                </View>
            </ScrollView>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <BlurView intensity={80} tint="dark" style={styles.closeButtonBlur}>
                    <Ionicons name="close" size={24} color="#fff" />
                </BlurView>
            </TouchableOpacity>
        </View>
    );
};
const getPlatformTypeText = (type) => {
    switch (type) {
        case 'flatrate':
            return 'Streaming';
        case 'rent':
            return 'Rent';
        case 'buy':
            return 'Buy';
        default:
            return type;
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    headerContainer: {
        height: height * 0.6,
        position: 'relative',
    },
    gradientHeader: {
        height: 100,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 20,
        paddingRight: 20,
    },
    gradientFooter: {
        height: 100,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 10,
    },
    closeButtonBlur: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    poster: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    infoContainer: {
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    releaseDate: {
        fontSize: 16,
        color: '#bbb',
        marginBottom: 10,
        text: 'Release Date:',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    ratingBlur: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        overflow: 'hidden',
    },
    imdbText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#f3ce13',
        marginRight: 10,
    },
    rating: {
        fontSize: 18,
        color: '#fff',
    },
    overview: {
        fontSize: 16,
        color: '#ddd',
        lineHeight: 24,
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    playButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#E50914',
        padding: 15,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    playButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
        text: 'Watch Trailer',
    },
    myListButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 15,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    myListButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
        text: 'Add to My List',
    },
    platformTypeText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 5,
    },
    watchOnContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    platformButton: {
        marginRight: 10,
        marginBottom: 5,
        backgroundColor: 'transparent',
    },
    platformLogo: {
        width: 80,
        height: 70,
        resizeMode: 'contain',
    },
    platformText: {
        color: '#fff',
        fontSize: 14,
        textAlign: 'center',
    },
});

export default DetailsAndPlay;