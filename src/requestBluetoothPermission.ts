import * as Location from 'expo-location';
// eslint-disable-next-line react-native/split-platform-components
import {Alert, PermissionsAndroid, Platform} from 'react-native';

export const requestBluetoothPermission = async () => {
  if (Platform.OS === 'ios') {
    return true;
  }
  let fineLocation = true,
    scanConnect = true;
  if (Platform.OS === 'android') {
    const apiLevel = parseInt(Platform.Version.toString(), 10);

    if (apiLevel < 31 && PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      fineLocation = granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    if (
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN &&
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
    ) {
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);

      scanConnect =
        result['android.permission.BLUETOOTH_CONNECT'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        result['android.permission.BLUETOOTH_SCAN'] ===
          PermissionsAndroid.RESULTS.GRANTED;
    }

    const {status} = await Location.requestForegroundPermissionsAsync();

    return fineLocation && scanConnect && status === 'granted';
  }

  Alert.alert('Permission have not been granted');

  return false;
};
