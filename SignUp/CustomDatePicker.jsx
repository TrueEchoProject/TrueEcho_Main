import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const { width, height } = Dimensions.get('window');

const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const days = Array.from({ length: 31 }, (_, i) => i + 1);

const CustomDatePicker = ({ isVisible, onConfirm, onCancel }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  const handleConfirm = () => {
    const date = new Date(selectedYear, selectedMonth - 1, selectedDay);
    onConfirm(date);
  };

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
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
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onCancel} style={[styles.button, styles.cancelButton]}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={[styles.button, styles.confirmButton]}>
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: wp('80%'),
    height: hp('60%'), // 모달의 높이를 반응형으로 설정
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    justifyContent: 'space-between',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: hp('40%'), // pickerContainer의 높이를 조정
  },
  scrollView: {
    width: wp('20%'),
  },
  pickerItem: {
    padding: 10,
    fontSize: 20,
    textAlign: 'center',
  },
  selectedItem: {
    color: 'blue',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20, // 버튼과 pickerContainer 간의 간격 추가
  },
  button: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    alignItems: 'center',
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: 'red',
  },
  confirmButton: {
    backgroundColor: 'green',
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CustomDatePicker;
