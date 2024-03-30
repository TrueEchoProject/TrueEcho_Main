import React, { useState } from 'react';
import { TouchableOpacity, View, Dimensions, } from 'react-native';
import { Image } from 'expo-image';

// ImageButton 컴포넌트를 생성합니다. props로 images 배열과 containerHeight를 받습니다.
const ImageButton = React.memo(({ images, containerHeight }) => {
	// imageIndex 상태를 관리합니다. 기본값은 0입니다.
	const [imageIndex, setImageIndex] = useState(0);
	// 디바이스의 화면 너비를 가져옵니다.
	const windowWidth = Dimensions.get('window').width;
	
	// 이미지를 변경하는 함수입니다.
	const changeImage = () => {
		// 이미지 배열의 길이가 1보다 크면 실행합니다.
		if (images.length > 1) {
			// 이미지 인덱스를 업데이트합니다. 배열의 길이를 넘어가면 0으로 돌아갑니다.
			setImageIndex(prevIndex => (prevIndex + 1) % images.length);
		}
	};
	
	// 이미지의 높이와 작은 이미지의 높이, 너비를 계산합니다.
	const ImageHeight = Math.floor(containerHeight);
	const SmallHeight = Math.floor(ImageHeight / 3);
	const SmallWidth = Math.floor(windowWidth / 3);
	
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
								height: SmallHeight,
								width: SmallWidth
							}}
						/>
					</TouchableOpacity>
					<TouchableOpacity onPress={changeImage} style={{ zIndex: 1 }}>
						<Image
							source={{ uri: images[imageIndex] }}
							style={{
								height: ImageHeight,
								width: windowWidth,
							}}
						/>
					</TouchableOpacity>
				</View>
			) : (
				/* 이미지가 하나만 있거나 없을 경우 표시되는 View 컴포넌트입니다. */
				<View style={{ zIndex: 1 }}>
					<Image
						source={{ uri: imageUri }}
						style={{
							height: ImageHeight,
							width: windowWidth,
						}}
					/>
				</View>
		)}
		</View>
	);
});

export { ImageButton };




