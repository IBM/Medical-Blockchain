<template>
<div>
  <div class="component-container" v-if="!isLoggedIn">
    <h3>Organization Admin</h3>
    <Login :caller="caller"></Login>

    <div class="component-inner-container" v-if="!isLogin">
      <center>
        <button type="button" class="btn btn-primary" style="display: block; margin-bottom: 5px;" v-for="org in orgs">
          {{ org.name }} ({{ org.id }})
        </button>
      </center>
    </div>
  </div>

  <div class="component-container" v-else-if="isLoggedIn">
    <div class="top-div">
      <h3>Organization Admin</h3>
      <tabs 
        :tabs="tabs"
        :currentTab="currentTab"
        :wrapper-class="'default-tabs'"
        :tab-class="'default-tabs__item'"
        :tab-active-class="'default-tabs__item_active'"
        :line-class="'default-tabs__active-line'"
        @onClick="tabClick" />
     
      <!-- GET SOLUTION -->
      <div class="component-inner-container" v-if="currentTab=='get-solution'" @onClick="getSolutionById">
      </div>

      <!-- PUT ORG -->
      <div class="component-inner-container" v-if="currentTab=='put-org'">
        <div class="form-row">
          <div class="col">
            <input type="text" v-model="admin.putorgorgname" class="form-control" placeholder="Organization Name">
          </div>
          <div class="col">
            <button type="button" class="btn btn-success" v-on:click="putOrgs()">Commit</button>
          </div>
        </div>
      </div>

      <!-- POST ORG ADMIN -->
      <div class="component-inner-container" v-if="currentTab=='post-org-admin'" @onClick="searchAllOrgs">
        <div class="form-row">
          <div class="col">
            <select class="form-control" v-model="admin.postorgadminorgid">
              <option value="" selected disabled>Select Organization</option>
              <option v-for="org in orgs">
                {{ org.name }}
              </option>
            </select>
          </div>
          <div class="col">
            <input type="text" v-model="admin.postorgadminadmin" class="form-control" placeholder="Admin Email-Id">
          </div>
          <div class="col">
            <button type="button" class="btn btn-success" v-on:click="postOrgAdmin()">Commit</button>
          </div>
        </div>
      </div>
    </div>

    <div class="component-shell-container json-div">
      <tree-view :data="response" />
    </div>
  </div>
</div>
</template>

<script>                                                      
import Api from '@/apis/OrganizationApi'
import Tabs from 'vue-tabs-with-active-line'
import Login from '@/components/Login'
import { serverBus } from '@/main'

const TABS = [
  { title: 'Get solution', value: 'get-solution'},
  { title: 'Put Organization', value: 'put-org'},
  { title: 'Post Org Admin', value: 'post-org-admin'},
  { title: 'Delete Org Admin', value: 'delete-org-admin'},
]

export default {
  name: 'Organization',
  props: {
    solutionId: String
  },
  components: {
    Tabs,
    Login
  },
  data: () => ({
    response: {},
    orgs: [],
    tabs: TABS,
    currentTab: 'get-solution',
    admin: {},
    caller: 'org',
    isLogin: false,
    isLoggedIn: false
  }),
  created () {
    serverBus.$on('allOrgs', (allOrgs) => {
      this.orgs = allOrgs
      this.searchAllUsers()
    }),
    serverBus.$on(`${this.caller}-isLogin`, (login) => {
      this.isLogin = login
    }),
    serverBus.$on(`${this.caller}-isLoggedIn`, (login) => {
      this.isLoggedIn = login
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

    searchAllUsers () {
      for (var orgIndex in this.orgs) {
        this.searchAllUsersForOrgId(this.orgs[orgIndex].id, orgIndex)
      }
      serverBus.$emit('allOrgsWithUsers', this.orgs)
    },

    async searchAllUsersForOrgId (orgId, orgIndex) {
      var solId = this.solutionId
      if (solId) {
        const apiResponse = await Api.searchAllUsersForOrgId({
          solutionId: solId,
          organizationId: orgId,
          count: false
        })

        this.$set(this.orgs[orgIndex], 'users', apiResponse.data.response)
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
  float: left;
}

.top-div {
  height: 170px;
}

.json-div {
  overflow: scroll;
  text-align: left;
}

</style>
