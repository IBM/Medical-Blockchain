<template>
<div class="component-container">
  <h3 v-if="!isLoggedIn">Patient</h3>
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
            <button type="button" class="btn btn-danger" style="display: block; margin-bottom: 5px;" v-for="role in roles" v-if="role.id==user.roles[0] && role.name=='Patient'">
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
          <div class="col">
            <input type="text" v-model="patient.postdocname" class="form-control" placeholder="Document Name">
          </div>
          <div class="col">
            <input type="text" v-model="patient.postdoccontent" class="form-control" placeholder="Data">
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
            <select class="form-control" v-model="patient.getdocid">
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
      
      <!-- GET ACCESS LOG -->
      <div class="component-inner-container" v-if="currentTab=='get-access-log'">
        <div class="form-row">
          <div class="col">
            <select class="form-control" v-model="patient.getlogdocid">
              <option value="" selected disabled>Select Document</option>
              <option v-for="doc in docListForUser">
                {{ doc.name }}
              </option>
            </select>
          </div>
          <div class="col">
            <button type="button" class="btn btn-success" v-on:click="getAccessLog()">Commit</button>
          </div>
        </div>
        <br>
        
        <div class="table-wrapper" v-if="userListForDocAccess.length>0">
          <table class="table">
            <thead>
              <tr>
                <th>Hospital Name</th>
                <th>Doc Version</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in userListForDocAccess">
                <td>{{ log.name }}</td>
                <td>{{ log.version }}</td>
                <td>{{ log.timestamp }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- ACCESS CONTROL -->
      <div class="component-inner-container" v-if="currentTab=='acl'">
        <div class="form-row">
          <div class="col">
            <select class="form-control" v-model="patient.acldocid" @change="getDocACL">
              <option value="" selected disabled>Select Document</option>
              <option v-for="doc in docListForUser">
                {{ doc.name }}
              </option>
            </select>
          </div>
        </div>
        <br>
        
        <div class="table-wrapper" v-if="userListForDoc.length>0">
          <table class="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email Id</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="2" style="padding-top: 6px; padding-bottom: 6px; background-color: rgb(73,73,73);">
                  <input type="text" v-model="patient.acladdemailid" class="form-control" name="emailid" id="emailid" placeholder="Enter Email ID" autocomplete="off" style="border: 0;"/>
                </td>
                <td>
                  <a class="add" title="Add" @click="addAccess"><Octicon :icon="plus"></Octicon></a>
                </td>
              </tr>
              <tr v-for="user in userListForDoc">
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <a v-if="user.id!=jwt.uid" class="delete" title="Delete" @click="deleteAccess(user)"><Octicon :icon="trashcan"></Octicon></a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="component-shell-container" v-if="currentTab!='acl' && currentTab!='get-access-log'">
      <tree-view :data="response" />
    </div>
  </div>
</div>
</template>

<script>                                                      
import Api from '@/apis/PatientApi'
import RedisApi from '@/apis/RedisApi'
import Tabs from 'vue-tabs-with-active-line'
import Login from '@/components/Login'
import { serverBus } from '@/main'
import Octicon, { trashcan, plus } from 'octicons-vue'

const TABS = [
  { title: 'Upload Doc', value: 'post-doc'},
  { title: 'Download Doc', value: 'get-doc'},
  { title: 'View Access Log', value: 'get-access-log'},
  { title: 'Doc Permissions', value: 'acl'},
]

export default {
  name: 'Patient',
  props: {
  },
  components: {
    Tabs,
    Octicon,
    Login
  },
  data: () => ({
    trashcan, plus,
    response: {},
    orgs: [],
    roles: [],
    docs: [],
    tabs: TABS,
    currentTab: 'post-doc',
    patient: {},
    caller: 'user-patient',
    isLogin: false,
    isLoggedIn: false,
    docListForUser: [],
    userListForDoc: [],
    userListForDocAccess: [],
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
      this.patient = {}
      this.response = {}
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
      this.patient = {}
      this.userListForDoc = []
      this.userListForDocAccess = []
      if (newTab == "get-doc" || newTab == "acl" || newTab == "get-access-log") {
        this.docListForUser = []
        this.getDocListForUser()
      }
    },

    setRequestProcessing () {
      this.response = {
        status: "Request processing..."
      }
    },

    handleFileUpload() {
      this.patient.postdocfile = this.$refs.file.files[0]
    },
    
    async postDocJson () {
      var docName = this.patient.postdocname
      var docContent = this.patient.postdoccontent
     
      if (docName && docContent) {
        this.setRequestProcessing()

        const apiResponse = await Api.postDocJson({
          name: docName,
          content: docContent
        })
        this.response = apiResponse.data
        this.getPostDocStatus(apiResponse.data.response.correlationId, docName, 0)
      }
    },

    async getPostDocStatus (corrId, docName, attempts) {
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

          RedisApi.postUserToDocMapping(this.jwt.uid, {
            id: Object.keys(apiResponse.data[corrId].documentStatus)[0],
            name: docName
          })
          RedisApi.postDocToUserMapping(Object.keys(apiResponse.data[corrId].documentStatus)[0], [{
            id: this.jwt.uid,
            name: userName,
            email: userEmail
          }])
        } else {
          if (attempts < 5) {
            this.getPostDocStatus(corrId, docName, attempts+1)
          }
        }
      }
    },

    async getDoc () {
      var docName = this.patient.getdocid

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
    
    async getAccessLog () {
      var docName = this.patient.getlogdocid

      var docId = null
      for (var doc of this.docListForUser) {
        if (doc.name == docName) {
          docId = doc.id
          break
        }
      }

      if (docId) {
        const apiResponse = await Api.getAccessLog({
          docId: docId
        })
        for (var log of apiResponse.data.response.accessLog) {
          var orgId = log.transactionUser
          var timestamp = new Date(log.transactionTime).toString()
          var version = log.docVersion

          for (var org of this.orgs) {
            if (org.id == orgId) {
              this.userListForDocAccess.push({
                name: org.name,
                version: version,
                timestamp: timestamp.split("GMT")[0]
              })
              break
            }
          }
        }
      }
    },

    async getDocListForUser () {
      var uid = this.jwt.uid
      if (uid) {
        const apiResponse = await RedisApi.getUserToDocMapping(uid)
        this.docListForUser = JSON.parse(apiResponse.data)
      }
    },

    async getDocACL () {
      var docName = this.patient.acldocid
      
      var docId = null
      for (var doc of this.docListForUser) {
        if (doc.name == docName) {
          docId = doc.id
          break
        }
      }
      
      if (docId) {
        const apiResponse = await RedisApi.getDocToUserMapping(docId)
        this.userListForDoc = JSON.parse(apiResponse.data)
      }
    },

    async addAccess () {
      var emailId = this.patient.acladdemailid

      for (var user of this.userListForDoc) {
        if (user.email == emailId) {
          console.log("User has permissions...")
          this.patient.acladdemailid = ""
          return
        }
      }

      var docName = this.patient.acldocid
     
      var docId = null
      for (var doc of this.docListForUser) {
        if (doc.name == docName) {
          docId = doc.id
          break
        }
      }

      var userId = null
      var userName = null
      for (var org of this.orgs) {
        for (var user of org.users) {
          if (user.userId == emailId) {
            userId = user.uid
            userName = user.name
            break
          }
        }
      }

      if (userId && docId && docName && emailId) {
        await RedisApi.postUserToDocMapping(userId, {
          id: docId,
          name: docName
        })
        await RedisApi.postDocToUserMapping(docId, [{
          id: userId,
          name: userName,
          email: emailId
        }])
        this.patient.acladdemailid = ""
        this.userListForDoc.push({
          id: userId,
          name: userName,
          email: emailId
        })
      }
    },

    async deleteAccess (user) {
      var docName = this.patient.acldocid
     
      var docId = null
      for (var doc of this.docListForUser) {
        if (doc.name == docName) {
          docId = doc.id
          break
        }
      }

      if (docId) {
        await RedisApi.patchUserToDocMapping(user.id, docId)
        await RedisApi.patchDocToUserMapping(docId, user.id)
        for (var index in this.userListForDoc) {
          if (this.userListForDoc[index].id == user.id) {
            this.userListForDoc.splice(index, 1)
            break
          }
        }
      }
    },

    async postDoc () {
      var docName = this.patient.postdocname
      var docFile = this.patient.postdocfile
      
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
  top: 50vh;
}

.table-wrapper {
  width: 100%;
  background-color: rgb(73,73,73);
}

.table {
  border: 0 !important;
  margin-bottom: 0;
  background-color: rgb(73,73,73);
  color: #ffffff;
}

.table-wrapper {
  overflow: auto;
  height: calc(50vh - 185px);
}

table.table tr th, table.table tr td {
  vertical-align: middle;
  border-top: 0;
}

table.table th i {
  font-size: 13px;
  cursor: pointer;
}

table.table td a {
  cursor: pointer;
  display: inline-block;
}

table.table td a.add {
  color: #27C46B;
}

table.table td a.edit {
  color: #FFC107;
}

table.table td a.delete {
  color: #E34724;
}

table.table td i {
  font-size: 19px;
}

table.table td a.add i {
  font-size: 24px;
  margin-right: -1px;
  position: relative;
  top: 3px;
}

table.table tbody tr:nth-child(even) {
  background-color: rgb(93, 93, 93);
}

</style>
