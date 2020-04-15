import { db } from './firebase'

// User API

export const createUser = async (userID, name, email) => {
    try {
        const subscription = {
            createdAt: Date.now(),
            role: "subscription"
        }
        await db.collection('user').doc(userID).set({name, email})
        await db.collection('user').doc(userID).collection('follow').doc('uHwufEGEcEgd62dJ1ohE').set(subscription)
        await db.collection('business').doc('uHwufEGEcEgd62dJ1ohE').collection('following').doc(userID).set(subscription)
    } catch (error) {

    }
}

export const getUser = (userID, callback) => {
    db.collection('user').doc(userID).get()
    .then(doc=>{
        if (!doc.exists) {
            callback(null, null)
            return
        }
        callback({id: doc.id, data: doc.data()}, null)
        return
    })
    .catch(error=>{
        callback(null, error)
        return
    })
}

async function getBusinessFolderSubScriptionAll(userID, businessID) {
    try {
        const followRef = db.collection('user').doc(userID).collection('follow').doc(businessID)
        const followDoc = await followRef.get()
        if (followDoc.exists) {
            const followData = followDoc.data()
            const snapshot = await followRef.collection('folderSubscription').orderBy('createdAt', 'desc').get()
            return {
                role: followData.role?followData.role:'subscription',
                snapshot
            }
        }
    } catch (error) {
    }
    return null
}

async function getFolderSubScription(userID, businessID, folderID) {
    const snapshot = await db.collection('user').doc(userID)
    .collection('follow').doc(businessID)
    .collection('folderSubscription').doc(folderID)
    .get()
    if (snapshot) {
        return snapshot.data()
    }
    return null
}

async function getBusinessFolderNoteSubScriptionAll(userID, businessID, folderID) {
    return await db.collection('user').doc(userID)
    .collection('follow').doc(businessID)
    .collection('folderSubscription').doc(folderID)
    .collection('noteSubscription').orderBy('order').get()
}

async function getFollowingBusinessAll(userID) {
    return await db.collection('user').doc(userID)
    .collection('follow').orderBy('updatedAt', 'desc').get()
}

async function getBusinessfromBusinessID(businessID) {
   const snapshot = await db.collection('business').doc(businessID).get()
   if (snapshot) {
       const business = snapshot.data()
       if (business) {
           business.id = businessID
           return business
       }
   }
   return null
}

async function getBusinessNotesAll(businessID) {
    return await db.collection('business').doc(businessID)
    .collection('note').orderBy('createdAt', 'desc').get()
}

async function getFolderfromfolderID(folderID) {
    const snapshot = await db.collection('folder').doc(folderID).get()
    if (snapshot) {
        const folder = snapshot.data()
        if (folder) {
            folder.id = folderID
            return folder
        }
    }
    return null
}

async function getUserfromuserID(userID) {
    const snapshot = await db.collection('user').doc(userID).get()
    if (snapshot) {
        const user = snapshot.data()
        if (user) {
            user.id = userID
            return user
        }
    }
    return null
}

async function getBusinessFollowerAll(businessID) {
    try {
        return await db.collection('business').doc(businessID).collection('following').get()
    } catch (error) {

    }
    return null
}

async function getBusinessAll() {
    try {
        return await db.collection('business').get()
    } catch (error) {

    }
    return null
}

export async function getBusinessWithName(userID, filterBusinessName) {

    try {
        const businessArray = []
        const snapshot = await getBusinessAll()
        for (const businessDoc of snapshot.docs) {
            const business = businessDoc.data()
            if (business) {
                const name = business.name
                if (name.toLowerCase().includes(filterBusinessName.toLowerCase())) {
                    const businessID = businessDoc.id
                    business.id = businessID
                    var role = null
                    var updatedAt = null
                    const folderArray = []
                    const folderSubscription = await getBusinessFolderSubScriptionAll(userID, businessID)
                    if (folderSubscription) {
                        role = folderSubscription.role
                        const snapshot = folderSubscription.snapshot
                        for (const snapshotdoc of snapshot.docs) {
                            const folder = await getFolderfromfolderID(snapshotdoc.id)
                            if (folder) {
                                folderArray.push(folder)
                            }
                        }
                    }
                    var followingCount = 0
                    var memberCount = 0
                    const members = []
                    const followingSnapshot = await getBusinessFollowerAll(businessID)
                    if (followingSnapshot) {
                        followingCount = followingSnapshot.docs.length
                        for (const shnapshotDoc of followingSnapshot.docs) {
                            const data = shnapshotDoc.data()
                            const id = shnapshotDoc.id;
                            if (data) {
                                if (role === 'owner' || (data.role === 'owner' || data.role === 'writer')) {
                                    const member = await getUserfromuserID(id)
                                    if (member) {
                                        memberCount++
                                        member.role = data.role
                                        members.push(member)
                                    }
                                }
                            }
                        }
                    }
                    if (businessArray.length === 0) {
                        const noteArray = []
                        const noteSnapshot = await getBusinessNotesAll(businessID)
                        for (var nindex=0;nindex<noteSnapshot.docs.length;nindex++) {
                            const note = noteSnapshot.docs[nindex].data()
                            if (note) {
                                note.id = noteSnapshot.docs[nindex].id
                                noteArray.push(note)
                            }
                        }
                        businessArray.push({...business, updatedAt, role, folderArray, followingCount, memberCount, members, noteArray})
                    } else {
                        businessArray.push({...business, updatedAt, role, folderArray, followingCount, memberCount, members, noteArray: null})
                    }
                }
            }
        }
        return {
            businessArray,
            error: null
        }
    } catch(error) {
        console.error(error)
        return {
            businessArray: null,
            error
        }
    }
}

export const getBusinessWithUser = async (userID) => {
    try {
        const followSnapshot = await getFollowingBusinessAll(userID)
        const businessArray = []
        for (const followDoc of followSnapshot.docs) {
            const follow = followDoc.data()
            if (follow) {
                const businessID = followDoc.id
                const role = follow.role?follow.role:'subscription'
                const updatedAt = follow.updatedAt
                const business = await getBusinessfromBusinessID(businessID)
                if (business) {
                    const folderArray = []
                    const subscription = await getBusinessFolderSubScriptionAll(userID, businessID)
                    if (subscription) {
                        const snapshot = subscription.snapshot
                        for (const snapshotDoc of snapshot.docs) {
                            const folderID = snapshotDoc.id
                            const folder = await getFolderfromfolderID(folderID)
                            if (folder) {
                                folderArray.push(folder)
                            }
                        }
                    }
                    var followingCount = 0
                    var memberCount = 0
                    const followingSnapshot = await getBusinessFollowerAll(businessID)
                    const members = []
                    if (followingSnapshot) {
                        followingCount = followingSnapshot.docs.length
                        for (const snapshotDoc of followingSnapshot.docs) {
                            const data = snapshotDoc.data()
                            const id = snapshotDoc.id;
                            if (data) {
                                if (role === 'owner') {
                                    if (data.role === 'owner' || data.role === 'writer' || data.role === 'candidate') {
                                        const member = await getUserfromuserID(id)
                                        if (member) {
                                            member.index = memberCount
                                            memberCount++
                                            member.role = data.role
                                            members.push(member)
                                        }
                                    }
                                } else if (data.role === 'owner' || data.role === 'writer') {
                                    const member = await getUserfromuserID(id)
                                    if (member) {
                                        member.index = memberCount
                                        memberCount++
                                        member.role = data.role
                                        members.push(member)
                                    }
                                }
                            }
                        }
                    }
                    if (businessArray.length === 0) {
                        const noteArray = []
                        const noteSnapshot = await getBusinessNotesAll(businessID)
                        for (var nindex=0;nindex<noteSnapshot.docs.length;nindex++) {
                            const note = noteSnapshot.docs[nindex].data()
                            if (note) {
                                note.id = noteSnapshot.docs[nindex].id
                                noteArray.push(note)
                            }
                        }
                        businessArray.push({...business, updatedAt, role, folderArray, followingCount, members, noteArray})
                    } else {
                        businessArray.push({...business, updatedAt, role, folderArray, followingCount, members, noteArray: null})
                    }
                }
            }
        }
        return {
            businessArray,
            error: null
        }
    } catch(error) {
        console.error(error)
        return {
            businessArray: null,
            error
        }
    }
}

export async function getBusinessNotes(businessID) {
    try {
        const noteArray = []
        const noteSnapshot = await getBusinessNotesAll(businessID)
        for (var nindex=0;nindex<noteSnapshot.docs.length;nindex++) {
            const note = noteSnapshot.docs[nindex].data()
            if (note) {
                note.id = noteSnapshot.docs[nindex].id
                noteArray.push(note)
            }
        }
        return {
            noteArray,
            error: null
        }
    } catch(error) {
        console.error(error)
        return {
            noteArray: null,
            error
        }
    }
}

async function getFolderNote(folderID, noteID) {
    const snapshot = await db.collection('folder').doc(folderID).collection('note').doc(noteID).get()
    if (snapshot) {
        const data = snapshot.data()
        if (data) {
            data.id = snapshot.id
            return data
        }
    }
    return null
}

export async function getBusinessFolderNotes(userID, businessID, folderID) {
    try {
        const noteArray = []
        const noteSnapshot = await getBusinessFolderNoteSubScriptionAll(userID, businessID, folderID)
        for (const noteSubscriptionDoc of noteSnapshot.docs) {
            const noteSubscription = noteSubscriptionDoc.data()
            if (noteSubscription) {
                const noteID = noteSubscriptionDoc.id
                const note = await getFolderNote(folderID, noteID)
                if (note) {
                    note.order = noteSubscription.order
                    noteArray.push(note)
                }
            }
        }
        return {
            noteArray,
            error: null
        }
    } catch(error) {
        console.error(error)
        return {
            noteArray: null,
            error
        }
    }
}

export async function businessNoteUploadServer(businessID, note) {
    try {
        const businessData = getBusinessfromBusinessID(businessID)
        if (businessData) {
            const noteRef = await db.collection('business').doc(businessID).collection('note').add(note)
            note.id = noteRef.id
            var noteCount = businessData.noteCount||0
            noteCount++
            await db.collection('business').doc(businessID).update({
                noteCount
            })
        }
        return {
            note,
            error: null
        }
    } catch(error) {
        return {
            error
        }
    }
}

export async function folderNoteUploadServer(ownerID, businessID, folderID, note) {
    try {
        const noteRef = await db.collection('folder').doc(folderID).collection('note').add(note)
        const noteID = noteRef.id
        const folderSubscription = await getFolderSubScription(ownerID, businessID, folderID)
        if (folderSubscription) {
            const noteSubscription = {
                order: note.order,
                createdAt: note.createdAt
            }
            await db.collection('user').doc(ownerID)
            .collection('follow').doc(businessID)
            .collection('folderSubscription').doc(folderID)
            .collection('noteSubscription').doc(noteID).set(noteSubscription)
            var noteCount = folderSubscription.noteCount||0
            noteCount++
            await db.collection('user').doc(ownerID)
            .collection('follow').doc(businessID)
            .collection('folderSubscription').doc(folderID).update({noteCount})
        }
        return {
            note,
            error: null
        }
    } catch(error) {
        return {
            error
        }
    }
}

export async function businessNoteUpdateServer(businessID, note) {
    try {
        const noteRef = db.collection('business').doc(businessID).collection('note').doc(note.id)
        await noteRef.update(note)
        return {
            note,
            error: null
        }
    } catch(error) {
        return {
            error
        }
    }
}

export async function folderNoteUpdateServer(folderID, note) {
    try {
        await db.collection('folder').doc(folderID).collection('note').doc(note.id).update(note)
        return {
            note,
            error: null
        }
    } catch(error) {
        return {
            error
        }
    }
}

export async function folderNoteOrderUpdateServer(userID, businessID, folderID, note) {
    try {
        await db.collection('user').doc(userID)
        .collection('follow').doc(businessID)
        .collection('folderSubscription').doc(folderID)
        .collection('noteSubscription').doc(note.id).update({order: note.order})
        return {
            note,
            error: null
        }
    } catch(error) {
        return {
            error
        }
    }
}

async function getNoteSubScription(userID, businessID, folderID, noteID) {
    const snapshot = await db.collection('user').doc(userID)
    .collection('follow').doc(businessID)
    .collection('folderSubscription').doc(folderID)
    .collection('noteSubscription').doc(noteID)
    .get()
    if (snapshot) {
        const noteSubscription = snapshot.data()
        return noteSubscription
    }
    return null
}

export async function businssNoteRemoveServer(businessID, noteID) {
    try {
        const businessData = await getBusinessfromBusinessID(businessID)
        if (businessData) {
            await db.collection('business').doc(businessID).collection('note').doc(noteID).delete()
            var noteCount = (businessData.noteCount)?businessData.noteCount:0
            noteCount--
            if (noteCount < 0) {
                noteCount = 0
            }
            await db.collection('business').doc(businessID).update({
                noteCount
            })
        }
        return {
            error: null
        }
    } catch(error) {
        return {
            error
        }
    }
}

export async function folderNoteRemoveServer(userID, businessID, folderID, noteID) {
    try {
        const folderSubscription = await getFolderSubScription(userID, businessID, folderID)
        if (folderSubscription) {
            await db.collection('user').doc(userID)
            .collection('follow').doc(businessID)
            .collection('folderSubscription').doc(folderID)
            .collection('noteSubscription').doc(noteID).delete()
            var noteCount = folderSubscription.noteCount||1
            noteCount--
            await db.collection('user').doc(userID)
            .collection('follow').doc(businessID)
            .collection('folderSubscription').doc(folderID).update({noteCount})
        }
        return {
            error: null
        }
    } catch(error) {
        return {
            error
        }
    }
}

export async function folderRemoveServer(userID, businessID, folderID) {
    try {
        await db.collection('user').doc(userID)
        .collection('follow').doc(businessID)
        .collection('folderSubscription').doc(folderID)
        .delete()
        return {
            error: null
        }
    } catch(error) {
        return {
            error
        }
    }
}

export async function createFolder(ownerID, businessID, createdAt, folderName) {
    try {
        const folder = {
            createdAt,
            name: folderName,
            ownerID
        }
        const folderRef = await db.collection('folder').add(folder)
        const folderID = folderRef.id
        folder.id = folderID
        await db.collection('user').doc(ownerID)
        .collection('follow').doc(businessID)
        .collection('folderSubscription').doc(folderID).set({
            createdAt,
            noteCount: 0
        })
        return {
            folder,
            error: null
        }
    } catch (error) {
        return {
            error
        }
    }
}

export async function editFolder(folderID, folderName) {
    try {
        await db.collection('folder').doc(folderID).update({
            name: folderName,
        })
        return {
            error: null
        }
    } catch (error) {
        return {
            error
        }
    }
}

export async function followBusiness(userID, businessID) {
    try {
        const createdAt = Date.now()
        const subscription = {
            createdAt,
            role: "subscription",
            updatedAt: createdAt
        }
        await db.collection('user').doc(userID).collection('follow').doc(businessID).set(subscription)
        await db.collection('business').doc(businessID).collection('following').doc(userID).set(subscription)
        return true
    } catch (error) {

    }
    return false
}

export async function createBusiness(business) {
    try {
        const businessRef = await db.collection('business').add(business)
        const businessID = businessRef.id
        business.id = businessID
        await db.collection('user').doc(business.ownerID).collection('follow').doc(businessID).set({
            createdAt: business.createdAt,
            role: 'owner',
            updatedAt: business.createdAt
        })
        return {
            business,
            error: null
        }
    } catch (error) {
        return {
            business: null,
            error
        }
    }
}

export async function unfollowBusiness(userID, businessID) {
    try {
        await db.collection('user').doc(userID).collection('follow').doc(businessID).delete()
        await db.collection('business').doc(businessID).collection('following').doc(userID).delete()
        return true
    } catch (error) {

    }
    return false
}

export async function changeBusinessRole(userID, businessID, role) {
    try {
        const updatedAt = Date.now()
        const subscription = {
            updatedAt,
            role,
        }
        await db.collection('user').doc(userID).collection('follow').doc(businessID).update(subscription)
        await db.collection('business').doc(businessID).collection('following').doc(userID).update(subscription)
        return null
    } catch (error) {
        return error
    }
}

export async function updateProfile(userID, profile) {
    try {
        await db.collection('user').doc(userID).update(profile)
        return true
    } catch (error) {

    }
    return false
}

