import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Container, Content, Icon } from 'native-base'; // Container, Content 추가로 import
import CardComponent from '../../components/CardComponent'; // 카드 컴포넌트 추가

export default class MainFeedTab extends Component {
	render() {
		return (
				<Container style={style.container}>
					<Content>
						<CardComponent />
	        </Content>
				</Container>
		);
	}
}

const style = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white'
	}
});