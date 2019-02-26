import axios from 'axios'

const fetch = () => {
  return axios.create({
    baseURL: 'https://cors-anywhere.herokuapp.com/' + 'https://pbsa-prod.us-south.containers.mybluemix.net/d06f7015-3474-40ac-ae5d-d77f220fa068/onboarding',
    headers: {
      'accept': 'application/json',
      'Authorization': `bearer ${sessionStorage['org-token']}`
    }
  })
}

export default {
  putOrgUser (model) {
    return fetch().put(`/v1/organizations/${model.orgId}/users?solutionId=${model.solutionId}`, {
      "name": model.name,
      "userId": model.userId,
      "roles": [
        model.roleId
      ]
    })
  },

  delOrgUser (model) {
    return fetch().delete(`/v1/organizations/${model.orgId}/users/${model.userDocId}?solutionId=${model.solutionId}`)
  },

}
