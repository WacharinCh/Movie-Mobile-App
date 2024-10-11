import { StyleSheet, View, Text, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/authContext';
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Firebase storage
import { doc, updateDoc } from 'firebase/firestore'; // Firestore
import { db, storage } from '../../firebaesConfig'; // Firebase config
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import Loading from '../../components/Loading'; // นำเข้า Loading component
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'; // นำเข้า FontAwesome5

export default function Profile() {
    const { logout, user } = useAuth();
    const [uploading, setUploading] = useState(false); // สถานะการอัปโหลด
    const [image, setImage] = useState(user?.profilePicture || null);

    // ฟังก์ชันเลือกภาพจากคลัง
    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("Permission required", "Please allow access to your media library.");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        console.log('Image picker result:', result);

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const imageUri = result.assets[0].uri;

            // ตรวจสอบว่า URI ถูกต้องหรือไม่
            if (!imageUri) {
                Alert.alert("Error", "Could not select image. Please try again.");
                return;
            }

            console.log('Selected image URI:', imageUri);
            setImage(imageUri);
            uploadImage(imageUri);
        }
    };

    // ฟังก์ชันอัปโหลดภาพไปยัง Firebase Storage
    const uploadImage = async (uri) => {
        if (!user || !user.userId) {
            Alert.alert("Error", "User information is not available.");
            return;
        }

        setUploading(true); // เริ่มอัปโหลด
        try {
            const platformUri = Platform.OS === 'android' && !uri.startsWith('file://') ? `file://${uri}` : uri;

            console.log('Uploading image from URI:', platformUri);

            const response = await fetch(platformUri);

            // ตรวจสอบว่าดึงภาพได้สำเร็จหรือไม่
            if (!response.ok) {
                throw new Error('Failed to fetch the image from the URI.');
            }

            const blob = await response.blob();

            // ตรวจสอบขนาดไฟล์ (จำกัดที่ 5MB)
            const fileSizeInMB = blob.size / (1024 * 1024); // แปลงขนาดเป็น MB
            if (fileSizeInMB > 5) {
                throw new Error('Image size is too large. Please select an image under 5MB.');
            }

            const storageRef = ref(storage, `profilePictures/${user.userId}`);
            const snapshot = await uploadBytes(storageRef, blob);

            const downloadURL = await getDownloadURL(snapshot.ref);
            await updateDoc(doc(db, "users", user.userId), { profilePicture: downloadURL });

            setImage(downloadURL); // อัปเดต image ด้วย URL ใหม่หลังจากอัปโหลดเสร็จ
            Alert.alert("Success", "Profile picture uploaded successfully!");

        } catch (error) {
            console.error("Image upload failed:", error);
            Alert.alert("Error", error.message || "Image upload failed. Please try again.");
        } finally {
            setUploading(false); // จบการอัปโหลด
        }
    };

    // เมื่อมีการเปลี่ยนแปลงของ user ให้แสดงรูปภาพโปรไฟล์ที่อัปโหลด
    useEffect(() => {
        if (user && user.profilePicture) {
            setImage(user.profilePicture); // อัปเดต image state เมื่อ user มี profilePicture
        }
    }, [user]);

    const handlerLogout = async () => {
        await logout();
    };

    return (
        <LinearGradient
            colors={['#121212', '#121212', '#121212']}
            style={styles.gradient}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>โปรไฟล์</Text>
                </View>

                <TouchableOpacity onPress={pickImage} style={styles.profileImageContainer}>
                    {image && !uploading ? (
                        <Image
                            source={{ uri: image }}
                            style={styles.profileImage}
                            resizeMode='cover'
                        />
                    ) : (
                        <View style={styles.placeholderContainer}>
                            <FontAwesome5 name="user-alt" size={50} color="white" />
                        </View>
                    )}
                    {uploading && (
                        <View style={styles.loadingOverlay}>
                            <Loading size={50} />
                        </View>
                    )}
                    <View style={styles.editIconContainer}>
                        <Ionicons name="pencil" size={20} color="#fff" />
                    </View>
                </TouchableOpacity>

                <Text style={styles.username}>{user?.username || 'ผู้ใช้'}</Text>

                <View style={styles.infoContainer}>
                    <View style={styles.infoItem}>
                        <Ionicons name="mail-outline" size={24} color="#e50914" />
                        <Text style={styles.infoText}>{user?.email || 'ไม่มีอีเมล'}</Text>
                    </View>
                    {/* เพิ่มข้อมูลผู้ใช้อื่นๆ ตามต้องการ */}
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handlerLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#fff" />
                    <Text style={styles.logoutButtonText}>ออกจากระบบ</Text>
                </TouchableOpacity>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flexGrow: 1,
        alignItems: 'center',
        paddingBottom: 40,
    },
    header: {
        width: '100%',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    profileImageContainer: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginVertical: 20,
        elevation: 5,
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 75,
    },
    placeholderContainer: {
        width: '100%',
        height: '100%',
        borderRadius: 75,
        backgroundColor: '#2d3748',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 75,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#e50914',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
    },
    infoContainer: {
        width: '80%',
        marginBottom: 30,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
    },
    infoText: {
        color: '#fff',
        marginLeft: 10,
        fontSize: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e50914',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});
