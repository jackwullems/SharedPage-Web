import {SET_BUSINESS, SET_NOTEBUSINESS, SET_PRIVATENOTEBUSINESS, FOLLOW_BUSINESS, CHANGE_BUSINESS_ROLE, CHANGE_MEMBER_ROLE} from '../constants'

const initBusiness = []
export default (state=initBusiness, action) => {
    switch (action.type) {
        case SET_BUSINESS:
            return action.payload
        case SET_NOTEBUSINESS: {
            const {noteArray, businessIndex} = action.payload
            const businessArray = state
            businessArray[businessIndex].noteArray = noteArray
            return businessArray
        }
        case SET_PRIVATENOTEBUSINESS: {
            const {noteArray, businessIndex, folderIndex} = action.payload
            const businessArray = state
            businessArray[businessIndex].folderArray[folderIndex].noteArray = noteArray
            return businessArray
        }
        case FOLLOW_BUSINESS: {
            const businessIndex = action.payload
            const businessArray = state
            businessArray[businessIndex].role = 'subscription'
            return businessArray
        }
        case CHANGE_BUSINESS_ROLE:{
            const {businessIndex, role} = action.payload
            const businessArray = state
            businessArray[businessIndex].role = role
            if (!role) {
                businessArray[businessIndex].folderArray = []
            }
            return businessArray
        }
        case CHANGE_MEMBER_ROLE: {
            const {businessIndex, memberIndex, role} = action.payload
            const businessArray = state
            businessArray[businessIndex].members[memberIndex].role = role
            return businessArray
        }
        default:
            return state
    }
}