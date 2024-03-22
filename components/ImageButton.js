import React, { useState, useEffect } from 'react';
import { Image, TouchableOpacity, View, Text } from 'react-native';

export const ImageButton = ({  }) => {
	// 이미지 URL 상태와 현재 인덱스 상태를 정의합니다.
	const [images, setImages] = useState([]);
	const [imageIndex, setImageIndex] = useState(0);
	
	// API에서 이미지 데이터를 가져오는 함수
	const fetchFeeds = async () => {
		const data = {
			id: 1,
			jsonrpc: "2.0",
			method: "call",
			params: [
				"database_api",
				"get_discussions_by_created",
				[{ tag: "kr", limit: 20 }] // 'start_author'를 사용해 특정 피드의 데이터를 요청
			]
		};
		
		try {
			const response = await fetch('https://api.steemit.com', {
				method: 'POST',
				body: JSON.stringify(data)
			});
			const jsonResponse = await response.json();
			const feeds = jsonResponse.result || [];
			
			// 피드에서 이미지 URL을 추출하여 상태를 업데이트합니다.
			const extractedImages = feeds.map(feed => {
				try {
					const metadata = JSON.parse(feed.json_metadata);
					if (metadata.image && metadata.image.length > 0) {
						return metadata.image[0];
					}
				} catch (error) {
					console.error('Error parsing json_metadata:', error);
				}
				return null;
			}).filter(url => url !== null); // null 값을 제거합니다.
			
			setImages(extractedImages);
		} catch (error) {
			console.error('Error fetching images:', error);
		}
	};
	
	// feedId 의존성 추가로 인해 컴포넌트가 마운트될 때와 feedId가 변경될 때 이미지 데이터를 가져옵니다.
	useEffect(() => {
		fetchFeeds();
	}, []);
	
	// 버튼 클릭 시 이미지 인덱스를 변경하는 함수
	const changeImage = () => {
		setImageIndex(prevIndex => (prevIndex === 0 ? 1 : 0));
	};
	
	// 이미지가 아직 로드되지 않았다면, 로딩 중임을 표시합니다.
	if (images.length === 0) {
		return (
			<View>
				<Text>Loading...</Text>
			</View>
		);
	}
	
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
};




