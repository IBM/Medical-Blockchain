<template>
<div class="component-container">
  <h3 v-if="!isLoggedIn">Organization Admin</h3>
  <h3 v-else-if="isLoggedIn">
    Hi
    <span v-for="org in orgs" v-if="org.id==jwt.oid">
      <span v-for="user in org.users" v-if="user.uid==jwt.uid">
        {{ user.name }}
      </span>
    </span>
  </h3>
  <Login :caller="caller" class="login-component"></Login>

  <div v-if="!isLoggedIn">
    <div class="component-inner-container reactive-list" v-if="!isLogin">
      <center>
        <button type="button" class="btn btn-primary" style="display: block; margin-bottom: 5px;" v-for="org in orgs">
          {{ org.name }}
        </button>
      </center>
    </div>
  </div>

  <div v-if="isLoggedIn">
    <div class="top-div">
      <tabs 
        :tabs="tabs"
        :currentTab="currentTab"
        :wrapper-class="'default-tabs'"
        :tab-class="'default-tabs__item'"
        :tab-active-class="'default-tabs__item_active'"
        :line-class="'default-tabs__active-line'"
        @onClick="tabClick" />
     
      <!-- PUT ORG USER -->
      <div class="component-inner-container" v-if="currentTab=='put-org-user'">
        <div class="form-row">
          <div class="col">
            <input type="text" v-model="admin.putorgusername" class="form-control" placeholder="User Name">
          </div>
          <div class="col">
            <input type="text" v-model="admin.putorguseremail" class="form-control" placeholder="User Email">
          </div>
          <div class="col">
            <select class="form-control" v-model="admin.putorguserrole">
              <option value="" selected disabled>Select Role</option>
              <option v-for="role in roles">
                {{ role.name }}
              </option>
            </select>
          </div>
          <div class="col">
            <button type="button" class="btn btn-success" v-on:click="putOrgUser()">Commit</button>
          </div>
        </div>
      </div>

      <!-- DELETE ORG USER -->
      <div class="component-inner-container" v-if="currentTab=='del-org-user'">
        <div class="form-row">
          <div class="col" v-for="org in orgs" v-if="org.id==jwt.oid">
            <select class="form-control" v-model="admin.delorgusername">
              <option value="" selected disabled>Select User</option>
              <option v-for="user in org.users">
                {{ user.name }}
              </option>
            </select>
          </div>
          <div class="col">
            <button type="button" class="btn btn-success" v-on:click="delOrgUser()">Commit</button>
          </div>
        </div>
      </div>
    </div>

    <div class="component-shell-container">
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
  { title: 'Put Org User', value: 'put-org-user'},
  { title: 'Delete Org User', value: 'del-org-user'},
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
    roles: [],
    tabs: TABS,
    currentTab: 'put-org-user',
    admin: {},
    caller: 'org',
    isLogin: false,
    isLoggedIn: false,
    jwt: {}
  }),
  created () {
    serverBus.$on('allOrgs', (allOrgs) => {
      this.orgs = allOrgs
    }),
    serverBus.$on('allRoles', (allRoles) => {
      this.roles = allRoles
    }),
    serverBus.$on(`${this.caller}-isLogin`, (login) => {
      this.isLogin = login
    }),
    serverBus.$on(`${this.caller}-isLoggedIn`, (login) => {
      this.isLoggedIn = login
    }),
    serverBus.$on(`${this.caller}-jwt`, (decodedJWT) => {
      this.jwt = decodedJWT
      console.log(this.jwt)
    })
  },
  mounted () {
  },
  methods: {
    tabClick (newTab) {
      this.currentTab = newTab
      this.response = {}
    },

    async putOrgUser () {
      var solId = this.solutionId
      var userName = this.admin.putorgusername
      var userEmail = this.admin.putorguseremail
      var roleName = this.admin.putorguserrole
      
      var orgId = this.jwt.oid

      var roleId = null
      // Get roleId from roleName
      for (var role of this.roles) {
        if (role.name == roleName) {
          roleId = role.id
          break
        }
      }
      
      if (orgId && solId && userName && userEmail && roleId) {
        const apiResponse = await Api.putOrgUser({
          orgId: orgId,
          solutionId: solId,
          name: userName,
          userId: userEmail,
          roleId: roleId
        })
        this.response = apiResponse.data
        serverBus.$emit('triggerGetOrgs', orgId)
      }
    },

    async delOrgUser () {
      var solId = this.solutionId
      var userName = this.admin.delorgusername
      
      var orgId = this.jwt.oid

      var userDocId = null
      // Get userDocId from userName
      for (var org of this.orgs) {
        if (org.id == orgId) {
          for (var user of org.users) {
            if (user.name == userName) {
              userDocId = user.uid
              break
            }
          }
        }
      }

      if (orgId && solId && userDocId) {
        const apiResponse = await Api.delOrgUser({
          orgId: orgId,
          solutionId: solId,
          userDocId: userDocId,
        })
        this.response = apiResponse.data
        serverBus.$emit('triggerGetOrgs', orgId)
      }
    },
  }
}

</script>                                                                  
                                                                            
<!-- Add "scoped" attribute to limit CSS to this component only -->          
<style scoped>                           

.component-container {
  position: absolute;
  left: 0;
  top: 50vh;
}

</style>
