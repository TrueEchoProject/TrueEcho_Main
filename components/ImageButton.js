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
				limit: 10
			}
		};
		
		try {
			const response = await fetch('https://api.steemit.com', {
				method: 'POST',
				body: JSON.stringify(data)
			});
			const jsonResponse = await response.json();
			const feeds = jsonResponse.result || [];
			
			let extractedImages = feeds.map(feed => {
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
			
			// 배열에서 최대 2개의 이미지만 유지
			extractedImages = extractedImages.slice(0, 2);
			
			setImages(extractedImages.length > 0 ? extractedImages : ["https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=150&h=150&fit=crop", "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=450&h=450&fit=crop"]);
		} catch (error) {
			console.error('Error fetching images:', error);
			setImages(["https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=150&h=150&fit=crop", "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=450&h=450&fit=crop"]); // 에러 발생 시 대체 이미지 사용
		}
	};
	
	useEffect(() => {
		if (author) {
			fetchImagesByAuthor();
		}
	}, [author]);
	
	const changeImage = () => {
		setImageIndex(prevIndex => (prevIndex + 1) % images.length);
	};
	
	const firstImageUri = images[0];
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
						height: 450,
						width: '100%',
						resizeMode: 'stretch'
					}}
				/>
			</TouchableOpacity>
		</View>
	);
};





