import axios from 'axios'
import { uuid } from 'vue-uuid'

const channel = "bds-test"

const fetch = () => {
  return axios.create({
    baseURL: 'https://cors-anywhere.herokuapp.com/' + 'https://pbsa-prod.us-south.containers.mybluemix.net/d06f7015-3474-40ac-ae5d-d77f220fa068/docstore',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `bearer ${sessionStorage['user-patient-token']}`
    }
  })
}

export default {
  getAllDocIds () {
    return fetch().get(`/v1/docstores/${channel}/documents/ids`, {
      params: {
        status: "success"
      }
    })
  },

  getDoc (model) {
    return fetch().get(`/v1/docstores/${channel}/documents/${model.docId}`)
  },

  postDocJson (model) {
    var docId = uuid.v1()

    return fetch().post(`/v1/docstores/${channel}/documents/json/${docId}?document_type=${model.name}`, {
      jsonContent: model.content
    })
  },
  
  getPostDocStatus (model) {
    return fetch().get(`/v2/docstores/transactions`, {
      params: {
        correlation_ids: model.correlationId
      }
    })
  },

  postDoc (model) {
    var docId = uuid.v1()
    var formData = new FormData()
    formData.append('file', model.file)

    return fetch().post(`/v1/docstores/${channel}/documents/files/${docId}?document_type=${model.name}`, {
      formData
    })
  },

}
