import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Text, Image, SafeAreaView, ActivityIndicator, Alert, Linking, ScrollView} from "react-native";
import {RectButton} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';
import {SvgUri}  from "react-native-svg";
import {api} from "../../services/api";
// import * as MailComposer from 'expo-mail-composer';

export const CollectPointDetail = (props) =>
{
    const [collectPoints, setCollectPoints] = useState({});
    const navigation = useNavigation();
    const {collectPointID} = props.route.params;

    useEffect(() => {
        api.get(`collect_points/${collectPointID}`)
            .then(response =>
            {

                if (response.status === 200) {
                    setCollectPoints(response.data)
                }
            })
            .catch(err =>
            {
                console.log(err);
            });
    }, [])

    const handleWhatsapp = async () =>
    {
        try {
            await Linking.openURL(`whatsapp://send?phone=${collectPoints.serializedPoints.cellphone}&text=Tenho interesse sobre coleta de resíduos`)
        } catch(err) {
            console.log(err);
            Alert.alert('Erro acessar WhatsApp')
        }
    }

    const handleComposeEmail= async () =>
    {

        Alert.alert('App de E-mail padrão não encontrado!',
            'Você deve estar logado em seu app de E-mail neste dispositivo para utilizar essa funcionalidade')
       /* try {
            await MailComposer.composeAsync(
                {
                    subject: 'Interese na coleta de resíduos!',
                    recipients: collectPoints.serializedPoints.email,
                });
        } catch(err) {
            console.log(err);
            Alert.alert('App de E-mail padrão não encontrado!',
                'Você deve estar logado em seu app de E-mail neste dispositivo para utilizar essa funcionalidade')
        }*/

    }

    function handleNavigateBack()
    {
        navigation.navigate('CollectPoints');
    }


    const mainBody = collectPoints.serializedPoints && (
        <>
            <Image
                style={styles.pointImage}
                source={{uri: collectPoints.serializedPoints['image_url']}}
            />
            <Text style={styles.pointName}>{collectPoints.serializedPoints.name}</Text>
            {
                Object.keys(collectPoints).length &&
                collectPoints.itemsCollectedByThisPoint.map(({title}) =>
                    (<Text key={title} style={styles.pointItems}>{title}</Text>)
                )
            }
            <ScrollView showsHorizontalScrollIndicator={true} style={styles.address}>
                <Text style={styles.pointName}>Endereço</Text>

                <View style={{flex: 1, flexDirection: 'row'}}>
                    <View>
                        <Text style={styles.addressTitle}>Rua</Text>
                        <Text style={styles.addressContent}>{collectPoints.serializedPoints.street}</Text>
                    </View>

                    <View style={{marginLeft: 24}}>
                        <Text style={styles.addressTitle}>Bairro</Text>
                        <Text style={styles.addressContent}>{collectPoints.serializedPoints.neighborhood}</Text>
                    </View>

                </View>

                <View style={{flex: 1, flexDirection: 'row'}}>
                    <View>
                        <Text style={styles.addressTitle}>Cidade</Text>
                        <Text style={styles.addressContent}>{collectPoints.serializedPoints.city}</Text>
                    </View>

                    <View style={{marginLeft: 58}}>
                        <Text style={styles.addressTitle}>Estado</Text>
                        <Text style={styles.addressContent}>{collectPoints.serializedPoints.UF}</Text>
                    </View>

                </View>


                <View style={{flex: 1, flexDirection: 'row'}}>
                    <View>
                        <Text style={styles.addressTitle}>Número</Text>
                        <Text style={styles.addressContent}>{collectPoints.serializedPoints.addressNumber}</Text>
                    </View>

                    <View style={{marginLeft: 67}}>
                        <Text style={styles.addressTitle}>CEP</Text>
                        <Text style={styles.addressContent}>{collectPoints.serializedPoints['zip_code']}</Text>
                    </View>

                </View>



                <Text style={styles.pointName}>Contato</Text>

                <Text style={styles.addressTitle}>E-mail</Text>
                <Text style={styles.addressContent}>{collectPoints.serializedPoints.email}</Text>


                <View style={{flex: 1, flexDirection: 'row', marginTop: 12}}>
                    <View>
                        <Text style={styles.addressTitle}>Telefone</Text>
                        <Text style={styles.addressContent}>{collectPoints.serializedPoints.telephone}</Text>
                    </View>

                    <View style={{marginLeft: 24}}>
                        <Text style={styles.addressTitle}>Celular</Text>
                        <Text style={styles.addressContent}>{collectPoints.serializedPoints.cellphone}</Text>
                    </View>
                 </View>
            </ScrollView>
        </>
    );
    // <Icon name="arrow-left" size={25} color="#34cb79"/>
    return (
        <SafeAreaView style={{flex: 1}}>
            <View style={styles.container}>
                <RectButton onPress={handleNavigateBack}>
                    <View><Text style={{color: '#34CB79'}}>Voltar</Text></View>
                </RectButton>

                {
                    !collectPoints.serializedPoints
                        ? <ActivityIndicator size="large" color="#34cb79" style={{flex: 1, justifyContent: 'center'}}/>
                        : mainBody
                }

            </View>
            <View style={styles.footer}>
                <RectButton style={styles.button} onPress={handleWhatsapp}>
                    {/*<FontAwesome name="whatsapp" size={20} color="#FFF"/>*/}
                    <Text style={styles.buttonText}>WhatsApp</Text>
                </RectButton>

                <RectButton style={styles.button} onPress={handleComposeEmail}>
                    {/*<Icon name="mail" size={20} color="#FFF"/>*/}
                    <Text style={styles.buttonText}>E-mail</Text>
                </RectButton>
            </View>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 22,
        paddingTop: 45
    },

    pointImage: {
        width: '100%',
        height: 220, // as 120
        resizeMode: 'cover',
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

    addressTitle: {
        marginTop: 8,
        color: '#322153',
        // fontFamily: 'Roboto_500Medium',
        fontSize: 16,
    },

    addressContent: {
        // fontFamily: 'Roboto_400Regular',
        lineHeight: 24,
        color: '#6C6C80'
    },

    footer: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: '#999',
        paddingVertical: 20,
        paddingHorizontal: 32,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    button: {
        width: '48%',
        backgroundColor: '#34CB79',
        borderRadius: 10,
        height: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },

    buttonText: {
        marginLeft: 8,
        color: '#FFF',
        fontSize: 16,
        // fontFamily: 'Roboto_500Medium',
    },
});

