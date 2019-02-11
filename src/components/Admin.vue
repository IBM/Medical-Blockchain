<template>
  <div class="component-container">
    <div class="top-div">
      <h3>Solution Admin</h3>
      <tabs 
        :tabs="tabs"
        :currentTab="currentTab"
        :wrapper-class="'default-tabs'"
        :tab-class="'default-tabs__item'"
        :tab-active-class="'default-tabs__item_active'"
        :line-class="'default-tabs__active-line'"
        @onClick="tabClick" />
     
      <!-- GET SOLUTION -->
      <div class="component-inner-container" v-if="currentTab=='get-solution'">
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
      <div class="component-inner-container" v-if="currentTab=='post-org-admin'">
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
</template>

<script>                                                      
import Api from '@/apis/AdminApi'
import Tabs from 'vue-tabs-with-active-line'
import { serverBus } from '@/main'

const TABS = [
  { title: 'Get solution', value: 'get-solution'},
  { title: 'Put Organization', value: 'put-org'},
  { title: 'Post Org Admin', value: 'post-org-admin'},
  { title: 'Delete Org Admin', value: 'delete-org-admin'},
]

export default {
  name: 'Admin',
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
  mounted () {
    this.getSolutionById()
    this.searchAllOrgs()
  },
  methods: {
    tabClick (newTab) {
      this.currentTab = newTab
      this.response = {}

      if (this.currentTab == 'get-solution')
        this.getSolutionById()
      else if (this.currentTab == 'post-org-admin')
        this.searchAllOrgs()
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
        this.searchAllOrgs()
      }
    },

    async searchAllOrgs () {
      var solId = this.solutionId
      if (solId) {
        const apiResponse = await Api.searchAllOrgs({
          solutionId: solId
        })
        this.orgs = apiResponse.data.response
        serverBus.$emit('allOrgs', this.orgs)
      }
    },

    async postOrgAdmin () {
      var solId = this.solutionId
      var admin = this.admin.postorgadminadmin
      var orgName = this.admin.postorgadminorgid
      
      var orgId = false
      // Get orgId from orgName
      for (var org of this.orgs) {
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
