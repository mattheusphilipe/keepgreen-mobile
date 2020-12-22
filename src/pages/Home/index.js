/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState, useEffect} from 'react';
import {
    StyleSheet,
    Image,
    View,
    ActivityIndicator,
    Text,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import axios from 'axios';

import {RectButton} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import _sortBy from 'lodash/sortBy';

export function Home() {
    const [state, setState] = useState('');
    const [loadingCity, setLoadingCity] = useState(false);
    const [city, setCity] = useState('');
    const [loadingState, setLoadingState] = useState(false);
    const [states, setStates] = useState([]);
    const [citys, setCitys] = useState([]);
    const [showSelects, setShowSelects] = useState(false);

    useEffect(() =>
    {
        setLoadingState(true);
        axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
            .then((response) =>
            {
                if (response.status === 200)
                {
                    setStates(response.data)
                }
            })

            .catch(err => console.error(err))
            .finally(() => setLoadingState(false));


    }, [])

    useEffect(() =>
    {
        setLoadingCity(true);

        axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios`)
            .then((response) =>
            {
                if (response.status === 200)
                {
                    setCitys(response.data)
                }
                setLoadingCity(false);
            })
            .catch(err => {
                console.error(err)
                setLoadingCity(false);
            });

    }, [state]);

    const navigation = useNavigation();

    const handleNavigateToPoints = () => {
        if (!showSelects)
        {
            setShowSelects(true);
            return;
        }

        if (!state.length) {
            Alert.alert('Estado não selecionado', 'Selecione um estado para continuar');
            return;
        }

        if (!city.length) {
            Alert.alert('Cidade não selecionada', 'Selecione uma cidade para continuar');
            return;
        }
        navigation.push('CollectPoints',{city, state});

    }

    const handleNavigateNewCollectPoint = () => navigation.push('NewCollectPoint');


    function handleChangeCity(event: string) {
        if (!event) {
            return;
        }
        setCity(event);

    }

    function handleChangeState(event: string) {
        if (!event) {
            return;
        }
        setState(event);
    }

    const Loader = <ActivityIndicator style={ Platform.OS !== 'ios' ? {marginTop: 15} : {}} color="#34CB79" />;

    const handleLoadingCity = () => loadingCity ? Loader : null

    const handleLoadingState = () => loadingState ? Loader : null

    return (
        <ImageBackground
            source={require('../../assets/home-background.png')}
            style={styles.container}
            imageStyle={{width: 274, height: 368}}
        >
            <View style={styles.main}>
                <Image source={require('../../assets/logo.png')} />
                <View>
                    <Text style={styles.title}>Seu ambiente virtual de coleta de resíduos</Text>
                    <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</Text>
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? "padding" : undefined}
                style={styles.footer}
            >

                {
                    showSelects &&
                        <>
                            <View style={styles.input}>
                            <RNPickerSelect
                                onValueChange={handleChangeState}
                                Icon={handleLoadingState}
                                style={
                                    Platform.OS === 'ios'
                                        ? styles.inputIOS
                                        : styles.inputAndroid
                                }
                                doneText="Escolher"
                                placeholder={
                                    {
                                        label: 'Selecione um estado...',
                                        value: null,
                                        color: '#34CB79',
                                    }
                                }
                                items={
                                    _sortBy(states.map(({nome, sigla, id}) =>
                                            ({key: id, value: sigla, label: `${sigla} - ${nome}`})),
                                        ['label']
                                    )
                                }
                            />
                        </View>
                            <View style={styles.input}>
                            <RNPickerSelect
                            onValueChange={handleChangeCity}
                            Icon={handleLoadingCity}
                            style={
                            Platform.OS === 'ios'
                                ? styles.inputIOS
                                : styles.inputAndroid
                            }
                            doneText="Escolher"
                            placeholder={
                                {
                                    label: loadingCity ? `Carregando cidades de ${state}` : state.length ? `Selecione uma cidade de ${state}` : 'Selecione uma cidade...',
                                    value: null,
                                    color: '#34CB79',
                                }
                            }
                            items={

                                citys.map(({nome, id}) =>
                                    ({label: nome, value: nome, key: id}))
                            }
                            />
                            </View>
                    </>

                }

                <RectButton style={styles.button} onPress={handleNavigateToPoints}>
                    <View style={styles.buttonIcon}>
                        <Text>
                            {/*<Icon name="arrow-right" color="#FFF" size={24}/>*/}
                        </Text>
                    </View>
                    <Text style={styles.buttonText}>Ver pontos de coleta</Text>
                </RectButton>

                <RectButton style={styles.button} onPress={handleNavigateNewCollectPoint}>
                    <View style={styles.buttonIcon}>
                        <Text>
                            {/*<Icon name="arrow-right" color="#FFF" size={24}/>*/}
                        </Text>
                    </View>
                    <Text style={styles.buttonText}>Cadastrar ponto de coleta</Text>
                </RectButton>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 32,
    },

    main: {
        flex: 1,
        justifyContent: 'center',
    },

    title: {
        color: '#322153',
        fontSize: 32,
        // fontFamily: 'Ubuntu_700Bold',
        maxWidth: 260,
        marginTop: 64,
    },

    description: {
        color: '#6C6C80',
        fontSize: 16,
        marginTop: 16,
        // fontFamily: 'Roboto_400Regular',
        maxWidth: 260,
        lineHeight: 24,
    },

    footer: {},

    select: {},

    input: {
        paddingTop: Platform.OS === 'ios' ? 22 : 5,
        height: 60,
        backgroundColor: '#FFF',
        borderRadius: 10,
        marginBottom: 8,
        paddingHorizontal: 24,
    },

    button: {
        backgroundColor: '#34CB79',
        height: 60,
        flexDirection: 'row',
        borderRadius: 10,
        overflow: 'hidden',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: Platform.OS === 'ios' ? 10 : 5
    },

    buttonIcon: {
        height: 60,
        width: 60,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center'
    },

    buttonText: {
        flex: 1,
        justifyContent: 'center',
        textAlign: 'center',
        color: '#FFF',
        // fontFamily: 'Roboto_500Medium',
        fontSize: 18,
    },
    inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 2,
        borderColor: '#34CB79',
        backgroundColor: '#FFF',
        borderRadius: 4,
        color: 'black',
        paddingRight: 30, // to ensure the text is never behind the icon
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 2,
        borderColor: '#34CB79',
        backgroundColor: '#FFF',
        borderRadius: 8,
        color: 'black',
        paddingRight: 30, // to ensure the text is never behind the icon
    },
});
