import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome6 } from '@expo/vector-icons';

const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const days = Array.from({ length: 31 }, (_, i) => i + 1);

const CustomDatePicker = ({ onConfirm }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  const handleConfirm = () => {
    const date = new Date(selectedYear, selectedMonth - 1, selectedDay);
    onConfirm(date);
  };

  return (
    <View style={styles.pickerContainer}>
      <ScrollView style={styles.scrollView}>
        {years.map((year) => (
          <TouchableOpacity key={year} onPress={() => setSelectedYear(year)}>
            <Text style={[styles.pickerItem, year === selectedYear && styles.selectedItem]}>{year}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView style={styles.scrollView}>
        {months.map((month) => (
          <TouchableOpacity key={month} onPress={() => setSelectedMonth(month)}>
            <Text style={[styles.pickerItem, month === selectedMonth && styles.selectedItem]}>{month}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView style={styles.scrollView}>
        {days.map((day) => (
          <TouchableOpacity key={day} onPress={() => setSelectedDay(day)}>
            <Text style={[styles.pickerItem, day === selectedDay && styles.selectedItem]}>{day}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleConfirm} style={styles.circleButton}>
          <LinearGradient
            colors={['#1BC5DA', '#263283']}
            style={styles.circleButton}
          >
            <FontAwesome6 name="check" size={40} color="black" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: hp('20%'), // pickerContainer의 높이를 반응형으로 조정
  },
  scrollView: {
    width: wp('25%'),
  },
  pickerItem: {
    padding: hp('1%'),
    fontSize: hp('3%'),
    textAlign: 'center',
    color: '#FFFFFF', // 기본 날짜 색상 흰색으로 설정
  },
  selectedItem: {
    color: '#1BC6DA', // 선택된 날짜 색상
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: hp('2%'), // 버튼과 pickerContainer 간의 간격 추가
  },
  button: {
    padding: hp('1%'),
    marginHorizontal: wp('1%'),
    alignItems: 'center',
    borderRadius: hp('1%'),
  },
  circleButton: {
    width: wp('15%'), // 너비와 높이를 동일하게 설정하여 동그라미 버튼으로 만듭니다.
    height: wp('15%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: wp('7.5%'), // 반지름을 너비의 절반으로 설정하여 동그라미 모양으로 만듭니다.
  },
  buttonText: {
    fontSize: hp('2%'),
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CustomDatePicker;
