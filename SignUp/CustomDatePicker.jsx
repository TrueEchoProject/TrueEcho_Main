import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome6 } from '@expo/vector-icons';

const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const days = Array.from({ length: 31 }, (_, i) => i + 1);

const ITEM_HEIGHT = hp('6%');
const LOOP_COUNT = 500; // 데이터를 너무 많이 반복하지 않도록 조정

const generateLoopedData = (array) => {
  return Array(LOOP_COUNT).fill(array).flat();
};

const loopedYears = generateLoopedData(years);
const loopedMonths = generateLoopedData(months);
const loopedDays = generateLoopedData(days);

const RenderItem = React.memo(({ item, type, selectedItem, onSelect }) => (
  <TouchableOpacity onPress={() => onSelect(item, type)}>
    <Text
      style={[
        styles.pickerItem,
        (type === 'year' && item === selectedItem.year) ||
        (type === 'month' && item === selectedItem.month) ||
        (type === 'day' && item === selectedItem.day)
          ? styles.selectedItem
          : null,
      ]}
    >
      {item}
    </Text>
  </TouchableOpacity>
));

const CustomDatePicker = ({ onConfirm }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  const yearFlatListRef = useRef(null);
  const monthFlatListRef = useRef(null);
  const dayFlatListRef = useRef(null);

  const getMiddleIndex = (array, item) => {
    const middle = Math.floor(array.length / 2);
    const originalIndex = array.indexOf(item);
    return middle + originalIndex;
  };

  useEffect(() => {
    scrollToMiddle(yearFlatListRef, getMiddleIndex(loopedYears, selectedYear), false);
    scrollToMiddle(monthFlatListRef, getMiddleIndex(loopedMonths, selectedMonth), false);
    scrollToMiddle(dayFlatListRef, getMiddleIndex(loopedDays, selectedDay), false);
  }, []);

  const scrollToMiddle = (ref, index, animated = true) => {
    ref.current?.scrollToIndex({
      index: index,
      animated: animated,
      viewPosition: 0.5,
    });
  };

  const handleConfirm = () => {
    const date = new Date(selectedYear, selectedMonth - 1, selectedDay);
    onConfirm(date);
  };

  const renderItem = ({ item, index, type }) => (
    <RenderItem
      item={item}
      type={type}
      selectedItem={{ year: selectedYear, month: selectedMonth, day: selectedDay }}
      onSelect={(item, type) => {
        if (type === 'year') setSelectedYear(item);
        if (type === 'month') setSelectedMonth(item);
        if (type === 'day') setSelectedDay(item);
        scrollToMiddle(
          type === 'year' ? yearFlatListRef :
          type === 'month' ? monthFlatListRef :
          dayFlatListRef,
          getMiddleIndex(
            type === 'year' ? loopedYears :
            type === 'month' ? loopedMonths :
            loopedDays,
            item
          )
        );
      }}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        <FlatList
          ref={yearFlatListRef}
          data={loopedYears}
          renderItem={({ item, index }) => renderItem({ item, index, type: 'year' })}
          keyExtractor={(item, index) => index.toString()}
          getItemLayout={(data, index) => (
            { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }
          )}
          showsVerticalScrollIndicator={false}
          initialScrollIndex={getMiddleIndex(loopedYears, selectedYear)}
          style={styles.scrollView}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          windowSize={21} // 한번에 렌더링 되는 아이템 수 조정
        />
        <FlatList
          ref={monthFlatListRef}
          data={loopedMonths}
          renderItem={({ item, index }) => renderItem({ item, index, type: 'month' })}
          keyExtractor={(item, index) => index.toString()}
          getItemLayout={(data, index) => (
            { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }
          )}
          showsVerticalScrollIndicator={false}
          initialScrollIndex={getMiddleIndex(loopedMonths, selectedMonth)}
          style={styles.scrollView}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          windowSize={21} // 한번에 렌더링 되는 아이템 수 조정
        />
        <FlatList
          ref={dayFlatListRef}
          data={loopedDays}
          renderItem={({ item, index }) => renderItem({ item, index, type: 'day' })}
          keyExtractor={(item, index) => index.toString()}
          getItemLayout={(data, index) => (
            { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }
          )}
          showsVerticalScrollIndicator={false}
          initialScrollIndex={getMiddleIndex(loopedDays, selectedDay)}
          style={styles.scrollView}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          windowSize={21} // 한번에 렌더링 되는 아이템 수 조정
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleConfirm} style={styles.circleButton}>
          <LinearGradient
            colors={['#1BC5DA', '#263283']}
            style={styles.circleButton}
          >
            <FontAwesome6 name="check" size={30} color="black" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  pickerContainer: {
    flexDirection: 'row',
    height: hp('20%'),
    flex: 1,
  },
  scrollView: {
    width: wp('20%'),
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    textAlign: 'center',
    fontSize: hp('4%'),
    color: '#FFFFFF',
    lineHeight: ITEM_HEIGHT,
  },
  selectedItem: {
    color: '#1BC6DA',
    fontWeight: 'bold',
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: hp('2%'),
  },
  circleButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: wp('7.5%'),
    width: wp('10%'),
    height: wp('10%'),
  },
  buttonText: {
    fontSize: hp('2%'),
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CustomDatePicker;
