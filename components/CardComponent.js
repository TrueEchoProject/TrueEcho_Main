import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Share } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { ImageButton } from "./ImageButton"; // 경로 확인 필요

export default function CardComponent({ data }) {
	const [isOptionsVisible, setIsOptionsVisible] = useState(false);
	const [buttonLayout, setButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
	
	const toggleOptionsVisibility = () => {
		setIsOptionsVisible(!isOptionsVisible);
	};
	
	const hideOptions = () => {
		if (isOptionsVisible) {
			setIsOptionsVisible(false);
		}
	};
	return (
		<TouchableWithoutFeedback onPress={hideOptions}>
			<View style={styles.cardContainer}>
				<View style={styles.cardItem}>
					<View style={styles.left}>
						<Image
							style={styles.thumbnail}
							source={{ uri: `https://steemitimages.com/u/${data.author}/avatar` }}
						/>
						<View style={styles.body}>
							<Text>{data.author}</Text>
							<Text note>{new Date(data.created).toDateString()}</Text>
						</View>
					</View>
					<TouchableOpacity style={styles.right} onPress={toggleOptionsVisibility} onLayout={(event) => {
						const layout = event.nativeEvent.layout;
						setButtonLayout(layout);
					}}>
						<Text style={{fontSize: 30}}>...</Text>
					</TouchableOpacity>
				</View>
				<ImageButton images={data.images} />
				{isOptionsVisible && (
					<View style={[
						styles.optionsContainer,
						{
							top: buttonLayout.y + buttonLayout.height - 5, // 버튼의 하단에 위치
							right: 0 // 화면의 오른쪽 끝에 위치
						}
					]}>
						<Text style={styles.optionItem}>옵션 1</Text>
						<Text style={styles.optionItem}>옵션 2</Text>
						{/* 기타 옵션들 */}
					</View>
				)}
				<View>
					<View style={styles.cardItem}>
						<Text style={styles.title}>{data.title.slice(0, 15)}</Text>
					</View>
					<View style={styles.cardItem}>
						<Text>{data.body.replace(/\n/g, ' ').slice(0, 15)}</Text>
					</View>
					<View style={styles.cardItem}>
						<View style={styles.left}>
							<TouchableOpacity style={styles.iconButton}>
								<Ionicons name='heart' style={styles.icon}/>
								<Text>{data.active_votes.length}</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.iconButton}>
								<Ionicons name='chatbubbles' style={styles.icon}/>
								<Text>{data.children}</Text>
							</TouchableOpacity>
							<TouchableOpacity onPress={() => Share.share({ message: `${data.title}: https://steemit.com/@${data.author}/${data.permlink}` })}>
								<MaterialIcons name='send' style={styles.icon}/>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</View>
		</TouchableWithoutFeedback>
		);
	}

const styles = StyleSheet.create({
	optionsContainer: {
		position: 'absolute',
		zIndex: 3,
		backgroundColor: 'white',
		padding: 8,
		borderRadius: 4,
		shadowColor: 'black',
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 4,
		shadowOpacity: 0.3,
		elevation: 4,
		marginTop: 10, // '...' 버튼과 옵션 컨테이너 사이의 간격을 조정하세요.
	},
	optionItem: {
		paddingVertical: 8,
		paddingHorizontal: 16,
	},
	cardContainer: {
		marginBottom: 16,
	},
	cardItem: {
		padding: 5,
		flexDirection: 'row',
		alignItems: 'center',
	},
	left: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	body: {
		marginLeft: 10,
	},
	thumbnail: {
		width: 30,
		height: 30,
		borderRadius: 15,
	},
	title: {
		fontWeight: '900',
	},
	iconButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 15,
	},
	icon: {
		marginRight: 4,
	},
	right: {
		marginLeft: 'auto',
	},
});
