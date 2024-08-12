import React, { useState, useEffect, useCallback } from 'react';
import { Platform, TouchableOpacity, View, StyleSheet, Text, ActivityIndicator, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import storage from '../AsyncStorage';
import { useFocusEffect } from '@react-navigation/native';

const ImageButton = React.memo(({ front_image, back_image, containerHeight, windowWidth, myPicture }) => {  // myPicture prop 추가
    const [isFrontShowing, setIsFrontShowing] = useState(true);
    const [loading, setLoading] = useState(true);
    const defaultImage = "https://ppss.kr/wp-content/uploads/2020/07/01-4-540x304.png";
    const ImageHeight = Math.floor(containerHeight);
    const SmallHeight = Math.floor(ImageHeight / 3);
    const SmallWidth = Math.floor(windowWidth / 3.5);

    useEffect(() => {
        console.log('myPicture state:', myPicture);
        setLoading(false);  // 블러 상태가 이미 상위 컴포넌트에서 설정되므로, 별도 데이터 로드가 필요 없음
    }, [myPicture]);

    const changeImage = () => {
        setIsFrontShowing(!isFrontShowing);
    };

    const getBlurIntensity = (isFront) => {
        if (myPicture === "none") return 50;
        if ((myPicture === "front" && !isFront) || (myPicture === "back" && isFront)) {
            return 50;
        }
        return 0;
    };

    const renderOverlayText = (isFront) => {
        if (myPicture === "back" && isFront) {
            return "당신의 얼굴을\n보고싶어요!";
        } else if (myPicture === "front" && !isFront) {
            return "당신이 바라보는\n풍경이 궁금해요!";
        }
        return null;
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
                <View>
                    <Image
                        source={{ uri: isFrontShowing ? (front_image || defaultImage) : (back_image || defaultImage) }}
                        style={[styles.smallImage, { height: SmallHeight, width: SmallWidth }]}
                        blurRadius={Platform.OS === 'android' ? getBlurIntensity(isFrontShowing) : 0}
                    />
                    <BlurView intensity={getBlurIntensity(isFrontShowing)} style={styles.blurView}>
                        {renderOverlayText(isFrontShowing) && (
                            <Text style={styles.overlayTextSmall}>{renderOverlayText(isFrontShowing)}</Text>
                        )}
                    </BlurView>
                </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={changeImage} style={{ zIndex: 1 }}>
                <View>
                    <Image
                        source={{ uri: isFrontShowing ? (back_image || defaultImage) : (front_image || defaultImage) }}
                        style={[styles.largeImage, { height: ImageHeight, width: windowWidth }]}
                        blurRadius={Platform.OS === 'android' ? getBlurIntensity(!isFrontShowing) : 0}
                    />
                    <BlurView intensity={getBlurIntensity(!isFrontShowing)} style={styles.blurView}>
                        {renderOverlayText(!isFrontShowing) && (
                            <Text style={styles.overlayText}>{renderOverlayText(!isFrontShowing)}</Text>
                        )}
                    </BlurView>
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
        borderWidth: 1,
    },
    largeImage: {
        width: '100%',
    },
    blurView: {
        justifyContent: 'center',
        alignItems: 'center',
        ...StyleSheet.absoluteFillObject,
    },
});

export { ImageButton };