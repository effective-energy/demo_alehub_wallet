import axios from 'axios';
import sha256 from 'sha256';


const state = {
    authStep: 0,
    name: '',
    email: '',
    twoAuth: '',
    userStatus: '',
    token: localStorage.getItem(sha256('2o_H-Zu7nNDcmSaZX')) || '',
    status: '',
    twoAuthGeneratedCode: '',
    twoAuthSecret: '',
    twoAuthStatus: '',
    disableTwoAuthStatus: '',
    changeUserNameStatus: '',
    isLoader: false,
    isErrorLogin: false
};

const actions = {
    authRequest: ({commit, dispatch}, user) => {
        return new Promise((resolve, reject) => {
            commit('AUTH_REQUEST');
            let host = 'http://54.144.234.226:8181/users/login';
            axios({
                url: host,
                data: user,
                method: 'POST'
            })
                .then(resp => {
                    if (resp.data.statusLogin === 200) {
                        commit('AUTH_CHANGE_STEP');
                    } else {
                        const token = resp.data.user_token;
                        localStorage.setItem(sha256('user-token'), token);
                        axios.defaults.headers.common['Authorization'] = token;
                        commit('AUTH_SUCCESS');
                    }
                    resolve(resp);
                })
                .catch(err => {
                    commit('AUTH_ERROR', err);
                    localStorage.removeItem(sha256('user-token'));
                    delete axios.defaults.headers.common['Login'];
                    reject(err)
                });
        })
    },
    authTwoFaRequest: ({commit, dispatch}, user) => {
        return new Promise((resolve, reject) => {
            commit('AUTH_REQUEST');
            let host = 'http://54.144.234.226:8181/users/login/2fa';
            axios({
                url: host,
                data: user,
                method: 'POST'
            })
                .then(resp => {
                    console.log(resp);
                    const token = resp.data.user_token;
                    localStorage.setItem(sha256('user-token'), token);
                    axios.defaults.headers.common['Authorization'] = token;
                    commit('AUTH_SUCCESS');
                    resolve(resp);
                })
                .catch(err => {
                    commit('AUTH_ERROR', err);
                    localStorage.removeItem(sha256('user-token'));
                    delete axios.defaults.headers.common['Login'];
                    reject(err)
                });
        })
    },
    authLogout: ({commit, dispatch}) => {
        return new Promise((resolve, reject) => {
            commit('AUTH_LOGOUT');
            localStorage.removeItem(sha256('user-token'));
            delete axios.defaults.headers.common['Authorization'];
            resolve();
        })
    },
    userRequest: ({commit, dispatch}) => {
        return new Promise((resolve, reject) => {
            commit('USER_REQUEST');
            let host = 'http://54.144.234.226:8181/users/get-user-data';
            axios({
                url: host,
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Accept': 'application/json',
                    'Authorization': axios.defaults.headers.common['Authorization']
                },
                method: 'GET'
            })
                .then(resp => {
                    let user = {
                        name: resp.data.name,
                        email: resp.data.email,
                        twoauth: resp.data.isTwoAuth
                    };

                    console.log(resp);

                    commit('USER_SUCCESS', user);
                    commit('AUTH_SUCCESS');
                    resolve(resp);
                })
                .catch(err => {
                    commit('USER_ERROR', err);
                    commit('AUTH_ERROR', err);
                    reject(err);
                });
        });
    },
    twoAuthRequest: ({commit, dispatch}) => {
        return new Promise((resolve, reject) => {
            commit('TWOAUTH_REQUEST');
            let host = 'http://54.144.234.226:8181/users/generate-qr';
            axios({
                url: host,
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Accept': 'application/json'
                },
                method: 'GET'
            })
                .then(resp => {

                    console.log(resp);

                    let twoauth = {
                        qrPath: resp.data.qr_path,
                        secret: resp.data.secret
                    };

                    console.log(twoauth);
                    // console.log(twoauth, 'twoauth');
                    commit('TWOAUTH_SUCCESS', twoauth);
                    resolve(resp);
                })
                .catch(err => {
                    commit('TWOAUTH_ERROR', err);
                    reject(err);
                });
        });
    },
    enableTwoAuth: ({commit, dispatch}, authData) => {
        return new Promise((resolve, reject) => {
            commit('ENABLE_TWOAUTH_REQUEST');
            let host = 'http://54.144.234.226:8181/users/enable-two-auth';
            axios({
                url: host,
                data: authData,
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Accept': 'application/json',
                    'Authorization': axios.defaults.headers.common['Authorization']
                },
                method: 'POST'
            })
                .then(resp => {
                    commit('ENABLE_TWOAUTH_SUCCESS');
                    resolve(resp);
                })
                .catch(err => {
                    commit('ENABLE_TWOAUTH_ERROR', err);
                    reject(err);
                });
        });
    },
    disableTwoAuth: ({commit, dispatch}, confirmDisableData) => {
        return new Promise((resolve, reject) => {
            commit('DISABLE_TWOAUTH_REQUEST');
            let host = 'http://54.144.234.226:8181/users/disable-two-auth';
            axios({
                url: host,
                data: confirmDisableData,
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Accept': 'application/json',
                    'Authorization': axios.defaults.headers.common['Authorization']
                },
                method: 'POST'
            })
                .then(resp => {
                    console.log(resp);
                    commit('DISABLE_TWOAUTH_SUCCESS');
                    resolve(resp);
                })
                .catch(err => {
                    console.log(err);
                    commit('DISABLE_TWOAUTH_ERROR', err);
                    reject(err);
                });
        });
    },
    changeUserName: ({commit, dispatch}, name) => {
        return new Promise((resolve, reject) => {
            // commit('DISABLE_TWOAUTH_REQUEST');
            let host = 'http://54.144.234.226:8181/users/change-name';
            axios({
                url: host,
                data: name,
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Accept': 'application/json',
                    'Authorization': axios.defaults.headers.common['Authorization']
                },
                method: 'POST'
            })
                .then(resp => {
                    console.log(resp);
                    let name = resp;
                    commit('CHANGE_USERNAME_SUCCESS', name);
                    resolve(resp);
                })
                .catch(err => {
                    console.log(err);
                    commit('CHANGE_USERNAME_ERROR', err);
                    reject(err);
                });
        });
    },
};

const mutations = {
    AUTH_CHANGE_STEP: (state) => {
        state.isErrorLogin = false;
        state.isLoader = false;
        state.authStep = 1;
    },
    AUTH_REQUEST: (state) => {
        state.isErrorLogin = false;
        state.isLoader = true;
        state.status = 'loading';
    },
    AUTH_SUCCESS: (state, token) => {
        state.isErrorLogin = false;
        state.isLoader = false;
        state.status = 'success';
        state.token = token;
    },
    AUTH_ERROR: (state) => {
        state.isErrorLogin = true;
        state.isLoader = false;
        state.status = 'error';
    },
    AUTH_LOGOUT: (state) => {
        state.status = 'not authorized';
        state.token = '';
    },
    USER_REQUEST: (state) => {
        state.userStatus = 'loading';
    },
    USER_SUCCESS: (state, user) => {
        state.name = user.name;
        state.email = user.email;
        state.twoAuth = user.twoauth;
        state.userStatus = 'success';
    },
    USER_ERROR: (state) => {
        state.userStatus = 'error';
    },
    TWOAUTH_REQUEST: (state) => {
        state.twoauthStatus = 'loading';
    },
    TWOAUTH_SUCCESS: (state, twoauth) => {
        state.twoAuthStatus = 'success';
        state.twoAuthGeneratedCode = twoauth.qrPath;
        state.twoAuthSecret = twoauth.secret;
    },
    TWOAUTH_ERROR: (state) => {
        state.twoAuthStatus = 'error';
    },
    ENABLE_TWOAUTH_REQUEST: (state) => {
        state.enableTwoAuthStatus = 'loading';
    },
    ENABLE_TWOAUTH_SUCCESS: (state) => {
        state.enableTwoAuthStatus = 'success';
        state.twoAuth = true;
    },
    ENABLE_TWOAUTH_ERROR: (state) => {
        state.enableTwoAuthStatus = 'error'
    },
    DISABLE_TWOAUTH_REQUEST: (state) => {
        state.disableTwoAuthStatus = 'loading';
    },
    DISABLE_TWOAUTH_SUCCESS: (state) => {
        state.disableTwoAuthStatus = 'success';
        state.twoAuth = false;
    },
    DISABLE_TWOAUTH_ERROR: (state) => {
        state.disableTwoAuthStatus = 'error';
    },
    CHANGE_USERNAME_SUCCESS: (state, name) => {
        state.name = name;
        state.changeUserNameStatus = 'success';
    },
    CHANGE_USERNAME_ERROR: (state, err) => {
        state.changeUserNameStatus = 'error';
    }
};

const getters = {
    isAuthenticated: state => !!state.token,
    authStep: state => state.authStep,
    authStatus: state => state.status,
    userName: state => state.name,
    userEmail: state => state.email,
    userStatus: state => state.userStatus,
    userTwoAuth: state => state.twoAuth,
    twoAuthStatus: state => state.twoAuthStatus,
    twoAuthGeneratedCode: state => state.twoAuthGeneratedCode,
    twoAuthSecret: state => state.twoAuthSecret,
    changeUserNameStatus: state => state.changeUserNameStatus,
    isLoaderUserAuth: state => state.isLoader,
    isErrorLogin: state => state.isErrorLogin
};

export default {
    state,
    mutations,
    actions,
    getters
};