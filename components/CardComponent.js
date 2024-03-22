import React, { Component } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { Card, CardItem, Thumbnail, Body, Left, Right, Button } from 'native-base';
import { MaterialIcons, Ionicons } from "@expo/vector-icons";


export default class CardCompnent extends Component{

	render(){
		return (
			<Card>
				<CardItem>
					<Left style={{ height: 35 }} >
						<Thumbnail
							small source={{ uri: 'https://steemitimages.com/u/anpigon/avatar' }} />
						<Body>
							<Text>Username</Text>
							<Text note>Jan 21, 2024</Text>
						</Body>
					</Left>
				</CardItem>
				<CardItem cardBody >
					<Image
						source={{ uri: 'https://user-images.githubusercontent.com/3969643/51441420-b41f1c80-1d14-11e9-9f5d-af5cd3a6aaae.png' }}
						style={{ height: 450, width: '100%' , resizeMode: 'stretch' }} />
				</CardItem>
				<CardItem style={{ height: 30}}>
					<Left>
						<Button transparent>
							<Ionicons name='heart' style={{ color:'black' }}/>
						</Button>
						<Button transparent>
							<Ionicons name='chatbubbles' style={{ color:'black' }}/>
						</Button>
						<Button transparent>
							<MaterialIcons name='send' style={{ color:'black' }}/>
						</Button>
					</Left>
				</CardItem>
				<CardItem>
					<Text>
						<Text style={{ fontWeight:'900'}}>Comment</Text>
					</Text>
				</CardItem>
			</Card>
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