import React, { useState } from 'react';
import { TouchableOpacity, View, Dimensions, } from 'react-native';
import { Image } from 'expo-image';

const ImageButton = React.memo(({ front_image, back_image, containerHeight }) => {
	const [isFrontShowing, setIsFrontShowing] = useState(true); // 현재 보여지는 이미지가 전면 이미지인지 추적하는 상태
	const windowWidth = Dimensions.get('window').width;
	const changeImage = () => {
		setIsFrontShowing(!isFrontShowing); // 이미지 전환 함수
	};
	
	const ImageHeight = Math.floor(containerHeight);
	const SmallHeight = Math.floor(ImageHeight / 3);
	const SmallWidth = Math.floor(windowWidth / 3);
	return (
		<View style={{ position: 'relative' }}>
			<TouchableOpacity onPress={changeImage} style={{ zIndex: 2, position: 'absolute', top: 10, left: 10 }}>
				<Image
					source={{ uri: isFrontShowing ? back_image : front_image }}
					style={{
						borderColor: '#ffffff',
						borderWidth: 2,
						height: SmallHeight,
						width: SmallWidth
					}}
				/>
			</TouchableOpacity>
			<TouchableOpacity onPress={changeImage} style={{ zIndex: 1 }}>
				<Image
					source={{ uri: isFrontShowing ? front_image : back_image }}
					style={{
						height: ImageHeight,
						width: windowWidth,
					}}
				/>
			</TouchableOpacity>
		</View>
	)
})

export { ImageButton };




