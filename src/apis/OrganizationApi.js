import axios from 'axios'
import config from '@/secrets/config.json'

const fetch = () => {
  return axios.create({
    baseURL: 'https://cors-anywhere.herokuapp.com/' + config.iss + '/onboarding',
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
