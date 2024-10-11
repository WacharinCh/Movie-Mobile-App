import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // For Firebase storage
import { doc, updateDoc } from "firebase/firestore"; // For Firestore
import { db } from '../firebaesConfig'; // Your Firebase config

export default function ProfileScreen() {
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Function to select an image from the phone's gallery
    const pickImage = async () => {
        let result = await launchImageLibraryAsync({
            mediaTypes: MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.uri); // Set the selected image URI
        }
    };

    // Function to upload the selected image to Firebase Storage
    const uploadImage = async (userId) => {
        if (!image) return;

        setUploading(true);
        const storage = getStorage();
        const storageRef = ref(storage, `profilePictures/${userId}`); // Set the file path in Firebase Storage

        const response = await fetch(image); // Fetch the image from the URI
        const blob = await response.blob(); // Convert the image to a blob for upload

        uploadBytes(storageRef, blob)
            .then(async (snapshot) => {
                const downloadURL = await getDownloadURL(snapshot.ref); // Get the download URL of the uploaded image

                // Save the download URL to Firestore
                await updateDoc(doc(db, "users", userId), {
                    profilePicture: downloadURL
                });

                Alert.alert("Success", "Profile picture uploaded successfully");
            })
            .catch((error) => {
                Alert.alert("Error", error.message);
            })
            .finally(() => {
                setUploading(false);
            });
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity onPress={pickImage}>
                <Text>Pick a profile picture</Text>
            </TouchableOpacity>

            {image && (
                <Image
                    source={{ uri: image }}
                    style={{ width: 200, height: 200, borderRadius: 100, marginTop: 20 }}
                />
            )}

            <TouchableOpacity
                onPress={() => uploadImage("userId")} // Pass your userId here
                disabled={!image || uploading}
                style={{
                    backgroundColor: 'blue',
                    padding: 10,
                    borderRadius: 5,
                    marginTop: 20
                }}
            >
                <Text style={{ color: 'white' }}>{uploading ? "Uploading..." : "Upload Profile Picture"}</Text>
            </TouchableOpacity>
        </View>
    );
}
