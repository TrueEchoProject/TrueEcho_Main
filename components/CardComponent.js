import React, { Component } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { ImageButton } from "./ImageButton"; // 경로 확인 필요

export default class CardComponent extends Component {
	
	render() {
		const { data } = this.props;
		
		return (
			<View style={styles.cardContainer}>
				<View style={styles.cardItem}>
					<View style={styles.left}>
						<Image
							style={styles.thumbnail}
							source={{ uri: `https://steemitimages.com/u/${data.author}/avatar` }} />
						<View style={styles.body}>
							<Text>{data.author}</Text>
							<Text note>{new Date(data.created).toDateString()}</Text>
						</View>
					</View>
				</View>
				<ImageButton author={data.author} />
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
						<TouchableOpacity onPress={() => Share.share({ message: 'hi' })}>
							<MaterialIcons name='send' style={styles.icon}/>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	cardContainer: {
		marginBottom: 16,
	},
	cardItem: {
		padding: 10,
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
