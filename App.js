/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */


import React from 'react';
import {
  StatusBar,
    Platform
} from 'react-native';
import {Routes} from "./src/routes";


const App: () => React$Node = () => {
  return (
    <>
      <StatusBar
          barStyle={Platform.OS === 'ios' ? "dark-content" : 'light-content'}
          backgroundColor="#34cb79"
          showHideTransition="slide"
          translucent
          animated
      />
      <Routes />
    </>
  );
};

export default App;
