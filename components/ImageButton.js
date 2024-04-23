import React, { useState } from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { Image } from 'expo-image';

const ImageButton = React.memo(({ front_image, back_image, containerHeight, windowWidth }) => {
	const [isFrontShowing, setIsFrontShowing] = useState(true); // 현재 보여지는 이미지가 전면 이미지인지 추적하는 상태
	const [myStatus, setMyStatus] = useState("front")
	const changeImage = () => {
		setIsFrontShowing(!isFrontShowing);
	};
	
	const ImageHeight = Math.floor(containerHeight);
	const SmallHeight = Math.floor(ImageHeight / 3);
	const SmallWidth = Math.floor(windowWidth / 3);
	
	const defaultImage = "https://ppss.kr/wp-content/uploads/2020/07/01-4-540x304.png";
	// Calculate blurRadius for each image based on myStatus
	const getBlurRadius = (isFront) => {
		if (myStatus === "none") return 5;
		if ((myStatus === "front" && !isFront) || (myStatus === "back" && isFront)) {
			return 5;
		}
		return 0;
	};
	
	return (
		<View style={{ position: 'relative' }}>
			{ myStatus === "none" && (
				<View style={styles.overlayTextContainer}>
					<Text style={styles.overlayText}>
						게시물을 작성해보세요!
					</Text>
				</View>
			)}
			<TouchableOpacity onPress={changeImage} style={{ zIndex: 2, position: 'absolute', top: 10, left: 10 }}>
				<Image
					source={{ uri: isFrontShowing ? (back_image || defaultImage) : (front_image || defaultImage) }}
					style={{
						borderColor: '#ffffff',
						borderWidth: 2,
						height: SmallHeight,
						width: SmallWidth
					}}
					blurRadius={getBlurRadius(isFrontShowing)}
				/>
			</TouchableOpacity>
			<TouchableOpacity onPress={changeImage} style={{ zIndex: 1, position: 'relative' }}>
				<Image
					source={{ uri: isFrontShowing ? (front_image || defaultImage) : (back_image || defaultImage) }}
					style={{
						height: ImageHeight,
						width: windowWidth,
					}}
					blurRadius={getBlurRadius(!isFrontShowing)}
				/>
			</TouchableOpacity>
		</View>
	)
})

const styles = StyleSheet.create({
	overlayTextContainer: {
		zIndex: 5,
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)', // 투명 배경을 추가하여 이미지와의 구분을 쉽게 할 수 있습니다.
	},
	overlayText: {
		color: 'white',
		fontSize: 24,
		fontWeight: 'bold',
		textAlign: 'center'
	}
});

export { ImageButton };


