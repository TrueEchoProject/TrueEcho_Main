import React, { Component } from 'react';
import {View, Image, Text, StyleSheet, TouchableOpacity,} from 'react-native';
import { Card, CardItem, Thumbnail, Body, Left, Right, Button } from 'native-base';
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { ImageButton } from "./ImageButton";


export default class CardCompnent extends Component{

	render(){
		return (
			<View>
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
					<ImageButton />
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