import React from 'react';
import styled from "styled-components/native";

const Container = styled.View`
	flex: 1;
	justify-content: center;
	align-items: center;
	background-color: #FFFFFF;
`; // 스타일 Container
const StyledText = styled.Text`
font-size: 30px;
		color: #111111;
`; // 스타일 Text

export const MainFeed = () => {
	return (
		<Container>
			<StyledText>MainFeed</StyledText>
		</Container>
	)
}
export const Camera = () => {
	return (
		<Container>
			<StyledText>Camera</StyledText>
		</Container>
	)
}
export const Community = () => {
	return (
		<Container>
			<StyledText>Community</StyledText>
		</Container>
	)
}
