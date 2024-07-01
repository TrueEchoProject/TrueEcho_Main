import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const FeedButton = ({ title, onPress, isSelected }) => {
    return (
        <TouchableOpacity onPress={onPress} style={styles.touchable}>
            {isSelected ? (
                <LinearGradient
                    colors={['#1BC5DA', '#263283']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.button}
                >
                    <Text style={styles.selectedText}>{title}</Text>
                </LinearGradient>
            ) : (
                <View style={styles.button}>
                    <Text style={styles.text}>{title}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    touchable: {
        marginRight: 10,
        marginLeft: 10,
        height: 50, // 높이 조정
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        paddingVertical: 12, // 패딩 조정
        paddingHorizontal: 25, // 패딩 조정
        borderRadius: 10, // 테두리 반경 조정
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white', // 기본 배경색
    },
    text: {
        color: '#3B4664', // 기본 텍스트 색상
        fontWeight: 'bold', // 텍스트 굵기
        fontSize: 18, // 텍스트 크기
    },
    selectedText: {
        color: 'white', // 선택됐을 때 텍스트 색상
        fontWeight: 'bold', // 선택됐을 때 텍스트 굵기
        fontSize: 18, // 선택됐을 때 텍스트 크기
    },
});

export default React.memo(FeedButton);
