import {SIGN_IN, SIGN_OUT} from '../constants'

export const signin = (id, name, email, photoUrl) => {
    return {
        type: SIGN_IN,
        payload: {
            id, name, email, photoUrl
        }
    }
}

export const signout = () => {
    return {
        type: SIGN_OUT,
        payload: null
    }
}