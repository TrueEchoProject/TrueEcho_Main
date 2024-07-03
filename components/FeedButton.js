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
                    end={{ x: 0, y: 1 }}
                    style={styles.gradientButton}
                >
                    <Text style={styles.selectedText}>{title}</Text>
                </LinearGradient>
            ) : (
                <View style={styles.unselectedButton}>
                    <Text style={styles.unselectedText}>{title}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    touchable: {
        marginRight: 10,
        marginLeft: 10,
        height: 50, // 높이를 원래대로 설정
        width: 90, // 너비를 더 크게 설정하여 패딩을 적용
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'black', // 배경색을 검정으로 설정
        paddingHorizontal: 5, // 좌우 패딩을 추가하여 경계선을 덮음
        borderRadius: 15, // 테두리를 둥글게 설정
    },
    gradientButton: {
        borderRadius: 10,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 0, // 경계선을 완전히 제거
    },
    selectedText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
    unselectedButton: {
        backgroundColor: 'black',
        borderRadius: 10,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 0, // 경계선을 완전히 제거
    },
    unselectedText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
});

export default React.memo(FeedButton);