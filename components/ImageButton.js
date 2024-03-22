import React, { useState, useEffect } from 'react';
import { Image, TouchableOpacity, View, Text } from 'react-native';

export const ImageButton = ({  }) => {
	// 이미지 URL 상태와 현재 인덱스 상태를 정의합니다.
	const [images, setImages] = useState([]);
	const [imageIndex, setImageIndex] = useState(0);
	
	
	const changeImage = () => {
		setImageIndex((imageIndex) => (imageIndex === 0 ? 1 : 0));
	};
	
	return (
		<View style={{ position: 'relative' }}>
			<TouchableOpacity onPress={changeImage} style={{ zIndex: 2, position: 'absolute', top: 10, left: 10 }}>
				<Image
					source={{ uri: images[imageIndex] }}
					style={{
						borderColor: '#ffffff',
						borderWidth: 2,
						height: 150,
						width: 100,
						resizeMode: 'stretch',
					}}
				/>
			</TouchableOpacity>
			<TouchableOpacity onPress={changeImage} style={{ zIndex: 1 }}>
				<Image
					source={{ uri: images[1 - imageIndex] }}
					style={{
						height: 450,
						width: '100%',
						resizeMode: 'stretch'
					}}
				/>
			</TouchableOpacity>
		</View>
	);
}




