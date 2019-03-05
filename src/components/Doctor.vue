<template>
<div class="component-container">
  <h3 v-if="!isLoggedIn">Doctor</h3>
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
        <span v-for="org in orgs">
          <button type="button" class="btn btn-secondary" style="display: block; margin-bottom: 5px;">
            {{ org.name }}
          </button>
          <span v-for="user in org.users">
            <button type="button" class="btn btn-success" style="display: block; margin-bottom: 5px;" v-for="role in roles" v-if="role.id==user.roles[0] && role.name=='Doctor'">
              {{ user.name }} ({{ user.userId }})
            </button>
          </span>
        </span>
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
     
      <!-- POST DOC JSON -->
      <div class="component-inner-container" v-if="currentTab=='post-doc'">
        <div class="form-row">
          <div class="col" v-for="org in orgs" v-if="org.id==jwt.oid">
            <select class="form-control" v-model="doctor.postdocpatientname">
              <option value="" selected disabled>Select Patient</option>
              <option v-for="user in org.users" v-if="isPatient(user)">{{ user.name }}</option>
            </select>
          </div>
          <div class="col">
            <input type="text" v-model="doctor.postdocname" class="form-control" placeholder="Document Name">
          </div>
          <div class="col">
            <input type="text" v-model="doctor.postdoccontent" class="form-control" placeholder="Data">
          </div>
          <div class="col">
            <button type="button" class="btn btn-success" v-on:click="postDocJson()">Commit</button>
          </div>
        </div>
      </div>

      <!-- GET DOC -->
      <div class="component-inner-container" v-if="currentTab=='get-doc'">
        <div class="form-row">
          <div class="col">
            <select class="form-control" v-model="doctor.getdocid">
              <option value="" selected disabled>Select Document</option>
              <option v-for="doc in docListForUser">
                {{ doc.name }}
              </option>
            </select>
          </div>
          <div class="col">
            <button type="button" class="btn btn-success" v-on:click="getDoc()">Commit</button>
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
import Api from '@/apis/DoctorApi'
import RedisApi from '@/apis/RedisApi'
import Tabs from 'vue-tabs-with-active-line'
import Login from '@/components/Login'
import { serverBus } from '@/main'

const TABS = [
  { title: 'Upload Doc', value: 'post-doc'},
  { title: 'Download Doc', value: 'get-doc'},
]

export default {
  name: 'Doctor',
  props: {
  },
  components: {
    Tabs,
    Login
  },
  data: () => ({
    response: {},
    orgs: [],
    roles: [],
    docs: [],
    tabs: TABS,
    currentTab: 'post-doc',
    doctor: {},
    caller: 'user-doctor',
    isLogin: false,
    isLoggedIn: false,
    docListForUser: [],
    jwt: {}
  }),
  created () {
    serverBus.$on('allOrgs', (allOrgs) => {
      this.orgs = allOrgs
      console.log(allOrgs)
    }),
    serverBus.$on('allRoles', (allRoles) => {
      this.roles = allRoles
      console.log(allRoles)
    }),
    serverBus.$on(`${this.caller}-isLogin`, (login) => {
      this.isLogin = login
    }),
    serverBus.$on(`${this.caller}-isLoggedIn`, (login) => {
      this.isLoggedIn = login
      this.doctor = {}
    }),
    serverBus.$on(`${this.caller}-jwt`, (decodedJWT) => {
      this.jwt = decodedJWT
    })
  },
  mounted () {
  },
  methods: {
    tabClick (newTab) {
      this.currentTab = newTab
      this.response = {}
      this.doctor = {}

      if (newTab == "get-doc") {
        this.docListForUser = []
        this.getDocListForUser()
      }
    },

    setRequestProcessing () {
      this.response = {
        status: "Request processing..."
      }
    },

    isPatient (user) {
      for (var role of this.roles) {
        if (role.name == "Patient" && user.roles.length>0 && role.id == user.roles[0]) {
          return true
        }
      }
      return false
    },

    handleFileUpload() {
      this.doctor.postdocfile = this.$refs.file.files[0]
    },
    
    async postDocJson () {
      var patientName = this.doctor.postdocpatientname
      var docName = this.doctor.postdocname
      var docContent = this.doctor.postdoccontent
     
      var patientId = null
      var patientEmail = null

      for (var org of this.orgs) {
        if (org.id == this.jwt.oid) {
          for (var user of org.users) {
            if (user.name == patientName) {
              patientId = user.uid
              patientEmail = user.userId
              break
            }
          }
        }
      }

      if (patientName && patientId && patientEmail && docName && docContent) {
        this.setRequestProcessing()

        const apiResponse = await Api.postDocJson({
          name: docName,
          content: docContent
        })
        this.response = apiResponse.data
        this.getPostDocStatus(apiResponse.data.response.correlationId, docName, patientId, patientName, patientEmail, 0)
      }
    },

    async getPostDocStatus (corrId, docName, patientId, patientName, patientEmail, attempts) {
      if (corrId) {
        const apiResponse = await Api.getPostDocStatus({
          correlationId: corrId
        })
        this.response = apiResponse.data
        if (apiResponse.data[corrId].transactionStatus != "initiated") {
          var userName = null
          var userEmail = null
          for (var org of this.orgs) {
            if (org.id == this.jwt.oid) {
              for (var user of org.users) {
                if (user.uid == this.jwt.uid) {
                  userName = user.name
                  userEmail = user.userId
                  break
                }
              }
            }
          }
          
          RedisApi.postUserToDocMapping(patientId, {
            id: Object.keys(apiResponse.data[corrId].documentStatus)[0],
            name: docName
          })
          RedisApi.postUserToDocMapping(this.jwt.uid, {
            id: Object.keys(apiResponse.data[corrId].documentStatus)[0],
            name: docName
          })
          RedisApi.postDocToUserMapping(Object.keys(apiResponse.data[corrId].documentStatus)[0], [{
            id: patientId,
            name: patientName,
            email: patientEmail
          }, {
            id: this.jwt.uid,
            name: userName,
            email: userEmail
          }])
        } else {
          if (attempts < 5) {
            this.getPostDocStatus(corrId, docName, patientId, patientName, patientEmail, attempts+1)
          }
        }
      }
    },

    async getDoc () {
      var docName = this.doctor.getdocid

      var docId = null
      for (var doc of this.docListForUser) {
        if (doc.name == docName) {
          docId = doc.id
          break
        }
      }

      if (docId) {
        this.setRequestProcessing()

        const apiResponse = await Api.getDoc({
          docId: docId
        })
        this.response = JSON.parse(apiResponse.data.jsonContent)
      }
    },

    async getDocListForUser () {
      var uid = this.jwt.uid
      if (uid) {
        const apiResponse = await RedisApi.getUserToDocMapping(uid)
        this.docListForUser = JSON.parse(apiResponse.data)
      }
    },

    async postDoc () {
      var docName = this.doctor.postdocname
      var docFile = this.doctor.postdocfile
      
      var uid = this.jwt.uid

      if (docName && docFile) {
        const apiResponse = await Api.postDoc({
          name: docName,
          file: docFile
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
  position: absolute;
  left: 50vw;
  top: 0;
}

</style>
