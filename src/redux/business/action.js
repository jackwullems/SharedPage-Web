import {SET_BUSINESS, SET_NOTEBUSINESS, SET_PRIVATENOTEBUSINESS, FOLLOW_BUSINESS, CHANGE_BUSINESS_ROLE, CHANGE_MEMBER_ROLE} from '../constants'

export const setBusiness = (businessArray) => {
    return {
        type: SET_BUSINESS,
        payload: businessArray
    }
}

export const setNoteArray = (noteArray, businessIndex) => {
    return {
        type: SET_NOTEBUSINESS,
        payload: {noteArray, businessIndex}
    }
}

export const setPrivateNoteArray = (noteArray, businessIndex, folderIndex) => {
    return {
        type: SET_PRIVATENOTEBUSINESS,
        payload: {noteArray, businessIndex, folderIndex}
    }
}

export const followBusiness = businessIndex => {
    return {
        type: FOLLOW_BUSINESS,
        payload: businessIndex
    }
}

export const changeBusinessRole = (businessIndex, role) => {
    return {
        type: CHANGE_BUSINESS_ROLE,
        payload: {businessIndex, role}
    }
}

export const changeMemberRole = (businessIndex, memberIndex, role) => {
    return {
        type: CHANGE_MEMBER_ROLE,
        payload: {businessIndex, memberIndex, role}
    }
}
