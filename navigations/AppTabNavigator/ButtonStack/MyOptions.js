import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome5, AntDesign, FontAwesome6, MaterialIcons, Entypo, Ionicons } from '@expo/vector-icons';
import { Image } from "expo-image";

const OptionText = ({ label }) => {
	return <Text style={styles.smallText}>{label}</Text>;
};
const OptionItem = ({ navigation, icon, iconType, label, backgroundColor = "#99A1B6" }) => {
	const IconComponent = iconType;
	return (
		<TouchableOpacity onPress={navigation}>
			<View style={[styles.View, { backgroundColor }]}>
				<IconComponent name={icon} style={{marginRight: 15}} size={30} color="black" />
				<Text style={styles.smallText}>{label}</Text>
			</View>
		</TouchableOpacity>
	);
};

const MyOptions = ({ navigation, route }) => {
	const [user, setUser] = useState({})
	
	useEffect(() => {
		if (route.params?.user) {
			console.log('Received user response:', route.params.user);
			setUser(route.params.user);
		}
	}, [route.params?.user]);
	
	useEffect(() => {
		if (user) {
			console.log('profile_url:', user.profile_url);
			console.log('user_vote:', user.user_vote);
			console.log('username:', user.username);
			console.log('user_Id:', user.user_Id);
			console.log('your_location:', user.your_location);
		}
	}, [user]);
	
	return (
		<View style={styles.container}>
			<ScrollView style={styles.scrollView}>
				<TouchableOpacity onPress={() => navigation.navigate('내 설정 편집', { user: user })} style={styles.View}>
					<Image source={{ uri: user.profile_url }} style={styles.Image}/>
					<View style={{ marginLeft: 10 }}>
						<Text style={styles.Text}>{user.username}</Text>
						<Text style={styles.Text}>{user.user_Id}</Text>
					</View>
				</TouchableOpacity>
				<View>
					<OptionText label="기능" />
					<OptionItem
						iconType={FontAwesome5}
						icon="calendar-alt"
						label="캘린더"
						navigation={() => navigation.navigate('캘린더')}
					/>
				</View>
				<View>
					<OptionText label="설정" />
					<OptionItem iconType={AntDesign} icon="bells" label="알림" />
					<OptionItem
						iconType={FontAwesome6}
						icon="user-shield"
						label="개인정보 보호"
					/>
					<OptionItem
						iconType={MaterialIcons}
						icon="phonelink-ring"
						label="시간대"
					/>
				</View>
				<View>
					<OptionText label="더보기" />
					<OptionItem iconType={AntDesign} icon="sharealt" label="공유" />
					<OptionItem iconType={Entypo} icon="chat" label="도움받기" />
				</View>
				<View style={{ marginTop: 30 }}>
					<OptionItem
						iconType={Entypo}
						icon="log-out"
						label="로그아웃"
						backgroundColor="grey"
					/>
					<OptionItem
						iconType={Ionicons}
						icon="alert-circle"
						label="계정 삭제"
						backgroundColor="red"
					/>
				</View>
			</ScrollView>
		</View>
	);
};
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	scrollView: {
		margin: 20,
	},
	View: {
		flexDirection: "row",
		alignItems: "center",
		padding: 20,
		borderRadius: 15,
		backgroundColor: "#99A1B6",
		marginBottom: 10,
	},
	Image: {
		width: 74,
		height: 74,
		borderRadius: 37,
		backgroundColor: 'white',
	},
	Text: {
		fontSize: 20,
		fontWeight: "300",
	},
	smallText: {
		fontSize: 18,
		fontWeight: "300",
		margin: 5,
	}
})
export default MyOptions;