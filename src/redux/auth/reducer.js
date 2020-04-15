import {SIGN_IN, SIGN_OUT, UPDATE_PROFILE} from '../constants'

const initUser = {
    id: null,
    userID: null,
    name: null,
    email: null,
    photoUrl: null,
    notification: false,
    fcmToken: null,
}
export default (state=initUser, action) => {
    switch (action.type) {
        case SIGN_IN:
        case UPDATE_PROFILE:
            return action.payload
        case SIGN_OUT:
            return initUser
        default:
            return state
    }
}