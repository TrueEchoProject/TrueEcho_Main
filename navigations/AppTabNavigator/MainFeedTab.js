import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Container } from 'native-base';
import PagerView from 'react-native-pager-view';
import CardComponent from '../../components/CardComponent';
import { useFocusEffect } from '@react-navigation/native';

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
const MainFeedTab = () => {
	const [refreshing, setRefreshing] = useState(false);
	const pagerViewRef = useRef(null);
	
	const fetchMoreFeeds = async () => {
		const data = {
			id: 1,
			jsonrpc: "2.0",
			method: "call",
			params: [
				"database_api",
				"get_discussions_by_created",
				[{ tag: "kr", limit: 10 }]
			]
		};
		try {
			const response = await fetch('https://api.steemit.com', {
				method: 'POST',
				body: JSON.stringify({
					id: 1,
					jsonrpc: "2.0",
					method: "call",
					params: [
						"database_api",
						"get_discussions_by_created",
						[{ tag: "kr", limit: 10 }]
					]
				})
			});
			const json = await response.json();
			setFeeds(prevFeeds => [...prevFeeds, ...json.result]); // 기존 데이터에 추가 데이터 이어붙이기
		} catch (error) {
			console.error(error);
		}
	};
	
	);
	
	return (
		<Container style={style.container}>
			<ScrollView
				contentContainerStyle={style.scrollViewContent}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={fetchFeeds}
					/>
				}
			>
				<PagerView
					style={style.pagerView}
					initialPage={0}
					ref={pagerViewRef}
					onPageSelected={e => {
						const newIndex = e.nativeEvent.position;
						// 마지막 페이지에 도달하면 추가 데이터 로드
						if (newIndex === feeds.length - 1) {
							fetchMoreFeeds();
						}
					}}
				>
						</View>
					))}
				</PagerView>
			</ScrollView>
		</Container>
	);
}

const style = StyleSheet.create({
	container: {
		flex: 1,
