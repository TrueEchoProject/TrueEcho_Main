import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default class OtherFeed extends Component {
	render() {
		return (
			<View style={style.container}>
				<Text>OtherFeed</Text>
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