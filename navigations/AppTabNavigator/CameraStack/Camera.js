import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const Camera = ({ navigation }) => {
  return (
    <View style={style.container}>
      <Text>Camera</Text>
	    <Button
          title="ToSendPost"
          onPress={() => navigation.navigate("SendPost")}
	    />
    </View>
  );
};

const style = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	}
});

export default Camera;