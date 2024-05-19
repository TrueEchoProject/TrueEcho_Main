import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = {
  async set(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      console.log(`Data stored successfully with key: ${key}`);
    } catch (error) {
      console.error(`Error storing data with key ${key}:`, error);
    }
  },

  async get(key) {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error retrieving data with key ${key}:`, error);
      return null;
    }
  },

  async remove(key) {
    try {
      await AsyncStorage.removeItem(key);
      console.log(`Data removed successfully with key: ${key}`);
    } catch (error) {
      console.error(`Error removing data with key ${key}:`, error);
    }
  },
};

export default storage;

