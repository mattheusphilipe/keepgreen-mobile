import React, { Component} from 'react';
import {
    View,
    StyleSheet,
    Text,
    Image,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    ScrollView,
    Platform
} from "react-native";
import ImagePicker, {ImagePickerResponse} from 'react-native-image-picker';
import {RectButton} from 'react-native-gesture-handler';
import {SvgUri}  from "react-native-svg";
import {api} from "../../services/api";
import RNPickerSelect from "react-native-picker-select";
import _sortBy from "lodash/sortBy";
import axios from "axios";
import _get from 'lodash/get';

export class NewCollectPoint extends Component
{
    constructor(props) {
        super(props);

        this.state = {
            collectItems: [{id: 0},{id: 1},{id: 2},{id: 3},{id: 4},{id: 5}],
            loadingItems: false,
            selectedItems: [],
            formData: {
                name: '',
                cellphone: '',
                email: '',
                telephone: '',
                'zip-code': '',
                street: '',
                neighborhood: '',
                number: '',
            },
            image: null,
            state: '',
            states: [],
            citys: [],
            cepByCity: false,
            latitude: -14.1545764,
            longitude: -58.8996748,
            loadingMap: false,
            loadingCity: false,
            loadingCep: false,
            loadingState: false,
            loadingForm: false,
        }
    }

    componentDidMount() {
        this.handleCollectedItemFromAPI();
        this.handleStateFromAPI();
    }

    componentWillUnmount = () => {
        // Geolocation.clearWatch(this.watchID);
    }

    handleNavigateBack = () => this.props.navigation.navigate('Home');

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

    handleSelectedItem = (id) =>
    {
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

    handleStateFromAPI = () => {
        this.setState({loadingCity: true})
        axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
            .then((response) =>
            {
                if (response.status === 200)
                {
                    this.setState({states: response.data});
                }
            })

            .catch(err => console.error(err))
            .finally(() =>this.setState({loadingCity: false}));
    }

    handleCitysFromAPI = async () => {
        const {state, cityByCep} = this.state

        if (cityByCep) {
            return;
        }
        this.setState({loadingCity: true})

        try {

            const response = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios`);
            console.log(response.data[0])
            if (response.status === 200)
            {
                this.setState({citys: response.data});
            }
        }catch (err) {
            console.error(err)
        } finally {
            this.setState({loadingCity: false})
        }
    }
    handleImage = () =>
    {
        const options = {
            title:  'Selecione uma foto!',
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
        };

        ImagePicker.showImagePicker(options, (response: ImagePickerResponse) => {
            console.log('Response = ', response);

            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {

                // You can also display the image using data:
                // const source = { uri: 'data:image/jpeg;base64,' + response.data };
                this.setState({image: response.uri})
            }
        });
    }

    handleCEP = (cep: string) =>
    {
        const {cepByCity} = this.state;

        if (cepByCity) {
            this.handleStateFromAPI();
            this.setState({citys: [], cepByCity: false});
            return;
        }

        if (cep.length < 8) {
            return;
        }



    this.setState({loadingCity: true, loadingCep: true})

    axios.get(`https://viacep.com.br/ws/${cep}/json/`)
        .then((response) =>
        {
            if (response.status === 200)
            {
                const { logradouro, bairro, localidade, uf } = response.data;

                if (!uf) {
                    return
                }
                this.setState({state: uf},
                    async () =>
                    {
                        await this.handleCitysFromAPI();
                        this.setState((prevState) =>
                            {
                                return(
                                    {
                                        formData: {
                                            ...prevState.formData,
                                            neighborhood: bairro,
                                            street: logradouro,
                                        },
                                        city: localidade,
                                        cepByCity: true,
                                        states: [prevState.states.find((item) => item && (item.sigla === uf))] || prevState.states,
                                    }
                                )
                            },
                            () =>
                            {
                                this.setState((prevState) =>
                                    {
                                    return (
                                        {
                                            citys: [prevState.citys.find((item) =>
                                            {
                                                if (item && item.nome) {
                                                    return (item.nome === localidade);
                                                }

                                            })] || prevState.citys,
                                        }
                                    )
                                })
                            }
                        )
                    });

            }
        })
        .catch(err => {
            console.error(err)
        })
        .finally(() => this.setState({loadingCity: false, loadingCep: false}));
}


    fetchCoords = async () =>
    {
        const {state, city, formData:{number, neighborhood, street}} = this.state;

        try
        {
            const response = await axios
                .get('https://maps.googleapis.com/maps/api/geocode/json', {
                    params: {
                        address: `${street},${number},${neighborhood},${city},${state}&components=country:BR`,
                        key: 'AIzaSyBAfYf7PEnjL4OYn05_-e_isTXXo49Pm38',
                    },
                });

            if (response.status === 200) {
                const addressFormatted = _get(response.data, 'results[0].geometry', '');
                console.log('addressFormatted', addressFormatted)
                const {lat, lng} = addressFormatted.location;
                this.setState({latitude: lat, longitude: lng});
                return {latitude: lat, longitude: lng};
            }


        } catch(err) {
            console.log(err);
        }
    };


    handleSubmit = async () =>
    {
        this.setState({loadingForm: true});

        const {latitude, longitude} = await this.fetchCoords();

        const {formData, state, city, selectedItems, image} = this.state;

        const {name, email, street, neighborhood, number, telephone, cellphone} = formData;

        if (!selectedItems.length) {
            Alert.alert('Pelo menos um item de coleta deve ser selecionado');
            this.setState({loadingForm: false});
            return;
        }

        const data = new FormData();

        data.append('name',name);
        data.append('email',email);
        data.append('UF', state);
        data.append('city', city);
        data.append('neighborhood', neighborhood);
        data.append('street', street);
        data.append('zip_code', formData['zip-code']);
        data.append('addressNumber', String(number));
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('telephone', telephone);
        data.append('cellphone', cellphone);
        data.append('items', selectedItems.join(','));

        if (image) {
            data.append('image', {
                uri: image,
                type: 'image/png',
                name: 'collect_point.png'
            });
        }

        await api.post('collect_points', data,
            {
                headers:
                    {
                        'Content-Type': 'multipart/form-data'
                    }
            })
            .then((response) =>
            {
                console.log(response)
                if (response.status === 200) {
                    Alert.alert('Ponto de coleta cadastrado com sucesso!',
                        'Deseja ir para tela inicial ou cadastrar outro ponto?'
                    );
                }
                this.setState({loadingForm: false});
            })
            .catch((err) =>
            {
                console.error('onSubmit', err);
                this.setState({loadingForm: false});
                Alert.alert('Erro ao cadastrar o ponto de coleta!');
            });

    }


    handleChangeInput = (event: string, name: string) =>
    {
        if (name === 'zip-code')
        {
            this.handleCEP(event);
        }

        this.setState((prevState) => ({formData: {...prevState.formData, [name]: event} }) )
    }

    handleChangeCity = (event: string) => {
    if (!event) {
        return;
    }
    this.setState({city: event});

    }

    handleChangeState = (event: string) => {
    if (!event) {
        return;
    }
        this.setState({state: event}, this.handleCitysFromAPI);
    }

    handleCommonLoader = loading => loading ? <ActivityIndicator style={ Platform.OS !== 'ios' ? {marginTop: 15} : {}} color="#34CB79" />: null

    handleLoadingCity = () => this.handleCommonLoader(this.state.loadingCity);

    handleLoadingState = () => this.handleCommonLoader(this.state.loadingState);

    render()
    {
        const {
            image,
            state,
            states,
            citys,
            loadingCity,
            loadingItems,
            collectItems,
            selectedItems,
            loadingForm,
            loadingCep,
            formData: {
                name,
                cellphone,
                email,
                telephone,
                street,
                neighborhood,
                number,
            }
        } = this.state;
        return (
            <>
                <View style={styles.container}>
                    <RectButton onPress={this.handleNavigateBack}>
                        <View><Text style={{color: '#34CB79'}}>Voltar</Text></View>
                    </RectButton>

                    <ScrollView showsHorizontalScrollIndicator>
                        {
                            image
                                ?
                                <Image
                                    style={[styles.pointImage, {resizeMode: 'cover'}]}
                                    source={{uri: image}}
                                />
                                :
                                <TouchableOpacity onPress={this.handleImage}>
                                    <View>
                                        <Image
                                            style={styles.pointImage}
                                            source={require('../../assets/uploadExample.png')}
                                        />
                                    </View>
                                </TouchableOpacity>
                        }


                        <View style={styles.sections}>
                            <Text style={styles.pointName}>Dados</Text>

                            <Text style={styles.addressTitle}>Nome da entidade*</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Digite o nome da entidade"
                                value={name}
                                onChangeText={(event) => this.handleChangeInput(event, 'name')}
                            />

                            <Text style={styles.addressTitle}>E-mail*</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Digite o e-mail"
                                TextContentType="emailAddress"
                                KeyboardType="email-address"
                                value={email}
                                onChangeText={(event) => this.handleChangeInput(event, 'email')}
                            />

                            <Text style={styles.addressTitle}>Telefone*</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Digite o telefone"
                                maxLength={10}
                                keyboardType="phone-pad"
                                value={String(telephone)}
                                onChangeText={(event) => this.handleChangeInput(event, 'telephone')}
                            />

                            <Text style={styles.addressTitle}>Celular*</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Digite o celular"
                                maxLength={11}
                                TextContentType="telephoneNumber"
                                keyboardType="phone-pad"
                                value={String(cellphone)}
                                onChangeText={(event) => this.handleChangeInput(event, 'cellphone')}
                            />
                        </View>

                        <View style={styles.address}>
                            <Text style={styles.pointName}>Endereço</Text>

                            <Text style={styles.addressTitle}>CEP*</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Digite o CEP"
                                keyboardType="numeric"
                                maxLength={8}
                                value={this.state.formData['zip-code']}
                                onChangeText={(event) => this.handleChangeInput(event, 'zip-code')}
                            />

                            <Text style={styles.addressTitle}>Rua*</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={loadingCep ? "Carregando dado" : "Digite a rua"}
                                value={street}
                                onChangeText={(event) => this.handleChangeInput(event, 'street')}
                            />

                            <Text style={styles.addressTitle}>Bairro*</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={loadingCep ? "Carregando dado" : "Digite o bairro"}
                                value={neighborhood}
                                onChangeText={(event) => this.handleChangeInput(event, 'neighborhood')}
                            />

                            <Text style={styles.addressTitle}>Número*</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Digite o número"
                                keyboardType="numeric"
                                value={number}
                                onChangeText={(event) => this.handleChangeInput(event, 'number')}
                            />

                            <Text style={styles.addressTitle}>Estado*</Text>
                            <View style={[styles.input, { paddingTop: Platform.OS === 'android' ? 5 : 23,}]}>

                                <RNPickerSelect
                                    onValueChange={this.handleChangeState}
                                    Icon={this.handleLoadingState}
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
                            <Text style={styles.addressTitle}>Cidade*</Text>
                            <View style={[styles.input, { paddingTop: Platform.OS === 'android' ? 5 : 23,}]}>

                                <RNPickerSelect
                                    onValueChange={this.handleChangeCity}
                                    Icon={this.handleLoadingCity}
                                    style={
                                        Platform.OS === 'ios'
                                            ? styles.inputIOS
                                            : styles.inputAndroid
                                    }
                                    doneText="Escolher"
                                    placeholder={
                                        {
                                            label: loadingCity ? `Carregando cidades de ${state}` : state && state.length ? `Selecione uma cidade de ${state}` : 'Selecione uma cidade...',
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

                        </View>

                        <View style={styles.address}>
                            <Text style={styles.pointName}>Itens de coleta</Text>

                            <View style={styles.itemsContainer}>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={true}
                                    contentContainerStyle={{paddingBottom: 10}}
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
                                                            <SvgUri width={42} height={42} uri={item['image_url']} />
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
                        </View>
                    </ScrollView>


                </View>
                <View style={styles.footer}>
                    <RectButton style={styles.button} onPress={this.handleSubmit}>
                        {/*<FontAwesome name="whatsapp" size={20} color="#FFF"/>*/}
                        {loadingForm
                            ? <ActivityIndicator size="large" color="#FFF" />
                            : <Text style={styles.buttonText}>Cadastrar</Text>
                        }
                    </RectButton>
                </View>
            </>
        );
    }


}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 22,
        paddingTop: Platform.OS === 'android' ? 45 : 55,
    },

    pointImage: {
        width: '100%',
        height: 220, // as 120
        resizeMode: 'stretch',
        borderRadius: 10,
        marginTop: 32,
    },

    pointName: {
        color: '#322153',
        fontSize: 28,
        // fontFamily: 'Ubuntu_700Bold',
        marginTop: 24,
    },

    pointItems: {
        // fontFamily: 'Roboto_400Regular',
        fontSize: 16,
        lineHeight: 24,
        marginTop: 8,
        color: '#6C6C80'
    },

    address: {
        marginTop: 0,
    },

    input: {
        paddingTop: Platform.OS === 'android' ? 10 : 0,
        height: 60,
        backgroundColor: '#FFF',
        borderRadius: 10,
        marginBottom: 8,
        paddingHorizontal: 24,
    },

    addressTitle: {
        marginTop: 8,
        marginBottom: 8,
        color: '#322153',
        // fontFamily: 'Roboto_500Medium',
        fontSize: 16,
    },

    addressContent: {
        // fontFamily: 'Roboto_400Regular',
        lineHeight: 24,
        color: '#6C6C80'
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

    footer: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: '#999',
        paddingVertical: 20,
        paddingHorizontal: 32,
        paddingBottom: Platform.OS === 'ios' ? 30 : 20,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    button: {
        width: '100%',
        backgroundColor: '#34CB79',
        borderRadius: 10,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center'
    },

    buttonText: {
        marginLeft: 8,
        color: '#FFF',
        fontSize: 16,
        // fontFamily: 'Roboto_500Medium',
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

    itemsContainer: {
        flexDirection: 'row',
        marginTop: 16,
    },
});

