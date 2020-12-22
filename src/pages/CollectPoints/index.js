/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import React, {Component} from 'react';
import {View, StyleSheet, Text, Image, ScrollView, ActivityIndicator} from "react-native";
import {RectButton} from 'react-native-gesture-handler';
import MapView, {Marker} from 'react-native-maps';
import {SvgUri}  from "react-native-svg";
import {api} from "../../services/api";
import {requestLocationPermissionAndroid, verifyPermissionLocation} from "../../services/PermissionsAndroid";
import Geolocation from '@react-native-community/geolocation';

// Colors.darkß

export class CollectPoints extends Component
{
    constructor(props) {
        super(props);

        this.state = {
            collectItems: [{id: 0},{id: 1},{id: 2},{id: 3},{id: 4},{id: 5}],
            collectsPoints: [],
            loadingItems: false,
            selectedItems: [],
            latitude: -18.908375,
            longitude: -48.2692269,
            loadingMap: false,
        }
    }

    async componentDidMount() {
        this.handleCollectedItemFromAPI();
        await this.handleCurrentLocation();
        this.setState({loadingMap: true}, async () => await this.handleCollectsPointsFromAPI);
    }

    componentWillUnmount = () => {
        // Geolocation.clearWatch(this.watchID);
    }

    handleCollectsPointsFromAPI = async () =>
    {
        const {selectedItems} = this.state;

        if (!this.props.route) {
            return;
        }

        const {city, state} = this.props.route.params;

        // console.log('\n\n\n\n props', this.props.route.params, this.state, '\n\n\n\n city',city, state)
        try {
            const response = await api.get('collect_points', {
                    params:
                        {
                            city, //'Uberlândia',
                            UF: state,//'MG'
                            items: selectedItems,
                        }
                }
            );
            if (response.status === 200) {
                this.setState({collectsPoints: response.data})
                this.setState({loadingMap: false});
            }

        } catch(err) {
            console.log(err);
            this.setState({loadingMap: false, collectsPoints: []});
        }
    }

    handleCurrentLocation = async () =>
    {
        this.setState({loadingMap: true});

        if (Platform.OS === 'android' && !await verifyPermissionLocation()) {
            this.setState({loadingMap: false});
            return requestLocationPermissionAndroid();
        }


        try {
            Geolocation.getCurrentPosition(
                position =>
                {
                    const {latitude, longitude} = position.coords;
                    this.setState({latitude, longitude},
                        () => this.setState({loadingMap: false}));
                },
                error => console.log(error.message),
                {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
            );
        } catch (err) {
            console.log(err);
            this.setState({loadingMap: false});
        }
    }

    handleCollectedItemFromAPI = () =>
    {
        this.setState({loadingItems: true});

        api.get('collect_items')
            .then(response =>
            {
                if (response.status === 200) {
                    this.setState({collectItems: response.data},
                        () => this.setState({loadingItems: false}));
                    return;
                }
                this.setState({loadingItems: false});
            })
            .catch(err =>
            {
                console.log(err);
                this.setState({loadingItems: false});
            });
    }

    handleNavigateBack = () =>
    {
        this.props.navigation.navigate('Home');
    }

    handleNavigateToCollectPointDetail = (collectPointID) =>
    {
        this.props.navigation.navigate('CollectPointDetail', {collectPointID});
    }

    handleSelectedItem = id =>
    {
        this.setState({loadingMap: true});
        const {selectedItems} = this.state;

        if (!id) {
            return;
        }

        const alreadySelected = selectedItems.includes(id)
        const newSelectedItems = [...selectedItems];

        if (alreadySelected) {
            const indexItem = selectedItems.indexOf(id);
            newSelectedItems.splice(indexItem, 1);
        } else {
            newSelectedItems.push(id);
        }

        this.setState({selectedItems: newSelectedItems}, this.handleCollectsPointsFromAPI)
    }
// <Icon name="arrow-left" size={25} color="#34cb79"/>
    render() {

        const {collectItems, loadingItems, selectedItems, latitude, longitude, loadingMap, collectsPoints} = this.state;

        return (
            <>
                <View style={styles.container}>
                    <RectButton onPress={this.handleNavigateBack}>
                        <Text style={{color: '#34CB79'}}>Voltar</Text>
                    </RectButton>

                    <Text style={styles.title}>Bem Vindo!</Text>
                    <Text style={styles.description}>Encontre no mapa um local de coleta.</Text>

                    <View style={styles.mapContainer}>
                        <MapView
                            style={styles.map}
                            initialRegion={{
                                latitude,
                                longitude,
                                latitudeDelta: 0.019,
                                longitudeDelta: 0.019
                            }}
                            loadingEnabled={loadingMap}
                            showsUserLocation
                        >

                            {collectsPoints.map(({id, longitude, image_url, name, latitude}) => (
                                <Marker
                                    key={String(id)}
                                    style={styles.mapMarker}
                                    coordinate={{ latitude,  longitude}}
                                    onPress={() => this.handleNavigateToCollectPointDetail(id)}
                                >
                                    <View style={styles.mapMarkerContainer}>
                                        <Image style={styles.mapMarkerImage} source={{uri: image_url}}/>
                                        <Text style={styles.mapMarkerTitle}>{name.length > 13 ? name.slice(0, 13).concat('...') : name}</Text>
                                    </View>
                                </Marker>
                            ))
                            }
                        </MapView>
                    </View>

                </View>
                <View style={styles.itemsContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={true}
                        contentContainerStyle={{paddingHorizontal: 17, paddingBottom: 10}}
                    >
                        {  collectItems.map((item) =>
                            (
                                <RectButton
                                    key={String(item.id)}
                                    style={selectedItems.includes(item.id) ? [styles.item, styles.selectedItem] : styles.item }
                                    onPress={() => this.handleSelectedItem(item.id)}
                                >
                                    {loadingItems
                                        ? <ActivityIndicator color="#34cb79" size="large" style={{marginTop: 19}}/>
                                        : (<>
                                                <SvgUri width={42} height={42} uri={item.image_url} />
                                                <Text style={styles.itemTitle}>{item.title}</Text>
                                            </>
                                        )
                                    }
                                </RectButton>
                            )
                        )
                        }

                    </ScrollView>
                </View>
            </>
        );
    }

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 45, //Constants.statusBarHeight,
    },

    title: {
        fontSize: 20,
        // fontFamily: 'Ubuntu_700Bold',
        marginTop: 24,
    },

    description: {
        color: '#6C6C80',
        fontSize: 16,
        marginTop: 4,
        // fontFamily: 'Roboto_400Regular',
    },

    mapContainer: {
        flex: 1,
        width: '100%',
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 16,
    },

    map: {
        width: '100%',
        height: '100%',
    },

    mapMarker: {
        width: 100,
        height: 80,
    },

    mapMarkerContainer: {
        width: 100,
        height: 70,
        backgroundColor: '#34CB79',
        borderRadius: 8,
        flexDirection: 'column',
        overflow: 'hidden',
        alignItems: 'center'
    },

    mapMarkerImage: {
        width: 100,
        height: 45,
        resizeMode: 'cover',
    },

    mapMarkerTitle: {
        flex: 1,
        // fontFamily: 'Roboto_400Regular',
        color: '#FFF',
        fontSize: 13,
        lineHeight: 23,
    },

    itemsContainer: {
        flexDirection: 'row',
        marginTop: 16,
        marginBottom: 32,
    },

    item: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#eee',
        height: 120,
        width: 120,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 16,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'space-between',

        textAlign: 'center',
    },

    selectedItem: {
        borderColor: '#34CB79',
        backgroundColor: '#E1FAEC',
        borderWidth: 2,
    },

    itemTitle: {
        // fontFamily: 'Roboto_400Regular',
        textAlign: 'center',
        fontSize: 13,
    },
});
