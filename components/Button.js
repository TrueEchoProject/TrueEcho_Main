import React from "react";
import { TouchableOpacity } from "react-native";
import { View } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";

export const Button1 = ({ onPress }) => { // 상단 친구 옵션 이동 버튼
	return (
		<TouchableOpacity onPress={onPress}>
			<View>
				< MaterialIcons name='peopleeee' size={30} style={{ height: 30, width:40, marginRight:10 }}/>
			</View>
		</ TouchableOpacity>sdfdsfsdf
	) 
}
export const Button2 = ({ onPress }) => { // 상단 마이페이지 이동 버튼
	return (
		<TouchableOpacity onPress={onPress}>
			<View>
				< MaterialIcons name='circlesss' size={30} style={{ height: 30, width:30, marginRight:10 }}/>
			</View>
		</ TouchableOpacity>
	)
}

export const Button3 = ({ onPress }) => { // ( 마이페이지 이동 후 ) 상단 개인 설정 이동 버튼
	return (
		<TouchableOpacity onPress={onPress}>
			<View>
				< MaterialIcons name='settinsgss' size={30} style={{ height: 30, width:30, marginRight:10 }}/>
			</View>
		</ TouchableOpacity>
	)
}
