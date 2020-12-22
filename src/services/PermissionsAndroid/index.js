import {Alert, PermissionsAndroid} from 'react-native';
const ACCESS_FINE_LOCATION = 'android.permission.ACCESS_FINE_LOCATION';
const ACCESS_COARSE_LOCATION = 'android.permission.ACCESS_COARSE_LOCATION';
const RESULTS_GRANTED = PermissionsAndroid.RESULTS.GRANTED;

export const verifyPermissionLocation = async () => {
  try {
    return PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const requestLocationPermissionAndroid = async () => {
  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ]);

    return (granted[ACCESS_FINE_LOCATION] === granted[ACCESS_COARSE_LOCATION]) === RESULTS_GRANTED;
  } catch (err) {
    console.warn(err);
    return Alert.alert('Permissao necessaria');
  }
};
