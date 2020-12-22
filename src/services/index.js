/** @flow */
import {Platform, Alert} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import {CREATE_PASSWORD_TEXTS} from '../../Screens/CreateAccount/CreatePassword/screenTexts';
import {
  verifyPermissionLocation,
  requestLocationPermissionAndroid,
} from '../../utils/PermissionsAndroid';
import {cancelableErrorAlert} from '../../utils/genericAlerts';
import {get} from 'lodash';

///NOTE: API KEY GEOCODING temporária do Matheus Araújo
const GEOCODING_API_KEY = 'AIzaSyBAfYf7PEnjL4OYn05_-e_isTXXo49Pm38';
const MAPS_SDK_ANDROID_API_KEY = 'AIzaSyC2deLOujXw9QXVWYi186p_MsW0RS5n2MU';

const fetchAddress = async (latitude, longitude, callback) => {
  await axios
    .get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: `${latitude},${longitude}`,
        key: GEOCODING_API_KEY,
      },
    })
    .then(response => {
      if (response.status !== 'OK') {
        callback(null);
      }
      const addressFormatted = get(response.data, 'results[0].formatted_address', '');
      callback(addressFormatted);
    })
    .catch(error => {
      Alert.alert(error.message, CREATE_PASSWORD_TEXTS.tryAgain, [{text: 'OK'}], {
        cancelable: true,
      });
      callback(error);
    });
};

export const getLocationAsync = async callback => {
  if (Platform.OS === 'android') {
    try {
      const isGrantedPermission = await verifyPermissionLocation();

      if (!isGrantedPermission) {
        await requestLocationPermissionAndroid();
      }

      if (!(await verifyPermissionLocation())) {
        callback(null);
        return;
      }
    } catch (err) {
      console.log(err);
    }
  }

  try {
    await Geolocation.getCurrentPosition(
      position => {
        fetchAddress(position.coords.latitude, position.coords.longitude, callback);
      },
      error => {
        cancelableErrorAlert('Error to get coordinates', error.message);
        callback(error);
      },
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
    );
  } catch (err) {
    console.log(err);
  }
};
