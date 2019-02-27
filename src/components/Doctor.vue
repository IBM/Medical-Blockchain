<template>
<div class="component-container">
  <h3>Doctor</h3>
  <Login :caller="caller" class="login-component"></Login>

  <div v-if="!isLoggedIn">
    <div class="component-inner-container reactive-list" v-if="!isLogin">
      <center>
        <button type="button" class="btn btn-primary" style="display: block; margin-bottom: 5px;" v-for="org in orgs">
          {{ org.name }} ({{ org.id }})
          <button type="button" class="btn btn-warning" style="display: block; margin-bottom: 5px;" v-for="user in org.users">
            {{ user.name }} ({{ user.userId }})
          </button>
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
     
      <!-- POST DOC JSON -->
      <div class="component-inner-container" v-if="currentTab=='post-doc'">
        <div class="form-row">
          <div class="col" v-for="org in orgs" v-if="org.id==jwt.oid">
            <select class="form-control" v-model="doctor.postdocpatientname">
              <option value="" selected disabled>Select Patient</option>
              <option v-for="user in org.users">
                {{ user.name }}
              </option>
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
  { title: 'Upload document', value: 'post-doc'},
  { title: 'Get document', value: 'get-doc'},
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
    })
  },
  mounted () {
  },
  methods: {
    tabClick (newTab) {
      this.currentTab = newTab
      this.response = {}

      if (newTab == "get-doc") {
        this.docListForUser = []
        this.getDocListForUser()
      }
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
        const apiResponse = await Api.postDocJson({
          name: docName,
          content: docContent
        })
        this.response = apiResponse.data
        this.docStatusPoll = setInterval(() => {
          this.getPostDocStatus(apiResponse.data.response.correlationId, docName, patientId, patientName, patientEmail)
        }, 1000)
        setTimeout(() => {
          clearInterval(this.docStatusPoll)
        }, 10*1000)
      }
    },

    async getPostDocStatus (corrId, docName, patientId, patientName, patientEmail) {
      if (corrId) {
        const apiResponse = await Api.getPostDocStatus({
          correlationId: corrId
        })
        this.response = apiResponse.data
        if (apiResponse.data[corrId].transactionStatus != "initiated") {
          clearInterval(this.docStatusPoll)
          
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
          
          RedisApi.postUserToDocMapping([patientId, this.jwt.uid], {
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
        const apiResponse = await Api.getDoc({
          docId: docId
        })
        this.response = apiResponse.data.jsonContent
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
  float: right;
}

</style>
