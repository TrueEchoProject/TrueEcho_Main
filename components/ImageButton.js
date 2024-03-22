import React, { useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';

export const ImageButton = () => {
	const [imageIndex, setImageIndex] = useState(0); // 이미지 인덱스 상태값
	
	const images = [
		'https://user-images.githubusercontent.com/3969643/51441420-b41f1c80-1d14-11e9-9f5d-af5cd3a6aaae.png',
		'https://user-images.githubusercontent.com/59547369/99194067-914ed980-27c0-11eb-8941-edee42e0f324.png'
	];
	
	// 버튼 클릭 시 이미지 변경
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




