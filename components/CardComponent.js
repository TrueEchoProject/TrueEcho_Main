import React, { Component } from 'react';
import {View, Image, Text, StyleSheet, TouchableOpacity,} from 'react-native';
import { Card, CardItem, Thumbnail, Body, Left, Right, Button } from 'native-base';
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { ImageButton } from "./ImageButton";


export default class CardCompnent extends Component{
	
	render() {
		const { data } = this.props;
		
		return (
			<View>
				<CardItem>
					<Left style={{ height: 35 }} >
						<Thumbnail
							small source={{ uri: `https://steemitimages.com/u/${data.author}/avatar` }} />
						<Body>
							<Text>{data.author}</Text>
							<Text note>{new Date(data.created).toDateString()}</Text>
						</Body>
					</Left>
				</CardItem>
				<ImageButton />
				<CardItem style={{ height: 20 }}>
					<Text>{ data.active_votes.length } likes</Text>
				</CardItem>
				<CardItem>
					<Text style={{ fontWeight:'900'}}>{ data.title.slice(0, 15) }</Text>
				</CardItem>
				<CardItem>
					<Text>
						{ data.body.replace(/\n/g,' ').slice(0, 15) }
					</Text>
				</CardItem>
				<CardItem style={{ height:20 }}>
					<Left>
						<Button transparent>
							<Ionicons name='heart' style={{ color:'black', marginRight: 5 }}/>
							<Text>{ data.active_votes.length }</Text>
						</Button>
						<Button transparent>
							<Ionicons name='chatbubbles' style={{ color:'black', marginRight: 5 }}/>
							<Text>{ data.children }</Text>
						</Button>
						<Button transparent>
							<MaterialIcons name='send' style={{ color:'black' }}/>
						</Button>
					</Left>
					<Right>
						<Text>{ data.pending_payout_value }</Text>
					</Right>
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