import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import { FontAwesome5, AntDesign, FontAwesome6, MaterialIcons, Entypo, Ionicons } from '@expo/vector-icons';

const MyOptions = () =>{
	return (
		<View style={styles.container}>
			<ScrollView style={{
				margin:20,
			}}>
				<View style={{
					flexDirection: "row",
					alignItems: "center",
					padding:20,
					borderRadius: 15,
					backgroundColor: "#99A1B6",
					margin: 10,
				}}>
					<View style={{
						width: 74,
						height: 74,
						borderRadius: 37,
						backgroundColor: 'white',
					}}/>
					<View style={{
						marginLeft: 10,
					}}>
						<Text style={{
							fontSize: 25,
							fontWeight: "300",
						}}>
							박신형
						</Text>
						<Text style={{
							fontSize: 20,
							fontWeight: "300",
						}}>
							sin1234
						</Text>
					</View>
				</View>
				<View style={{
					margin: 10,
				}}>
					<Text style={{
						fontSize: 20,
						fontWeight: "300",
						marginBottom: 10,
					}}>
						기능
					</Text>
					<View style={{
						flexDirection: "row",
						alignItems: "center",
						padding: 20,
						borderRadius: 15,
						backgroundColor: "#99A1B6",
					}}>
						<FontAwesome5
							name="calendar-alt"
							style={{
								marginRight: 15,
							}}
							size={30}
							color="black"
						/>
						<Text style={{
							fontSize: 20,
							fontWeight: "300",
						}}>
							캘린더
						</Text>
					</View>
				</View>
				<View style={{
					margin: 10,
				}}>
					<Text style={{
						fontSize: 20,
						fontWeight: "300",
						marginBottom: 10,
					}}>
						설정
					</Text>
					<View style={{
						flexDirection: "row",
						alignItems: "center",
						padding: 20,
						borderRadius: 15,
						backgroundColor: "#99A1B6",
						marginBottom: 10,
					}}>
						<AntDesign
							name="bells"
							style={{
								marginRight: 15,
							}}
							size={30}
							color="black"
						/>
						<Text style={{
							fontSize: 20,
							fontWeight: "300",
						}}>
							알림
						</Text>
					</View>
					<View style={{
						flexDirection: "row",
						alignItems: "center",
						padding: 20,
						borderRadius: 15,
						backgroundColor: "#99A1B6",
						marginBottom: 10,
					}}>
						<FontAwesome6
							name="user-shield"
							style={{
								marginRight: 15,
							}}
							size={30}
							color="black"
						/>
						<Text style={{
							fontSize: 20,
							fontWeight: "300",
						}}>
							개인정보 보호
						</Text>
					</View>
					<View style={{
						flexDirection: "row",
						alignItems: "center",
						padding: 20,
						borderRadius: 15,
						backgroundColor: "#99A1B6",
						marginBottom: 10,
					}}>
						<MaterialIcons
							name="phonelink-ring"
							style={{
								marginRight: 15,
							}}
							size={30}
							color="black"
						/>
						<Text style={{
							fontSize: 20,
							fontWeight: "300",
						}}>
							시간대
						</Text>
					</View>
				</View>
				<View style={{
					margin: 10,
				}}>
					<Text style={{
						fontSize: 20,
						fontWeight: "300",
						marginBottom: 10,
					}}>
						더보기
					</Text>
					<View style={{
						flexDirection: "row",
						alignItems: "center",
						padding: 20,
						borderRadius: 15,
						backgroundColor: "#99A1B6",
						marginBottom: 10,
					}}>
						<AntDesign
							name="sharealt"
							style={{
								marginRight: 15,
							}}
							size={30}
							color="black"
						/>
						<Text style={{
							fontSize: 20,
							fontWeight: "300",
						}}>
							공유
						</Text>
					</View>
					<View style={{
						flexDirection: "row",
						alignItems: "center",
						padding: 20,
						borderRadius: 15,
						backgroundColor: "#99A1B6",
						marginBottom: 10,
					}}>
						<Entypo
							name="chat"
							style={{
								marginRight: 15,
							}}
							size={30}
							color="black"
						/>
						<Text style={{
							fontSize: 20,
							fontWeight: "300",
						}}>
							도움받기
						</Text>
					</View>
				</View>
				<View style={{
					margin: 10,
					marginTop: 30,
				}}>
					<View style={{
						flexDirection: "row",
						alignItems: "center",
						padding: 20,
						borderRadius: 15,
						backgroundColor: "grey",
						marginBottom: 10,
					}}>
						<Entypo
							name="log-out"
							style={{
								marginRight: 15,
							}}
							size={30}
							color="black"
						/>
						<Text style={{
							fontSize: 20,
							fontWeight: "300",
						}}>
							로그아웃
						</Text>
					</View>
					<View style={{
						flexDirection: "row",
						alignItems: "center",
						padding: 20,
						borderRadius: 15,
						backgroundColor: "red",
						marginBottom: 10,
					}}>
						<Ionicons
							name="alert-circle"
							style={{
								marginRight: 15,
							}}
							size={30}
							color="black"
						/>
						<Text style={{
							fontSize: 20,
							fontWeight: "300",
						}}>
							계정 삭제
						</Text>
					</View>
				</View>
			</ScrollView>
		</View>
	);
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
})
export default MyOptions;