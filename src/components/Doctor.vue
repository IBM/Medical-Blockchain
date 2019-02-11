<template>
<div>
  <div class="component-container" style="display: block;">
    <div>
      <h3>Doctor</h3>
    </div>

    <div>
      <div v-for="org in orgs">
        {{ org.name }}
        <center>
          <button type="button" class="btn btn-warning" style="display: block; margin-bottom: 5px;" v-for="user in org.users">
            {{ user.name }}
          </button>
        </center>
      </div>
    </div>
  </div>
</div>
</template>

<script>                                                      
import Api from '@/apis/DoctorApi'
import Tabs from 'vue-tabs-with-active-line'
import { serverBus } from '@/main'

const TABS = [
  { title: 'Get solution', value: 'get-solution'},
  { title: 'Put Organization', value: 'put-org'},
  { title: 'Post Org Admin', value: 'post-org-admin'},
  { title: 'Delete Org Admin', value: 'delete-org-admin'},
]

export default {
  name: 'Doctor',
  props: {
    solutionId: String
  },
  components: {
    Tabs
  },
  data: () => ({
    response: {},
    orgs: [],
    tabs: TABS,
    currentTab: 'get-solution',
    admin: {}
  }),
  created () {
    serverBus.$on('allOrgsWithUsers', (allOrgsWithUsers) => {
      this.orgs = allOrgsWithUsers
      console.log(this.orgs)
    })
  },
  mounted () {
  },
  methods: {
    tabClick (newTab) {
      this.currentTab = newTab
      this.response = {}
    },

    async getSolutionById () {
      var solId = this.solutionId
      if (solId) {
        const apiResponse = await Api.getSolutionById(solId)
        this.response = apiResponse.data
      }
    },

    async putOrgs () {
      var orgName = this.admin.putorgorgname
      var solId = this.solutionId
      if (orgName && solId) {
        const apiResponse = await Api.putOrgs({
          name: orgName,
          solutionId: solId
        })
        this.response = apiResponse.data
      }
    },

    async searchAllOrgs () {
      var solId = this.solutionId
      if (solId) {
        const apiResponse = await Api.searchAllOrgs({
          solutionId: solId
        })
        this.orgs = apiResponse.data
      }
    },

    async postOrgAdmin () {
      var solId = this.solutionId
      var admin = this.admin.postorgadminadmin
      var orgName = this.admin.postorgadminorgid
      
      var orgId = false
      // Get orgId from orgName
      for (var org of this.orgs.response) {
        if (org.name == orgName) {
          orgId = org.id
          break
        }
      }

      if (solId && admin && orgId) {
        const apiResponse = await Api.postOrgAdmin({
          solutionId: solId,
          organizationId: orgId,
          adminEmailId: admin
        })
        this.response = apiResponse.data
      }
    },
  }
}

</script>                                                                  
                                                                            
<!-- Add "scoped" attribute to limit CSS to this component only -->          
<style scoped>                           

.component-container {
  float: right;
}

.top-div {
  height: 170px;
}

.json-div {
  overflow: scroll;
  text-align: left;
}

</style>
