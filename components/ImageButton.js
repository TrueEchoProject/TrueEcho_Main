import React, { useState, useEffect } from 'react';
import { Image, TouchableOpacity, View, Text } from 'react-native';

export const ImageButton = ({ author }) => {
	const [images, setImages] = useState([]);
	const [imageIndex, setImageIndex] = useState(0);
	
	const fetchImagesByAuthor = async () => {
		const data = {
			id: 1,
			jsonrpc: "2.0",
			method: "tags_api.get_discussions_by_author_before_date",
			params: {
				author: author,
				start_permlink: "",
				before_date: "2025-01-19T03:14:07",
				limit: 5
			}
		};
		
		try {
			const response = await fetch('https://api.steemit.com', {
				method: 'POST',
				body: JSON.stringify(data)
			});
			const jsonResponse = await response.json();
			const feeds = jsonResponse.result || [];
			
			const extractedImages = feeds.map(feed => {
				try {
					const metadata = JSON.parse(feed.json_metadata);
					if (metadata && metadata.image && metadata.image.length > 0) {
						return metadata.image[0];
					}
				} catch (error) {
					console.error('Error parsing json_metadata:', error);
				}
				return null;
			}).filter(url => url !== null);
			
			setImages(extractedImages);
		} catch (error) {
			console.error('Error fetching images:', error);
		}
	};
	
	// feedId 의존성 추가로 인해 컴포넌트가 마운트될 때와 feedId가 변경될 때 이미지 데이터를 가져옵니다.
	useEffect(() => {
		if (author) {
			fetchImagesByAuthor();
		}
	}, [author]);
	
	// 버튼 클릭 시 이미지 인덱스를 변경하는 함수
	const changeImage = () => {
		setImageIndex(prevIndex => (prevIndex + 1) % images.length);
	};
	
	// 이미지가 아직 로드되지 않았다면, 로딩 중임을 표시합니다.
	if (images.length === 0) {
		return (
			<View>
				<Text>Loading...</Text>
			</View>
		);
	}
	// 이미지 배열이 최소 2개의 이미지를 포함하고 있는지 확인
	const firstImageUri = images[0];
	const secondImageUri = images.length > 1 ? images[1] : firstImageUri; // 이미지가 1개만 있는 경우 동일 이미지 사용
	
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
						height: 450,
						width: '100%',
						resizeMode: 'stretch'
					}}
				/>
			</TouchableOpacity>
		</View>
	);
};




