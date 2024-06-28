import React, { useState, useEffect, useCallback } from 'react';
import { TouchableOpacity, View, StyleSheet, Text, ActivityIndicator, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import storage from '../AsyncStorage';
import { useFocusEffect } from '@react-navigation/native';

const defaultImage = require('../assets/trueecho.png');

const ImageButton = React.memo(({ front_image, back_image, containerHeight, windowWidth }) => {
    const [isFrontShowing, setIsFrontShowing] = useState(true);
    const [myPicture, setMyPicture] = useState("");
    const [loading, setLoading] = useState(true);
    const [postedIn24H, setPostedIn24H] = useState(null);
    const ImageHeight = Math.floor(containerHeight);
    const SmallHeight = Math.floor(ImageHeight / 3);
    const SmallWidth = Math.floor(windowWidth / 3);

    useFocusEffect(
        useCallback(() => {
            loadImage();
        }, [])
    );

    const loadImage = async () => {
        const Front = await storage.get('postFront');
        const Back = await storage.get('postBack');
        const postedData = await storage.get('postedIn24H');
        setPostedIn24H(JSON.parse(postedData));

        if (Front && Back) {
            setMyPicture(""); // Both images exist
        } else if (Front) {
            setMyPicture("front"); // Only front image exists
        } else if (Back) {
            setMyPicture("back"); // Only back image exists
        } else {
            setMyPicture("none"); // Neither image exists
        }
        await new Promise(resolve => setTimeout(resolve, 20)); // 예: 20ms 대기
        setLoading(false);
    };

    const changeImage = () => {
        setIsFrontShowing(!isFrontShowing);
    };

    const getBlurIntensity = (isFront) => {
        if (!postedIn24H) return 100; // 블러 강도를 100으로 설정
        if (isFront && !postedIn24H.postedFront) return 100; // 블러 강도를 100으로 설정
        if (!isFront && !postedIn24H.postedBack) return 100; // 블러 강도를 100으로 설정
        const postedAt = new Date(postedIn24H.postedAt);
        const now = new Date();
        return Math.abs(now - postedAt) / 36e5 > 24 ? 100 : 0; // 블러 강도를 100으로 설정
    };

    const renderOverlayText = (isFront) => {
        if (myPicture === "back" && isFront) {
            return "당신의 얼굴을\n보고싶어요!";
        } else if (myPicture === "front" && !isFront) {
            return "당신이 바라보는\n풍경이 궁금해요!";
        }
        return "게시물을 작성해보세요!";
    };

    if (loading) {
        return (
            <View style={styles.overlayTextContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={{ position: 'relative' }}>
            {myPicture === "none" && (
                <View style={styles.overlayTextContainer}>
                    <Text style={styles.overlayText}>
                        게시물을 작성해보세요!
                    </Text>
                </View>
            )}
            <TouchableOpacity onPress={changeImage} style={styles.smallImageContainer}>
                <View style={{ position: 'relative' }}>
                    <Image
                        source={isFrontShowing ? (front_image ? { uri: front_image } : defaultImage) : (back_image ? { uri: back_image } : defaultImage)}
                        style={[styles.smallImage, { height: SmallHeight, width: SmallWidth }]}
                    />
                    {getBlurIntensity(isFrontShowing) > 0 && (
                        <>
                            <BlurView intensity={getBlurIntensity(isFrontShowing)} style={styles.blurView} />
                            <View style={[styles.overlayView, { opacity: 0.7 }]}/>
                        </>
                    )}
                </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={changeImage} style={{ zIndex: 1 }}>
                <View style={{ position: 'relative' }}>
                    <Image
                        source={isFrontShowing ? (back_image ? { uri: back_image } : defaultImage) : (front_image ? { uri: front_image } : defaultImage)}
                        style={[styles.largeImage, { height: ImageHeight, width: windowWidth }]}
                    />
                    {getBlurIntensity(!isFrontShowing) > 0 && (
                        <>
                            <BlurView intensity={getBlurIntensity(!isFrontShowing)} style={styles.blurView} />
                            <View style={[styles.overlayView, { opacity: 0.7 }]}/>
                            {renderOverlayText(!isFrontShowing) && (
                                <Text style={styles.overlayText}>{renderOverlayText(!isFrontShowing)}</Text>
                            )}
                        </>
                    )}
                </View>
            </TouchableOpacity>
        </View>
    );
});

const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayTextContainer: {
        zIndex: 5,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    overlayText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    overlayTextSmall: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    smallImageContainer: {
        zIndex: 2,
        position: 'absolute',
        top: 10,
        left: 10,
    },
    smallImage: {
        borderColor: '#ffffff',
        borderWidth: 2,
    },
    largeImage: {
        width: '100%',
    },
    blurView: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayView: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'black',
    },
});

export { ImageButton };