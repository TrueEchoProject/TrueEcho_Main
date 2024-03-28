import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Share } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons, Ionicons, Feather } from "@expo/vector-icons";
import { ImageButton } from "./ImageButton"; // 경로 확인 필요

export default function CardComponent({ data }) {
	const [isOptionsVisible, setIsOptionsVisible] = useState(false);
	const [buttonLayout, setButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
	// 추가: ImageButton 컨테이너의 높이를 저장하기 위한 상태
	const [imageButtonHeight, setImageButtonHeight] = useState(0);
	const toggleOptionsVisibility = () => {
		setIsOptionsVisible(!isOptionsVisible);
	};
	// 추가: ImageButton 컨테이너의 높이를 측정하는 함수
	const onImageButtonLayout = (event) => {
		const { height } = event.nativeEvent.layout;
		setImageButtonHeight(height);
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
				<View style={styles.imageButtonContainer} onLayout={onImageButtonLayout}>
					<ImageButton images={data.images} containerHeight={imageButtonHeight} />
				</View>
				{isOptionsVisible && (
					<View style={[
						styles.optionsContainer,
						{
							top: buttonLayout.y + buttonLayout.height - 5, // 버튼의 하단에 위치
							right: 0 // 화면의 오른쪽 끝에 위치
						}
					]}>
						<TouchableOpacity style={{ flexDirection:'row', alignItems: 'center', marginBottom: 10, }}>
							<Ionicons name='eye-off' style={{ marginLeft: 10 }}/>
							<Text style={styles.optionItem}>현재 피드 숨기기</Text>
						</TouchableOpacity>
						<TouchableOpacity style={{ flexDirection:'row', alignItems: 'center', }}>
							<Feather name='alert-triangle' style={{ marginLeft: 10, color: 'red' }}/>
							<Text style={[styles.optionItem, {color: 'red'}]}>사용자 신고하기</Text>
						</TouchableOpacity>
					</View>
				)}
				<View style={{margin: 5}}>
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
	imageButtonContainer: {
		flex: 1,
	},
	optionsContainer: {
		position: 'absolute',
		zIndex: 2,
		backgroundColor: 'white',
		padding: 12,
		paddingLeft: 14,
		borderRadius: 4,
		shadowColor: 'black',
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 4,
		shadowOpacity: 0.3,
		elevation: 4,
		marginTop: 10, // '...' 버튼과 옵션 컨테이너 사이의 간격을 조정하세요.
	},
	optionItem: {
		marginLeft: 10,
		marginRight: 10,
		fontSize: 15,
	},
	cardContainer: {
		flex: 1, // 컨테이너가 전체 화면을 차지하도록 설정
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
