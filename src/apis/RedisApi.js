import axios from 'axios'

const fetch = () => {
  return axios.create({
    baseURL: 'http://localhost:8081',
    headers: {
      'accept': 'application/json'
    }
  })
}

export default {
  postUserToDocMapping (users, doc) {
    return fetch().post('/aclusertodoc', {
      "users": users,
      "doc": doc
    })
  },

  getUserToDocMapping (user) {
    return fetch().get(`/aclusertodoc/${user}`)
  },

  postDocToUserMapping (docId, users) {
    return fetch().post('/acldoctouser', {
      "docId": docId,
      "users": users
    })
  },

  getDocToUserMapping (docId) {
    return fetch().get(`/acldoctouser/${docId}`)
  },
  
  patchUserToDocMapping (userId, docId) {
    return fetch().patch('/aclusertodoc', {
      "userId": userId,
      "docId": docId
    })
  },
  
  patchDocToUserMapping (docId, userId) {
    return fetch().patch('/acldoctouser', {
      "docId": docId,
      "userId": userId
    })
  },
}
