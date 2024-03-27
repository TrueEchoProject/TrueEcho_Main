import React, { useState } from 'react';
import { TouchableOpacity, View, Dimensions, } from 'react-native';
import { Image } from 'expo-image';

const ImageButton = React.memo(({ images }) => {
	const [imageIndex, setImageIndex] = useState(0);
	const windowWidth = Dimensions.get('window').width;
	const windowHeight = Dimensions.get('window').height;
	
	const changeImage = () => {
		if (images.length > 1) {
			setImageIndex(prevIndex => (prevIndex + 1) % images.length);
		}
	};
	
	// 기본 이미지 혹은 대체 이미지 설정
	const defaultImage = "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=450&h=450&fit=crop";
	
	// 이미지 배열이 비어있지 않으면 사용, 그렇지 않으면 기본 이미지 사용
	const imageUri = images.length > 0 ? images[Math.min(imageIndex, images.length - 1)] : defaultImage;
	
	return (
		<View style={{ position: 'relative' }}>
			{images.length > 1 ? (
				<View>
					<TouchableOpacity onPress={changeImage} style={{ zIndex: 2, position: 'absolute', top: 10, left: 10 }}>
						<Image
							source={{ uri: images[(imageIndex + 1) % images.length] }}
							style={{
								borderColor: '#ffffff',
								borderWidth: 2,
								height: windowHeight * 0.2,
								width: windowWidth * 0.33,
							}}
						/>
					</TouchableOpacity>
					<TouchableOpacity onPress={changeImage} style={{ zIndex: 1 }}>
						<Image
							source={{ uri: images[imageIndex] }}
							style={{
								height: windowHeight * 0.6,
								width: windowWidth,
							}}
						/>
					</TouchableOpacity>
				</View>
			) : (
				<View style={{ zIndex: 1 }}>
					<Image
						source={{ uri: imageUri }}
						style={{
							height: windowHeight * 0.6,
							width: windowWidth,
						}}
					/>
				</View>
		)}
		</View>
	);
});

export { ImageButton };




