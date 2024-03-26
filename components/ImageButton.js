import React, { useState, useEffect } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';

export const ImageButton = ({ author, images }) => { // images prop 추가
	const [imageIndex, setImageIndex] = useState(0);
	
	const changeImage = () => {
		setImageIndex(prevIndex => (prevIndex + 1) % images.length);
	};
	
	// 기본 이미지 혹은 대체 이미지 설정
	const defaultImages = [
		"https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=150&h=150&fit=crop",
		"https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=450&h=450&fit=crop"
	];
	
	// 이미지 배열이 비어있지 않으면 사용, 그렇지 않으면 기본 이미지 사용
	const firstImageUri = images.length > 0 ? images[0] : defaultImages[0];
	const secondImageUri = images.length > 1 ? images[1] : firstImageUri;
	
	return (
		<View style={{ position: 'relative' }}>
			<TouchableOpacity onPress={() => changeImage()} style={{ zIndex: 2, position: 'absolute', top: 10, left: 10 }}>
				<Image
					source={{ uri: imageIndex === 0 ? firstImageUri : secondImageUri }}
					style={{
						borderColor: '#ffffff',
						borderWidth: 2,
						height: 150,
						width: 100,
						resizeMode: 'stretch',
					}}
				/>
			</TouchableOpacity>
			<TouchableOpacity onPress={() => changeImage()} style={{ zIndex: 1 }}>
				<Image
					source={{ uri: imageIndex === 0 ? secondImageUri : firstImageUri }}
					style={{
						height: 480,
						width: '100%',
						resizeMode: 'stretch'
					}}
				/>
			</TouchableOpacity>
		</View>
	);
};




