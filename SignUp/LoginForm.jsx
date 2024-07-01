import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const ResultPage = ({ question, topRankList = [], thisWeek }) => {
  const maxVoteCount = topRankList.length > 0 ? Math.max(...topRankList.map(rank => rank.voteCount)) : 1;

  return (
    <View style={styles.page}>
      <Text style={styles.weekText}>{thisWeek} 랭킹</Text>
      <View style={[styles.profileContainer, topRankList.length === 1 ? styles.centerAlign : styles.spaceAround]}>
        {topRankList.map((rank, index) => (
          <View key={rank.id.toString()} style={styles.profileItem}>
            <Image source={{ uri: rank.profileUrl }} style={styles.profileImage} />
            <Text style={[styles.nicknameText, { color: colors[index % colors.length] }]}>
              {rank.nickname}
            </Text>
            <Text style={styles.rankText}>{index + 1}위 ({rank.voteCount} 표)</Text>
            <View style={styles.chartBarContainer}>
              <LinearGradient
                colors={['#1DBED6', '#273485']}
                style={[styles.chartBar, { height: `${(rank.voteCount / maxVoteCount) * 100}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const colors = [
  'rgba(255, 99, 132, 1)',
  'rgba(54, 162, 235, 1)',
  'rgba(255, 206, 86, 1)',
  'rgba(75, 192, 192, 1)',
  'rgba(153, 102, 255, 1)',
  'rgba(255, 159, 64, 1)',
];

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('5%'),
    backgroundColor: '#fff',
    borderRadius: wp('2%'),
    elevation: 3,
  },
  weekText: {
    fontSize: hp('2%'),
    color: '#333',
    fontWeight: '600',
    marginBottom: hp('2%'),
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: hp('3%'),
  },
  spaceAround: {
    justifyContent: 'space-around',
  },
  centerAlign: {
    justifyContent: 'center',
  },
  profileItem: {
    alignItems: 'center',
    marginHorizontal: wp('2%'),
  },
  profileImage: {
    width: wp('15%'),
    height: wp('15%'),
    borderRadius: wp('7.5%'),
    marginBottom: hp('1%'),
  },
  nicknameText: {
    fontSize: hp(2),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rankText: {
    fontSize: hp('2%'),
    color: '#333',
    textAlign: 'center',
  },
  chartBarContainer: {
    width: wp('10%'),
    height: hp('20%'),
    backgroundColor: '#e0e0e0',
    borderRadius: wp('1%'),
    overflow: 'hidden',
    marginTop: hp('1%'),
  },
  chartBar: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
});

export default ResultPage;
