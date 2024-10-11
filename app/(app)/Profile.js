import { View, Text, Button, Image, TouchableOpacity, Alert } from 'react-native';
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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity
                onPress={pickImage}
                style={{ backgroundColor: '#2d3748', height: 200, width: 200, justifyContent: 'center', alignItems: 'center', borderRadius: 100 }}>

                {image && !uploading ? (
                    <Image
                        source={{ uri: image }} // ใช้ state image เพื่อแสดงรูปโปรไฟล์
                        style={{ width: 200, height: 200, borderRadius: 100 }}
                        resizeMode='cover' // แสดงผลให้เต็มพื้นที่
                    />
                ) : (
                    // แสดงไอคอนแทนข้อความ "No profile picture"
                    <FontAwesome5 name="user-alt" size={50} color="white" />
                )}

                {/* แสดง Loading component เมื่อกำลังอัปโหลด */}
                {uploading && (
                    <View style={{
                        position: 'absolute',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        width: '100%',
                        borderRadius: 100,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                    }}>
                        <Loading size={300} />
                    </View>
                )}
            </TouchableOpacity>

            <Text>Welcome, {user?.username || 'User'}!</Text>

            <Button title="Sign Out" onPress={handlerLogout} />

        </View>
    );
}
