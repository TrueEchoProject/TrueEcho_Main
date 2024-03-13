import React from 'react';
import { View, Text, Image, TextInput, Pressable, KeyboardAvoidingView, StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AntDesign } from '@expo/vector-icons';

export default function LoginForm() {
  return (
    <View style={styles.container}>
      <View>
        <Image style={styles.logoImage} source={require('./assets/logo.png')} />
      </View>

      <View style={styles.inputBox}>
        <Text style={styles.text1}>Email 입력</Text>
        <Text style={styles.text2}>가입하기 위해서 Email이 필요해요!</Text>
        <Text style={styles.text3}>Email</Text>
        <TextInput
          keyboardType="email-address"
          placeholder="이메일을 입력해주세요."
          style={styles.input}
        />
      </View>
      <KeyboardAvoidingView behavior="padding">
        <Pressable style={styles.ContinueBtn}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: hp(3.5) }}>Continue</Text>
          <AntDesign name="arrowright" size={24} color="black" style={{ color: '#fff' }} />
        </Pressable>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: hp(5),
    justifyContent: 'space-between',
  },
  logoImage: {
    width: wp(60),
    height: hp(15),
  },
  inputBox: {
    marginHorizontal: wp(8),
    marginBottom: hp(5),
  },
  text1: { fontSize: hp(5), fontWeight: 'bold' },
  text2: { fontSize: hp(3), marginTop: hp(1) },
  text3: { fontSize: hp(3), color: '#aaa', marginTop: hp(3) },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: '#616997',
    paddingBottom: hp(1.5),
    marginTop: hp(1),
  },
  ContinueBtn: {
    width: wp(90),
    height: hp(7),
    backgroundColor: '#556389',
    paddingHorizontal: wp(3),
    borderRadius: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(2),
  },
});
