import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome6 } from '@expo/vector-icons';

const years = [null, null, ...Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i), null, null];
const months = [null, null, ...Array.from({ length: 12 }, (_, i) => i + 1), null, null];
const days = [null, null, ...Array.from({ length: 31 }, (_, i) => i + 1), null, null];

const ITEM_HEIGHT = hp('6%'); // 각 아이템의 높이 (반응형으로 설정)

const CustomDatePicker = ({ onConfirm }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  const yearRef = useRef(null);
  const monthRef = useRef(null);
  const dayRef = useRef(null);

  const handleConfirm = () => {
    const date = new Date(selectedYear, selectedMonth - 1, selectedDay);
    onConfirm(date);
  };

  const formatNumber = (number) => {
    return number < 10 ? `0${number}` : `${number}`;
  };

  const scrollToIndex = (ref, index) => {
    ref.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5, // 화면 중앙에 오도록 설정
    });
  };

  const renderItem = ({ item, index }, type) => {
    if (item === null) {
      return <View style={[styles.pickerItem, { backgroundColor: 'transparent' }]} />;
    }

    return (
      <TouchableOpacity
        onPress={() => {
          if (type === 'year') {
            setSelectedYear(item);
            scrollToIndex(yearRef, index);
          } else if (type === 'month') {
            setSelectedMonth(item);
            scrollToIndex(monthRef, index);
          } else if (type === 'day') {
            setSelectedDay(item);
            scrollToIndex(dayRef, index);
          }
        }}
      >
        <Text style={[styles.pickerItem, item === (type === 'year' ? selectedYear : type === 'month' ? selectedMonth : selectedDay) && styles.selectedItem]}>
          {type === 'year' ? item : `- ${formatNumber(item)}`}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.pickerContainer}>
      <FlatList
        ref={yearRef}
        data={years}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={(item) => renderItem(item, 'year')}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        getItemLayout={(data, index) => (
          { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }
        )}
        initialScrollIndex={2} // 첫 번째 실제 값을 중앙에 표시
      />
      <FlatList
        ref={monthRef}
        data={months}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={(item) => renderItem(item, 'month')}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        getItemLayout={(data, index) => (
          { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }
        )}
        initialScrollIndex={new Date().getMonth() + 2} // 첫 번째 실제 값을 중앙에 표시
      />
      <FlatList
        ref={dayRef}
        data={days}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={(item) => renderItem(item, 'day')}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        getItemLayout={(data, index) => (
          { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }
        )}
        initialScrollIndex={new Date().getDate() + 1} // 첫 번째 실제 값을 중앙에 표시
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleConfirm} style={styles.circleButton}>
          <LinearGradient
            colors={['#1BC5DA', '#263283']}
            style={styles.circleButton}
          >
            <FontAwesome6 name="check" size={32} color="black" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    flexDirection: 'row',
    height: hp('15%'),
    width: wp('72%'),
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    // width: wp(22),
    fontSize: hp('4.5%'),
    textAlign:"left",
    color: '#FFFFFF',
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor:"#fff",
    // paddingVertical: hp(1),
  },
  selectedItem: {
    color: '#1BC6DA',
    fontWeight: 'bold',
    textAlign:"left"
  },
  buttonContainer: {
    flexDirection: 'row',
    alignSelf: "flex-end"
  },
  circleButton: {
    width: wp('10%'),
    height: wp('10%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: wp('7.5%'),
    marginLeft: wp(2),
    marginBottom: wp(2),
  },
});

export default CustomDatePicker;
