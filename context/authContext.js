import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from "../firebaesConfig";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export const AuthContext = createContext();
export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(undefined);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {


            if (user) {
                setIsAuthenticated(true);
                setUser(user);
                updeteUserData(user.uid);
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }

            console.log('====================================');
            console.log(user);
            console.log('====================================');
        });
        return unsub;
    }, []);

    const updeteUserData = async (userId) => {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            let data = docSnap.data();
            setUser(prevUser => ({
                ...prevUser,
                username: data?.username || '',
                userId: data?.userId || userId,
                profilePicture: data?.profilePicture || '', // ตรวจสอบว่าดึง URL ของโปรไฟล์รูปภาพมา
                myList: data?.myList || [], // เพิ่มการโหลดข้อมูล myList
            }));
        }
    };

    const addToMyList = async (userId, movie) => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                myList: arrayUnion(movie)
            });
            setUser(prevUser => ({
                ...prevUser,
                myList: [...(prevUser.myList || []), movie]
            }));
            return { success: true };
        } catch (e) {
            console.error('เกิดข้อผิดพลาดในการเพิ่มหนังลงใน myList:', e);
            return { success: false, error: e.message };
        }
    };

    const removeFromMyList = async (userId, movie) => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                myList: arrayRemove(movie)
            });
            setUser(prevUser => ({
                ...prevUser,
                myList: prevUser.myList.filter(item => item.id !== movie.id)
            }));
            return { success: true };
        } catch (e) {
            console.error('เกิดข้อผิดพลาดในการลบหนังออกจาก myList:', e);
            return { success: false, error: e.message };
        }
    };

    const login = async (email, password) => {
        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
            await updeteUserData(response.user.uid); // เรียกใช้ updeteUserData หลังจาก login สำเร็จ
            return { success: true };
        } catch (e) {
            let msg = e.message;
            if (msg.includes('(auth/invalid-email)')) msg = 'Invalid email';
            if (msg.includes('(auth/invalid-credential)')) msg = 'Wrong credentials';
            return { success: false, msg };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            return { success: true };
        } catch (e) {
            return { success: false, msg: e.message, error: e };
        }
    };

    const register = async (email, password, username) => {
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            // console.log('response.user', response?.user);
            await setDoc(doc(db, "users", response?.user?.uid), {
                username,
                userId: response?.user?.uid
            });
            return { success: true, data: response?.user };
        } catch (e) {
            let msg = e.message;
            if (msg.includes('(auth/invalid-email)')) msg = 'Invalid email';
            if (msg.includes('(auth/email-already-in-use)')) msg = 'This email is already in use';

            return { success: false, msg };
        }
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, addToMyList, removeFromMyList }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const value = useContext(AuthContext);

    if (!value) {
        throw new Error('useAuth must be wrapped inside AuthContextProvider');
    }
    return value;
};
