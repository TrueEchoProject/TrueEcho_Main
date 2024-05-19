import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import GetLocation from '../SignUp/GetLocation';
import axios from 'axios';

const FicLoc = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refresh, setRefresh] = useState(false);

    const handleLocationReceived = (lat, lon) => {
        console.log('Received new location:', { lat, lon });
        setLatitude(lat);
        setLongitude(lon);
        setLoading(false); // 위치를 받았을 때 로딩 종료
    };

    const handleConfirm = () => {
        const data = {
            location: [
                {
                    id: 1,
                    loc: latitude.toString(),
                    lon: longitude.toString()
                }
            ]
        };

        axios.post('http://192.168.0.27:3000/location', data) // 컴펌 클릭시, 다시 현재 위치를 서버에 전송.
            .then(response => {
                console.log('Location sent to server:', response.data);
            })
            .catch(error => {
                console.error('Error sending location:', error);
            });
        setModalVisible(false);
    };

    const handleRefresh = () => {
        setLoading(true); // 새로고침 시 로딩 시작
        setRefresh(prev => !prev);
    };

    useEffect(() => {
        if (modalVisible) {
            setLoading(true); // 모달이 열릴 때 로딩 시작
            axios.get('http://192.168.123.121:3000/location') // 서버에 저장되었던 위치를 보여줌. (이전에 저장되었던 위치.)
                .then(response => {
                    console.log('Fetched data from server:', response.data);
                    if (response.data && response.data.length > 0) {
                        const { lat, lon } = response.data[0];
                        console.log('Fetched initial location:', { lat, lon });
                        setLatitude(parseFloat(lat));
                        setLongitude(parseFloat(lon));
                    } else {
                        console.error('No location data available');
                    }
                    setLoading(false); // 위치를 가져왔을 때 로딩 종료
                })
                .catch(error => {
                    console.error('Error fetching initial location:', error);
                    setLoading(false); // 오류가 발생했을 때도 로딩 종료
                });
        }
    }, [modalVisible]);

    useEffect(() => {
        if (refresh) {
            setLoading(true); // refresh가 변경되면 로딩 시작
            // refresh가 변경될 때 GetLocation에서 새로운 위치를 받으면 handleLocationReceived에서 로딩 종료
        }
    }, [refresh]);

    return (
        <View style={styles.container}>
            <Button title="Show Modal" onPress={() => setModalVisible(true)} />
            <Modal
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>이전에 저장된 주소</Text>
                    {loading ? (
                        <ActivityIndicator size="large" color="#0000ff" />
                    ) : (
                        latitude !== null && longitude !== null && (
                            <MapView
                                style={styles.map}
                                region={{
                                    latitude: latitude,
                                    longitude: longitude,
                                    latitudeDelta: 0.0922,
                                    longitudeDelta: 0.0421,
                                }}
                            >
                                <Marker coordinate={{ latitude, longitude }} />
                            </MapView>
                        )
                    )}
                    <GetLocation onLocationReceived={handleLocationReceived} refresh={refresh} />
                    <View style={styles.buttonContainer}>
                        <Button title="현재 위치로 변경" onPress={handleRefresh} />
                        <Button title="Confirm" onPress={handleConfirm} />
                        <Button title="취소" onPress={() => setModalVisible(false)} />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        marginBottom: 20,
    },
    map: {
        width: '90%',
        height: '60%',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        width: '80%',
    },
});

export default FicLoc;
