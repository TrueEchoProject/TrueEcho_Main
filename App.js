import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, Image, TextInput, Pressable, KeyboardAvoidingView } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AntDesign } from '@expo/vector-icons'; // expo 아이콘 라이브러리. 



export default function App() {
  const [continueBtn, setContinueBtn] = useState(false);

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
          keyboardType='email-adress'
          placeholder="이메일을 입력해주세요."
          style={styles.input}
        />
      </View>
      <KeyboardAvoidingView behavior="padding">
        <Pressable style={styles.ContinueBtn}> 
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: hp(3.5), }}>Continue</Text>
          <AntDesign name="arrowright" size={24} color="black" style={{ color: "#fff" }} />
        </Pressable>
      </KeyboardAvoidingView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: hp(10),
    justifyContent: "space-around"
  },
  logoImage: {
    
    width: wp(60),
    height: hp(15),
  },
  inputBox: {
    
    marginHorizontal: wp(8),
    marginTop: hp(5),
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
    backgroundColor: "#556389",
    marginTop: hp(2),
    paddingHorizontal: wp(3),
    borderRadius: 15,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp(2)
  },
});
