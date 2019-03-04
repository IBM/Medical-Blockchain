import axios from 'axios'

const fetch = () => {
  return axios.create({
    baseURL: 'https://cors-anywhere.herokuapp.com/' + 'https://pbsa-prod.us-south.containers.mybluemix.net/d06f7015-3474-40ac-ae5d-d77f220fa068/onboarding',
    headers: {
      'accept': 'application/json',
      'Authorization': `bearer ${sessionStorage['admin-token']}`
    }
  })
}

export default {
  getSolutionById (solutionId) {
    return fetch().get('/v1/solutions', {
      params: {
        "solutionId": solutionId
      }
    })
  },

  searchAllUsersForOrgId (model) {
    return fetch().get('/v1/search/users', {
      params: {
        "solutionId": model.solutionId,
        "organizationId": model.organizationId,
        "count": model.count
      }
    })
    .catch(err => {
      console.log(err)
      var dummy = {}
      dummy.data = {}
      return dummy
    })
  },
  
  getSolutionRoles (model) {
    return fetch().get('/v1/roles', {
      params: {
        "solutionId": model.solutionId
      }
    })
  },

  putOrgs (model) {
    return fetch().put(`/v1/organizations?solutionId=${model.solutionId}`, {
      "name": model.name,
      "solutionId": model.solutionId,
      "blockchainUserMode": "user",
      "walletManagerURL": "https://pbsa-prod.us-south.containers.mybluemix.net/d06f7015-3474-40ac-ae5d-d77f220fa068/onboarding"
    })
  },

  searchAllOrgs (model) {
    return fetch().get('/v1/search/organizations', {
      params: {
        "solutionId": model.solutionId
      }
    })
  },

  postOrgAdmin (model) {
    return fetch().post(`/v1/organizations/${model.organizationId}/administrators?solutionId=${model.solutionId}`, {
      "organizationAdministrators": [
        model.adminEmailId
      ],
    })
  },

  deleteOrgAdmin (model) {
    return fetch().delete(`/v1/organizations/${model.organizationId}/administrators/${model.adminId}?solutionId=${model.solutionId}`)
  }
}
