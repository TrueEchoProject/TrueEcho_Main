import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import PagerView from 'react-native-pager-view';
import CardComponent from '../../../components/CardComponent';
import { useFocusEffect } from '@react-navigation/native';

const FofFeed = () => {
	const [feeds, setFeeds] = useState([]);
	const [refreshing, setRefreshing] = useState(false);
	const pagerViewRef = useRef(null);
	const lastFeed = useRef({}); // 마지막 피드 정보 저장용
	
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
			// 마지막 피드 정보 업데이트
			if (json.result.length > 0) {
				const lastElement = json.result[json.result.length - 1];
				lastFeed.current = {
					start_author: lastElement.author,
					start_permlink: lastElement.permlink,
				};
			}
		} catch (error) {
			console.error(error);
		} finally {
			setRefreshing(false);
			pagerViewRef.current?.setPageWithoutAnimation(0);
		}
	};
	
	const fetchMoreFeeds = async () => {
		const { start_author, start_permlink } = lastFeed.current;
		const data = {
			id: 1,
			jsonrpc: "2.0",
			method: "call",
			params: [
				"database_api",
				"get_discussions_by_created",
				[{
					tag: "kr",
					limit: 10,
					start_author, // 이전 요청의 마지막 피드를 시작점으로 설정
					start_permlink,
				}]
			]
		};
		try {
			const response = await fetch('https://api.steemit.com', {
				method: 'POST',
				body: JSON.stringify(data)
			});
			const json = await response.json();
			const newFeeds = json.result;
			
			// 중복 제거: 새로운 피드 목록에서 첫 번째 항목이 이전 마지막 피드와 동일하다면 제외
			if (newFeeds.length > 0 && newFeeds[0].author === start_author && newFeeds[0].permlink === start_permlink) {
				newFeeds.shift(); // 첫 번째 항목 제거
			}
			
			setFeeds(prevFeeds => [...prevFeeds, ...newFeeds]);
			
			// 마지막 피드 정보 업데이트
			if (newFeeds.length > 0) {
				const lastElement = newFeeds[newFeeds.length - 1];
				lastFeed.current = {
					start_author: lastElement.author,
					start_permlink: lastElement.permlink,
				};
			}
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
		<View style={style.container}>
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
						// 마지막 페이지에 도달하기 직전에 데이터 미리 불러오기
						if (newIndex === feeds.length - 2) {
							fetchMoreFeeds();
						}
					}}
				>
					{feeds.map((feed, index) => (
						<View key={index} style={{ flex: 1 }}>
							<CardComponent
								data={feed}
							/>
						</View>
					))}
				</PagerView>
			</ScrollView>
		</View>
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

export default FofFeed;