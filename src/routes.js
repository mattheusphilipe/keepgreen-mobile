import React from "react";
import {NavigationContainer} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {Home} from "./pages/Home";
import {CollectPoints} from "./pages/CollectPoints";
import {CollectPointDetail} from "./pages/Detail";
import {NewCollectPoint} from "./pages/CollectPoints/NewCollectPoint";
const AppStack = createStackNavigator();

export const Routes = () =>
    (
        <NavigationContainer>
            <AppStack.Navigator
                headerMode="none"
                screenOptions={
                    {
                        cardStyle:
                            {
                                backgroundColor: '#f0f0f5'
                            },

                    }
                }
                initialRouteName="Home"
            >
                <AppStack.Screen name="Home" component={Home} />
                <AppStack.Screen name="CollectPoints" component={CollectPoints} options={{headerStyle: { backgroundColor: '#f0f0f5' }}}/>
                <AppStack.Screen name="CollectPointDetail" component={CollectPointDetail}/>
                <AppStack.Screen name="NewCollectPoint" component={NewCollectPoint}/>
            </AppStack.Navigator>
        </NavigationContainer>
    );
