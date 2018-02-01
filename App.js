/**
 * @flow
 */
import React, {Component} from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    WebView,
    View,
    Button,
    NetInfo,
    BackHandler,
    Platform,
    StatusBar,
    Dimensions,
    TouchableOpacity,
    Keyboard,
    AsyncStorage,
} from 'react-native';
import * as Orientation from 'react-native-orientation';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import {
    MKProgress,
} from 'react-native-material-kit';

const dimen = Dimensions.get('window');
const isIphoneX = () => Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    (dimen.height === 812 || dimen.width === 812)
const isIpad = () => Platform.OS === 'ios' && Platform.isPad &&
    (dimen.height === 1024 || dimen.width === 1366)
const marginTop = () => Platform.OS === 'ios' ? isIphoneX() ? 45 : 25 : 0

const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: 'rgb(254, 143, 29)'
    },

    webView: {
        flex: 1,
        marginTop: marginTop(),
    },
    webViewLandscape: {
        flex: 1,
        marginTop: 0
    },
    instructions: {
        textAlign: 'center',
        fontSize: 17,
        color: 'rgb(254, 143, 29)',
        marginBottom: 5,
        marginTop: dimen.height * 0.3

    },
    btnClickContain: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'stretch',
        alignSelf: 'stretch',
        backgroundColor: 'rgb(254, 143, 29)',
    },
    btnContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    btnIcon: {
        height: 25,
        width: 25,
    },
    progress: {
        // width: 150,
        //height: 2,
    },
    spinner: {
        //width: 22,
        //height: 22,
    },
});
// let isLandscape = false;
export default class App extends Component<{}> {
    // renderLoading = () => <ActivityIndicator size="large" style={{marginTop: dimen.height * 0.5}}/>;

    constructor(props) {
        super(props);
        this.state = {
            isConnected: true,
            canGoBack: false,
            canGoForward: false,
            loggedIn: false,
            loadedCookie: false,
            canGoHome: false,
            marginTop: 45,
            login: null,
            password: null,
            showPreloader: false,
            url: "",
            progress: 0,
            isLoading: true,
            checkUrl: '',
            isLandscape: false,
        };

        this._onNavigationStateChange = this._onNavigationStateChange.bind(this);
        this._onMessage = this._onMessage.bind(this);
        this._onLoDEnd = this._onLoDEnd.bind(this);
    }

    componentWillMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
        const initial = Orientation.getInitialOrientation();
        if (initial === 'PORTRAIT') {
            // do something
            console.log('PORTRAIT')
        } else {
            // do something else
            console.log('LANDSCAPE')
        }
        console.log('initial', initial)

    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
        BackHandler.removeEventListener('hardwareBackPress', this._backButton);
    }

    _backButton() {
        if (this.state.canGoBack) {
            this._bridge.goBack()
            return true;
        }
        return false;
    }

    _keyboardDidShow() {
        this.setState({isKeyboardShow: true})
    }

    _keyboardDidHide() {
        this.setState({isKeyboardShow: false})
    }

    _orientationDidChange = (orientation) => {
        Orientation.unlockAllOrientations();
        if (orientation === 'LANDSCAPE') {
            console.log('LANDSCAPE')
            this.setState({
                isLandscape: true
            })
        } else {
            console.log('PORTRAIT')
            this.setState({
                isLandscape: false
            })
        }
    }

    componentDidMount() {
        if (isIphoneX()) {
            Orientation.lockToPortrait();
        }
        NetInfo.isConnected.fetch().done(isConnected => this.setState({isConnected}))
        BackHandler.addEventListener('hardwareBackPress', this._backButton.bind(this));
        Orientation.addOrientationListener(this._orientationDidChange);
        Orientation.addSpecificOrientationListener((specificOrientation) => {
            if (specificOrientation === "PORTRAITUPSIDEDOWN") {
                Orientation.lockToPortrait();
            }
        });
    }


    reload() {
        this._bridge.reload()
    }

    renderError() {
        return (
            <View style={{flex: 1, backgroundColor: '#ffff'}}>

                <Text style={styles.instructions}>
                    Check your connection and try again
                </Text>
                <Button title="RETRY" onPress={() => this.reload()}/>
            </View>
        )
    }

    _onNavigationStateChange = (navState) => {
        if (navState.url.search('https://my.serverscheck.com/home.php') === 0 || navState.url.search('https://my.serverscheck.com/index.php') === 0) {
            this.setState({
                loggedIn: true,
                canGoHome: false

            });
        } else {
            this.setState({
                canGoHome: navState.canGoBack,
            });
        }
        if (navState.url.search('react-js-navigation://') === 0) {
            this.setState({
                isLoading: false
            })
        } else if (this.state.checkUrl !== navState.url) {
            this.setState({
                checkUrl: navState.url,
                isLoading: true,
            })
        } else {
            this.setState({
                isLoading: false
            })
        }

        if (navState.url.search('https://my.serverscheck.com/logout.php') === 0) {
            // this._bridge.injectJavaScript("localStorage.clear();")
        }

        this.setState({
            url: navState.url,
            canGoBack: navState.canGoBack,
            canGoForward: navState.canGoForward,
        });


    };

    _onLoDEnd = (data) => {
        // if (this.state.url.search('https://my.serverscheck.com/home.php') === 0) {
        //     this.setState({showPreloader: false});
        // } else if (this.state.url.search('https://my.serverscheck.com/login.php') === 0 || this.state.url === 'https://my.serverscheck.com/') {
        //     // console.log('onLoadEnd', data);
        //     this.setState({showPreloader: true});
        // }

        this.setState({isLoading: false});

    };

    _onMessage = (event) => {

        let data = [];
        if (event.nativeEvent.data && event.nativeEvent.data.length !== 0 && event.nativeEvent.data !== "null,null") {
            data = event.nativeEvent.data.split(",");
            this.setState({login: data[0], password: data[1]});
        } else {
            this.setState({login: null, password: null, showPreloader: false})
        }

    };

    render() {
        let jsCode = `
        
        document.querySelectorAll("body > div > form > button")[0].addEventListener('click', function(event) {
            var login = document.getElementById("inputEmail").value;
            var password = document.getElementById("inputPassword").value;
           
            localStorage.setItem("login", login);
            localStorage.setItem("password", password);            
        });   
        let log = localStorage.getItem("login");
        let pass =  localStorage.getItem("password");
        setInterval(window.postMessage(log+","+pass),1000);
        
        if (
        window.location.href === "https://my.serverscheck.com/"
        && log!==undefined
        && log.length!==0
        && pass!==undefined
        && pass.length!==0
        ){
           document.getElementById("inputEmail").value=log;
           document.getElementById("inputPassword").value=pass;
           var login=document.getElementById("inputEmail").value;
           var password=document.getElementById("inputEmail").value;
           
           if (login.length!==0&&password.length!==0){
            //document.querySelectorAll("body > div > form > button")[0].click();
           }                    
            
        }
        if (window.location.href.search("https://my.serverscheck.com/home.php")===0){
        // alert("ghgg");
        }
        document.querySelectorAll("body > div > div.hidden-lg.hidden-md.hidden-sm.col-xs-12 > div > div > div > div > div.col-xs-10.text-left > a")[0].addEventListener('click', function(event) {
            var login = document.getElementById("inputEmail").value;
            var password = document.getElementById("inputPassword").value;
           // alert("logout");
            // localStorage.setItem("login", login);
            // localStorage.setItem("password", password);            
        });   
    `;

        console.log('height', dimen.height, dimen.width, isIphoneX() && this.state.isLandscape)


        return (
            <View style={{flex: 1, flexDirection: 'row', backgroundColor: 'rgb(254, 143, 29)'}}>
                <View style={isIphoneX() && this.state.isLandscape ? {
                        justifyContent: 'flex-start',
                        width: 45,
                        backgroundColor: '#F5F5F5'
                    }
                    : {justifyContent: 'flex-start', width: 0, backgroundColor: '#fff'}
                }/>
                <View style={{flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgb(254, 143, 29)'}}>
                    <StatusBar
                        barStyle="light-content"
                        backgroundColor="#c56000"
                    />
                    <WebView
                        mixedContentMode='always'
                        userAgent='ServersCheck_Mobile_App_4_00'

                        source={{
                            // uri: 'https://github.com/',ServersCheck_Mobile_App_4_00

                            uri: 'https://my.serverscheck.com/',
                        }}
                        javaScriptEnabled={true}
                        ref={(b) => this._bridge = b}
                        style={Platform.OS === 'ios' ? this.state.isLandscape?isIpad?{flex: 1, marginTop: 25}:{flex: 1, marginTop: 0}:isIphoneX()? {
                            flex: 1,
                            marginTop: 45
                        } : {flex: 1, marginTop: 25} :{flex: 1, marginTop: 0}}//568 iPhone 5s 667 iPhone 6s
                        onError={() => NetInfo.isConnected.fetch().done(isConnected => this.setState({isConnected}))}
                        renderError={() => this.renderError()}
                        onNavigationStateChange={this._onNavigationStateChange}
                        onLoadEnd={this._onLoDEnd}
                        injectedJavaScript={jsCode}
                        onMessage={(data) => this._onMessage(data)}
                        // startInLoadingState={true}
                        // renderLoading={this.renderLoading}
                    />
                    {this.state.isLoading && <MKProgress.Indeterminate
                        style={styles.progress}
                        progress={0.2}
                        buffer={0.3}
                        progressColor="red"

                    />}

                    <View style={{
                        height: this.state.isKeyboardShow ? 0 : isIphoneX() ? 70 : 50,
                        backgroundColor: 'rgb(254, 143, 29)',
                        flexDirection: 'row'
                    }}>
                        <TouchableOpacity
                            onPress={() => this._bridge.goBack()}
                            style={styles.btnClickContain}
                            disabled={!this.state.canGoBack}
                        >
                            <View
                                style={styles.btnContainer}>
                                <Icon
                                    name="angle-left"
                                    size={25}
                                    color={"#ffffff"}
                                    style={styles.btnIcon}/>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                this._bridge.injectJavaScript("window.location.href='https://my.serverscheck.com/home.php'");
                            }}
                            style={styles.btnClickContain}
                            disabled={!this.state.canGoHome}
                        >
                            <View
                                style={styles.btnContainer}>
                                <Icon
                                    name="home"
                                    size={25}
                                    color={"#ffffff"}
                                    style={styles.btnIcon}/>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this._bridge.goForward()}
                            style={styles.btnClickContain}
                            disabled={!this.state.canGoForward}
                        >
                            <View
                                style={styles.btnContainer}>
                                <Icon
                                    name="angle-right"
                                    size={25}
                                    color={"#ffffff"}
                                    style={styles.btnIcon}/>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{backgroundColor: '#F5F5F5', width: isIphoneX() && this.state.isLandscape ? 45 : 0}}/>
            </View>
        );
    }


}