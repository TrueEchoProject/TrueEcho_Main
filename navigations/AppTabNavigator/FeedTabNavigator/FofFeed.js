import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default class FofFeed extends Component {
	render() {
		return (
			<View style={style.container}>
				<Text>FoFFeed</Text>
			</View>
		);
	}
}

const style = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	}
});