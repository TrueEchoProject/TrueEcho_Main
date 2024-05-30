import React, { useState, useEffect } from 'react';
import { Platform, TouchableOpacity, View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import storage from '../AsyncStorage'; // storage.js 파일 위치에 따라 경로 수정함. 현재 임시 주소임.

const ImageButton = React.memo(({ front_image, back_image, containerHeight, windowWidth }) => {
	const [isFrontShowing, setIsFrontShowing] = useState(true);
	const [myPicture, setMyPicture] = useState("");
	const [loading, setLoading] = useState(true);
	const defaultImage = "https://ppss.kr/wp-content/uploads/2020/07/01-4-540x304.png";
	const ImageHeight = Math.floor(containerHeight);
	const SmallHeight = Math.floor(ImageHeight / 3);
	const SmallWidth = Math.floor(windowWidth / 3);
	
	useEffect(() => {
		const loadImage = async () => {
			const Front = await storage.get('postFront');
			const Back = await storage.get('postBack');
			console.log('Retrieved data:', Front);
			console.log('Retrieved data:', Back);
			if (Front && Back) {
				setMyPicture(""); // Both images exist
			} else if (Front) {
				setMyPicture("front"); // Only front image exists
			} else if (Back) {
				setMyPicture("back"); // Only back image exists
			} else {
				setMyPicture("none"); // Neither image exists
			}
			await new Promise(resolve => setTimeout(resolve, 20)); // 예: 1초 대기
			setLoading(false);
		};
		loadImage();
	}, []);
	
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
				<View style={{backgroundColor: "red"}}>
					<Image
						source={{ uri: isFrontShowing ? (front_image || defaultImage) : (back_image || defaultImage) }}
						style={[styles.smallImage, { height: SmallHeight, width: SmallWidth }]}
						blurRadius={Platform.OS === 'android' ? getBlurIntensity(isFrontShowing) : 0}
					/>
					{Platform.OS === 'ios' && (
						<BlurView intensity={getBlurIntensity(isFrontShowing)} style={styles.blurView}>
							{renderOverlayText(isFrontShowing) && (
								<Text style={styles.overlayTextSmall}>{renderOverlayText(isFrontShowing)}</Text>
							)}
						</BlurView>
					)}
					{Platform.OS === 'android' && renderOverlayText(isFrontShowing) && (
						<View style={styles.overlayTextContainer}>
							<Text style={styles.overlayTextSmall}>{renderOverlayText(isFrontShowing)}</Text>
						</View>
					)}
				</View>
			</TouchableOpacity>
			<TouchableOpacity onPress={changeImage} style={{ zIndex: 1 }}>
				<View style={{backgroundColor: "blue"}}>
					<Image
						source={{ uri: isFrontShowing ? (back_image || defaultImage) : (front_image || defaultImage) }}
						style={[styles.largeImage, { height: ImageHeight, width: windowWidth }]}
						blurRadius={Platform.OS === 'android' ? getBlurIntensity(!isFrontShowing) : 0}
					/>
					{Platform.OS === 'ios' && (
						<BlurView intensity={getBlurIntensity(!isFrontShowing)} style={styles.blurView}>
							{renderOverlayText(!isFrontShowing) && (
								<Text style={styles.overlayText}>{renderOverlayText(!isFrontShowing)}</Text>
							)}
						</BlurView>
					)}
					{Platform.OS === 'android' && renderOverlayText(!isFrontShowing) && (
						<View style={styles.overlayTextContainer}>
							<Text style={styles.overlayText}>{renderOverlayText(!isFrontShowing)}</Text>
						</View>
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
		justifyContent: 'center',
		alignItems: 'center',
		...StyleSheet.absoluteFillObject,
	},
});

export { ImageButton };
