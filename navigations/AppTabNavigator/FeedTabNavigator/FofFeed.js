import React, { useState, useRef, useCallback, Profiler } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text } from 'react-native';
import PagerView from 'react-native-pager-view';
import CardComponent from '../../../components/CardComponent';
import { useFocusEffect } from '@react-navigation/native';

const FofFeed = React.forwardRef((props, ref) => {
	const [feeds, setFeeds] = useState(null);
	const [refreshing, setRefreshing] = useState(false);
	const pagerViewRef = useRef(null);
	const lastFeed = useRef({});
	
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
			const feedsWithImages = json.result.map(feed => ({
				...feed,
				images: feed.json_metadata && JSON.parse(feed.json_metadata).image ? JSON.parse(feed.json_metadata).image.slice(0, 2) : []
			}));
			setFeeds(feedsWithImages);
			
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
					start_author,
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
			const newFeedsWithImages = json.result.map(feed => ({
				...feed,
				images: feed.json_metadata && JSON.parse(feed.json_metadata).image ? JSON.parse(feed.json_metadata).image.slice(0, 2) : []
			}));
			
			if (newFeedsWithImages.length > 0 && newFeedsWithImages[0].author === start_author && newFeedsWithImages[0].permlink === start_permlink) {
				newFeedsWithImages.shift(); // 첫 번째 요소가 중복되면 제거
			}
			
			setFeeds(prevFeeds => [...prevFeeds, ...newFeedsWithImages]);
			
			if (newFeedsWithImages.length > 0) {
				const lastElement = newFeedsWithImages[newFeedsWithImages.length - 1];
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
			if (!feeds) fetchFeeds(); // feeds가 비어있다면 피드를 불러옵니다.
		}, [])
	);
	
	React.useImperativeHandle(ref, () => ({
		refresh: fetchFeeds,
	}));
	
	if (!feeds) {
		return <View style={style.container}><Text>Loading...</Text></View>;
	}
	
	function onRenderCallback(
		id, // 프로파일러 트리의 id
		phase, // "mount" 또는 "update"
		actualDuration, // 컴포넌트 렌더링에 걸린 실제 시간
		baseDuration, // 메모이제이션하지 않았을 때 예상되는 기본 렌더링 시간
		startTime, // 렌더링이 시작된 시간
		commitTime, // 렌더링이 커밋된 시간
		interactions // 이 렌더링에 연관된 상호작용들의 집합
	) {
		console.log('Profiler ID:', id);
		console.log('Actual duration:', actualDuration);
		console.log('Base duration:', baseDuration);
	}
	
	return (
		<ScrollView
			contentContainerStyle={style.scrollViewContent}
			refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={fetchFeeds} />
			}
		>
			<PagerView
				style={style.pagerView}
				initialPage={0}
				ref={pagerViewRef}
				onPageSelected={e => {
					const newIndex = e.nativeEvent.position;
					if (newIndex === feeds.length - 8) {
						fetchMoreFeeds();
					}
				}}
			>
				{feeds.map((feed, index) => (
					<Profiler id={index} onRender={onRenderCallback}>
						<View key={index} style={{ flex: 1 }}>
							<CardComponent data={feed} />
						</View>
					</Profiler>
				))}
			</PagerView>
		</ScrollView>
	);
});

const style = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
		alignItems: 'center',
		justifyContent: 'center',
	},
	scrollViewContent: {
		flexGrow: 1,
	},
	pagerView: {
		flex: 1,
		backgroundColor: 'white',
	},
});

export default FofFeed;