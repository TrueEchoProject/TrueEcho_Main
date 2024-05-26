import React, { useState, useEffect } from 'react';
import { Platform, TouchableOpacity, View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';

const ImageButton = React.memo(({ front_image, back_image, containerHeight, windowWidth }) => {
	const [isFrontShowing, setIsFrontShowing] = useState(true);
	const [myPicture, setMyPicture] = useState("front");
	const [loading, setLoading] = useState(true);
	
	useEffect(() => {
		const loadImage = async () => {
			// 여기서 이미지 로드를 시뮬레이션하거나 필요한 데이터를 로드합니다.
			await new Promise(resolve => setTimeout(resolve, 1000)); // 예: 1초 대기
			setLoading(false);
		};
		
		loadImage();
	}, []);
	
	const changeImage = () => {
		setIsFrontShowing(!isFrontShowing);
	};
	
	const ImageHeight = Math.floor(containerHeight);
	const SmallHeight = Math.floor(ImageHeight / 3);
	const SmallWidth = Math.floor(windowWidth / 3);
	
	const defaultImage = "https://ppss.kr/wp-content/uploads/2020/07/01-4-540x304.png";
	
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
			<View style={styles.loaderContainer}>
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
				<View>
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
