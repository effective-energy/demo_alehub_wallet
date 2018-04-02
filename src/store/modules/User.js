import axios from 'axios';
import sha256 from 'sha256';
import router from '../../router'

const state = {
    authStep: 0,
    name: '',
    email: '',
    twoAuth: '',
    haveTransactions: null,
    haveWallets: null,
    userStatus: '',
    token: localStorage.getItem(sha256('user-token')) || '',
    status: '',
    logoutStatus: '',
    twoAuthGeneratedCode: '',
    twoAuthSecret: '',
    twoAuthStatus: '',
    disableTwoAuthStatus: '',
    changeUserNameStatus: '',
    isLoader: false,
    isErrorLogin: false,

    changeEmailStatus: '',
    changePasswordStatus: ''
};

const actions = {
    authRequest: ({commit, dispatch}, user) => {
        return new Promise((resolve, reject) => {
            commit('AUTH_REQUEST');
            let host = 'http://192.168.1.39:4000/users/login';
            axios({
                url: host,
                data: user,
                method: 'POST'
            }).then(resp => {
                if (resp.data.statusLogin === 200) {
                    commit('AUTH_CHANGE_STEP');
                } else {
                    const token = resp.data.user_token;
                    localStorage.setItem(sha256('user-token'), token);
                    axios.defaults.headers.common['Authorization'] = token;
                    commit('AUTH_SUCCESS');
                }
                resolve(resp);
            }).catch(err => {
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
            let host = 'http://192.168.1.39:4000/users/login/2fa';
            axios({
                url: host,
                data: user,
                method: 'POST'
            }).then(resp => {
                console.log(resp);
                const token = resp.data.user_token;
                localStorage.setItem(sha256('user-token'), token);
                axios.defaults.headers.common['Authorization'] = token;
                commit('AUTH_SUCCESS');
                resolve(resp);
            }).catch(err => {
                commit('AUTH_ERROR', err);
                localStorage.removeItem(sha256('user-token'));
                delete axios.defaults.headers.common['Login'];
                reject(err)
            });
        })
    },
    authLogout: ({commit}) => {
        return new Promise((resolve, reject) => {
            commit('REQUEST_LOGOUT');
            let host = 'http://192.168.1.39:4000/users/logout';
            axios({
                url: host,
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Accept': 'application/json',
                    'Authorization': axios.defaults.headers.common['Authorization']
                },
                method: 'DELETE'
            }).then(resp => {
                console.log(resp, 'logout');
                commit('SUCCESS_LOGOUT');
                localStorage.removeItem(sha256('user-token'));
                localStorage.removeItem(sha256('current-wallet'));
                delete axios.defaults.headers.common['Authorization'];
                resolve(resp);
            }).catch(err => {
                console.log(err);
                commit('ERROR_LOGOUT', err);
                reject(err)
            });
        })
    },
    userRequest: ({commit}) => {
        return new Promise((resolve, reject) => {
            commit('USER_REQUEST');
            let host = 'http://192.168.1.39:4000/users/get-user-data';
            axios({
                url: host,
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Accept': 'application/json',
                    'Authorization': axios.defaults.headers.common['Authorization']
                },
                method: 'GET'
            }).then(resp => {
                commit('USER_SUCCESS', resp.data);
                commit('AUTH_SUCCESS');
                resolve(resp);
            }).catch(err => {
                if(err.response.data.message === 'User is not found') {
                    localStorage.removeItem(sha256('user-token'));
                    router.push('/login');
                }
                commit('USER_ERROR', err);
                commit('AUTH_ERROR', err);
                reject(err);
            });
        });
    },
    twoAuthRequest: ({commit}) => {
        return new Promise((resolve, reject) => {
            commit('TWOAUTH_REQUEST');
            let host = 'http://192.168.1.39:4000/users/generate-qr';
            axios({
                url: host,
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Accept': 'application/json'
                },
                method: 'GET'
            }).then(resp => {
                let twoauth = {
                    qrPath: resp.data.qr_path,
                    secret: resp.data.secret
                };
                commit('TWOAUTH_SUCCESS', twoauth);
                resolve(resp);
            }).catch(err => {
                commit('TWOAUTH_ERROR', err);
                reject(err);
            });
        });
    },
    isErrorLoginReset: ({commit}) => {
        return new Promise((resolve) => {
            commit('SUCCESS_ERROR_LOGIN_RESET');
            resolve();
        });
    },
    enableTwoAuth: ({commit, dispatch}, authData) => {
        return new Promise((resolve, reject) => {
            commit('ENABLE_TWOAUTH_REQUEST');
            let host = 'http://192.168.1.39:4000/users/enable-two-auth';
            axios({
                url: host,
                data: authData,
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Accept': 'application/json',
                    'Authorization': axios.defaults.headers.common['Authorization']
                },
                method: 'POST'
            }).then(resp => {
                commit('ENABLE_TWOAUTH_SUCCESS');
                resolve(resp);
            }).catch(err => {
                commit('ENABLE_TWOAUTH_ERROR', err);
                reject(err);
            });
        });
    },
    disableTwoAuth: ({commit, dispatch}, confirmDisableData) => {
        return new Promise((resolve, reject) => {
            commit('DISABLE_TWOAUTH_REQUEST');
            let host = 'http://192.168.1.39:4000/users/disable-two-auth';
            axios({
                url: host,
                data: confirmDisableData,
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Accept': 'application/json',
                    'Authorization': axios.defaults.headers.common['Authorization']
                },
                method: 'POST'
            }).then(resp => {
                console.log(resp);
                commit('DISABLE_TWOAUTH_SUCCESS');
                resolve(resp);
            }).catch(err => {
                console.log(err);
                commit('DISABLE_TWOAUTH_ERROR', err);
                reject(err);
            });
        });
    },
    changeUserName: ({commit, dispatch}, name) => {
        return new Promise((resolve, reject) => {
            // commit('DISABLE_TWOAUTH_REQUEST');
            let host = 'http://192.168.1.39:4000/users/change-name';
            axios({
                url: host,
                data: name,
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Accept': 'application/json',
                    'Authorization': axios.defaults.headers.common['Authorization']
                },
                method: 'POST'
            }).then(resp => {
                // console.log(resp);
                let name = resp;
                commit('CHANGE_USERNAME_SUCCESS', name);
                resolve(resp);
            }).catch(err => {
                console.log(err);
                commit('CHANGE_USERNAME_ERROR', err);
                reject(err);
            });
        });
    },
    changeEmail: ({commit, dispatch}, emailData) => {
        return new Promise((resolve, reject) => {
            commit('REQUEST_CHANGE_EMAIL');
            let host = 'http://192.168.1.39:4000/users/changeEmail';
            axios({
                url: host,
                data: emailData,
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Accept': 'application/json',
                    'Authorization': axios.defaults.headers.common['Authorization']
                },
                method: 'POST'
            }).then(resp => {
                console.log(resp, 'change email success');
                commit('SUCCESS_CHANGE_EMAIL', emailData.email);
                resolve(resp);
            }).catch(err => {
                console.log(err);
                commit('ERROR_CHANGE_EMAIL', err);
                reject(err);
            });
        });
    },
    changePassword: ({commit, dispatch}, passData) => {
        return new Promise((resolve, reject) => {
            commit('REQUEST_CHANGE_PASSWORD');
            let host = 'http://192.168.1.39:4000/users/changePassword';
            axios({
                url: host,
                data: passData,
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Accept': 'application/json',
                    'Authorization': axios.defaults.headers.common['Authorization']
                },
                method: 'POST'
            }).then(resp => {
                console.log(resp, 'change password');
                commit('SUCCESS_CHANGE_PASSWORD');
                resolve(resp);
            }).catch(err => {
                console.log(err);
                commit('ERROR_CHANGE_PASSWORD', err);
                reject(err);
            });
        });
    },
    resetAuthStep: ({commit}) => {
        return new Promise((resolve) => {
            commit('SUCCESS_RESET_AUTH_STEP');
            resolve();
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
    SUCCESS_ERROR_LOGIN_RESET: (state) => {
        state.isErrorLogin = false;
    },
    REQUEST_LOGOUT: (state) => {
        state.logoutStatus = 'loading';
    },
    SUCCESS_LOGOUT: (state) => {
        state.status = '';
        state.userStatus = '';
        state.token = '';
        state.logoutStatus = 'success';
    },
    ERROR_LOGOUT: (state) => {
        state.logoutStatus = 'error';
    },
    USER_REQUEST: (state) => {
        state.userStatus = 'loading';
    },
    USER_SUCCESS: (state, user) => {
        state.name = user.name;
        state.email = user.email;
        state.twoAuth = user.isTwoAuth;
        state.haveTransactions = user.haveTransactions;
        user.walletsList.length === 0 ? state.haveWallets = false : state.haveWallets = true;
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
    },

    REQUEST_CHANGE_EMAIL: (state) => {
        state.changeEmailStatus = 'loading';
    },
    SUCCESS_CHANGE_EMAIL: (state, email) => {
        state.email = email;
        state.changeEmailStatus = 'success';
    },
    ERROR_CHANGE_EMAIL: (state) => {
        state.changeEmailStatus = 'error';
    },

    REQUEST_CHANGE_PASSWORD: (state) => {
        state.changePasswordStatus = 'loading';
    },
    SUCCESS_CHANGE_PASSWORD: (state) => {
        state.changePasswordStatus = 'success';
    },
    ERROR_CHANGE_PASSWORD: (state) => {
        state.changePasswordStatus = 'error';
    },

    SUCCESS_RESET_AUTH_STEP: (state) => {
        state.authStep = 0;
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
    userHaveWallets: state => state.haveWallets,
    userHaveTransactions: state => state.haveTransactions,
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