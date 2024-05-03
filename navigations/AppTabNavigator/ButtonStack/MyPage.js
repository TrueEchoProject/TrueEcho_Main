import React, { useState, useCallback, useEffect } from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { AntDesign, FontAwesome5 } from '@expo/vector-icons';
import PagerView from "react-native-pager-view";
import axios from "axios";
import {useFocusEffect} from "@react-navigation/native";
import {Image} from "expo-image";

const MyPage = () => {
	const [userData, setUserData] = useState(null); // 초기 상태를 null로 설정
	const [pinData, setPinData] = useState([1, 2, 3, 4]);
	
	const fetchUser = async () => {
		if (userData) {
			return;
		}
		try {
			const response = await axios.get(`http://192.168.0.3:3000/user_me`);
			const user = response.data[0]; // 데이터 배열의 첫 번째 객체 접근
			setUserData(user);
		} catch (error) {
			console.error('Error fetching user', error);
		}
	};
	
	useEffect(() => {
		if (userData) {
			console.log(userData.profile_url);
			console.log(userData.username);
		}
	}, [userData]); // userData 변화 감지
	
	useFocusEffect(
		useCallback(() => {
			fetchUser();
		}, [])
	);
	
	return (
		userData ? (
			<View style={styles.container}>
				<View style={styles.topContainer}>
					<Image
						source={userData.profile_url}
						style={styles.avatar}
					/>
					<View style={styles.textContainer}>
						<Text style={styles.name}>{userData.username}</Text>
						<FontAwesome5
							name="crown"
							style={{ marginLeft: 10, marginBottom: 10 }}
							size={24}
							color="blue"
						/>
					</View>
					<View style={styles.textContainer}>
						<Text>{userData.user_vote}</Text>
					</View>
				</View>
				<View style={styles.pinsContainer}>
					<Text style={styles.pinsTitle}>Pins</Text>
					{(!pinData || pinData.length === 0) ? (
						<View style={[styles.pagerView, styles.pageStyle]}>
							<TouchableOpacity
								style={{
									alignItems: "center",
									padding: 30,
								}}
							>
								<AntDesign
									name="plussquareo"
									size={40}
									style={{
										margin: 20,
									}}
									color="white"
								/>
								<Text style={[styles.pinsText, {textAlign: 'center'}]}>핀을{'\n'}추가해보세요!</Text>
							</TouchableOpacity>
						</View>
					) : (
						<PagerView style={styles.pagerView}>
							{pinData.map((number) => (
								<View key={number} style={styles.pageStyle}>
									<Text style={styles.pinsText}>{number}</Text>
								</View>
							))}
						</PagerView>
					)}
				</View>
			</View>
		) : (
			<View style={styles.container}>
				<Text>데이터 로딩 중...</Text>
			</View>
		)
	)
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	topContainer: {
		flexGrow: 0,
		margin: 15,
		marginBottom: 10,
	},
	pinsContainer: {
		flex: 1,
		marginHorizontal: 15,
		marginBottom: 20, // 하단 마진을 추가합니다.
	},
	pinsTitle: {
		fontSize: 25,
		fontWeight: "300",
	},
	pinsText: {
		fontSize: 25,
		fontWeight: "300",
		color: "white"
	},
	pagerView: {
		flex: 1,
	},
	pageStyle: {
		marginTop: 10,
		justifyContent: 'center', // 자식 컴포넌트를 수직 방향으로 중앙 정렬
		alignItems: 'center',     // 자식 컴포넌트를 수평 방향으로 중앙 정렬
		borderRadius: 10,
		backgroundColor: 'grey',   // 배경 색상은 예시이며 변경 가능합니다
	},
	textContainer: {
		flexDirection: "row",
		alignItems: 'flex-end',
		marginTop: 5,
	},
	avatar: {
		width: 70,
		height: 70,
		borderRadius: 35,
	},
	name: {
		fontSize: 30,
		fontWeight: "300",
	},
})
export default MyPage;