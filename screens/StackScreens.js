import React from "react";
import styled from "styled-components/native";

cons Container = styled.View`
	flex: 1;
	justify-content: center;
	align-items: center;
	background-color: #FFFFFF;
`; // 스타일 Container
const StyledText = styled.Text`
font-size: 30px;
		color: #111111;
`; // 스타일 Text
export const MainFeed = () => { // 메인피드 화면 정보
	return (
		<Container>
			<StyledText>MainFeed</StyledText>
		</Container>
	);
}

export const Camera = () => { // 카메라 화면 정보
	return (
		<Container>
			<StyledText>Camera</StyledText>
		</Container>
	);
}

export const Community = () => { // 커뮤니티 화면 정보
	return (
		<Container>
			<StyledText>Community</StyledText>
		</Container>
	);
}

export const Friends = () => { // 친구 옵션 화면 정보
	return (
		<Container>
			<StyledText>Friends</StyledText>
		</Container>
	);
}

export const MyPage = () => { // 마이페이지 화면 정보
	return (
		<Container>
			<StyledText>MyPage</StyledText>
		</Container>
	);
}

export const MyOptions = () => { // 개인 설정 화면 정보
	return (
		<Container>
			<StyledText>MyOptions</StyledText>
		</Container>
	);
}