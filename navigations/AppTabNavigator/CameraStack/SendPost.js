import React, { useState } from 'react';
import { View, TouchableOpacity, Button, StyleSheet, Text } from 'react-native';
import { Image } from 'expo-image';

const ImageDouble = React.memo(({ route }) => {
	
	const images = route.params.photoUris || [];
	const [imageIndex, setImageIndex] = useState(0);
	
	const changeImage = () => {
		if (images.length > 1) {
			setImageIndex(prevIndex => (prevIndex + 1) % images.length);
		}
	};
	
	const defaultImage = "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=450&h=450&fit=crop";
	const imageUri = images.length > 0 ? images[Math.min(imageIndex, images.length - 1)] : defaultImage;
	
	return (
		<View style={{ position: 'relative' }}>
			{images.length > 1 ? (
				<View>
					<TouchableOpacity onPress={changeImage} style={styles.smallImageTouchable}>
						<Image
							source={{ uri: images[(imageIndex + 1) % images.length] }}
							style={styles.smallImage}
						/>
					</TouchableOpacity>
					<TouchableOpacity onPress={changeImage} style={styles.imageTouchable}>
						<Image
							source={{ uri: images[imageIndex] }}
							style={styles.mainImage}
						/>
					</TouchableOpacity>
				</View>
			) : (
				<View style={styles.imageTouchable}>
					<Image
						source={{ uri: imageUri }}
						style={styles.mainImage}
					/>
				</View>
			)}
		</View>
	);
});

const styles = StyleSheet.create({
	smallImageTouchable: {
		zIndex: 2,
		position: 'absolute',
		top: 10,
		left: 10
	},
	smallImage: {
		borderColor: '#ffffff',
		borderWidth: 2,
		height: 100,
		width: 100
	},
	imageTouchable: {
		zIndex: 1
	},
	mainImage: {
		height: 400,
		width: 400,
	}
});

const SendPostStack = ({ navigation, route }) => {
	
	return (
		<View style={style.container}>
			<Text>SendPost</Text>
			<ImageDouble  route={route} />
			<Button
				title="ToCamera"
				onPress={() => navigation.navigate("CameraOption")}
			/>
		</View>
	);
};

const style = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	}
});

export default SendPostStack;