import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Container } from 'native-base';
import PagerView from 'react-native-pager-view';
import CardComponent from '../../components/CardComponent';
import { useFocusEffect } from '@react-navigation/native';

const MainFeedTab = () => {
	const [feeds, setFeeds] = useState([]);
	const [refreshing, setRefreshing] = useState(false);
	const pagerViewRef = useRef(null);
	
	const fetchFeeds = async () => {
		setRefreshing(true);
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
				body: JSON.stringify(data)
			});
			const json = await response.json();
			setFeeds(json.result);
		} catch (error) {
			console.error(error);
		} finally {
			setRefreshing(false);
			pagerViewRef.current?.setPageWithoutAnimation(0);
		}
	};
	
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
	
	useFocusEffect(
		useCallback(() => {
			fetchFeeds();
		}, [])
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
					{feeds.map((feed, index ) => (
						<View key={index} style={{flex: 1}}>
							<CardComponent
								data={feed}
								
							/>
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
		backgroundColor: 'white',
	},
	scrollViewContent: {
		flexGrow: 1,
	},
	pagerView: {
		flex: 1,
	},
});

export default MainFeedTab;

