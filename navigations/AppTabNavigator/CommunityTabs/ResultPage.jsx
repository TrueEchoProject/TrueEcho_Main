import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const ResultPage = ({ question, topRankList = [], thisWeek }) => {
  const maxVoteCount = topRankList.length > 0 ? Math.max(...topRankList.map(rank => rank.voteCount)) : 1;

  return (
    <View style={styles.page}>
      <Text style={styles.weekText}>{thisWeek} 랭킹</Text>
      <View style={styles.chartContainer}>
        {topRankList.slice(0, 3).map((rank, index) => {
          const barHeightPercent = (rank.voteCount / maxVoteCount) * 100;
          const profileBottom = hp('40%') * (barHeightPercent / 100) + hp('2%'); // 막대 그래프 꼭대기에 프로필을 배치

          return (
            <View key={rank.id.toString()} style={styles.profileItemContainer}>
              <View style={[styles.chartBarWrapper, { height: hp('40%') }]}>
                <View style={[styles.chartBar, { height: `${barHeightPercent}%` }]}>
                  <LinearGradient
                    colors={['#1DBED6', '#273485']}
                    style={styles.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  />
                </View>
              </View>
              <View style={[styles.profileItem, { bottom: profileBottom, width: wp('20%') }]}>
                <LinearGradient
                  colors={['#1BC5DA', '#263283']}
                  style={styles.profileImageBackground}
                >
                  <Image source={{ uri: rank.profileUrl }} style={styles.profileImage} />
                </LinearGradient>
                <Text style={styles.nicknameText}>
                  {rank.nickname}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'black',
    borderRadius: wp('2%'),
    elevation: 3,
    width: wp('100%'),
  },
  weekText: {
    fontSize: hp('2.5%'),
    color: '#fff',
    fontWeight: '600',
    marginVertical: hp('2%'),
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
    justifyContent: 'space-around',
    flex: 1,
  },
  profileItemContainer: {
    alignItems: 'center',
    width: wp('25%'),
    position: 'relative',
    justifyContent: 'flex-end',
  },
  profileItem: {
    backgroundColor: '#fff',
    borderRadius: wp('2%'),
    padding: wp('2%'),
    alignItems: 'center',
    position: 'absolute',
  },
  profileImageBackground: {
    width: wp('14.5%'),
    height: wp('14.5%'),
    borderRadius: wp('7.5%'),
    marginBottom: hp('1%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: wp('13%'),
    height: wp('13%'),
    borderRadius: wp('7.5%'),
    borderWidth:1.5,
    borderColor:"#fff"
  },
  nicknameText: {
    fontSize: hp('2%'),
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
  },
  chartBarWrapper: {
    width: wp('20%'),
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: '100%',
    borderRadius: wp('2%'),
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
});

export default ResultPage;
