<template>
<div class="component-container">
  <h3>Patient</h3>
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
        
        <div class="table-wrapper">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email Id</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="2"><input type="text" v-model="patient.acladdemailid" class="form-control" name="emailid" id="emailid" placeholder="Enter Email ID" autocomplete="off" /></td>
                <td>
                  <a class="add" title="Add" @click="addAccess"><Octicon :icon="plus"></Octicon></a>
                </td>
              </tr>
              <tr v-for="user in userListForDoc">
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <a class="delete" title="Delete" @click="deleteAccess(user)"><Octicon :icon="trashcan"></Octicon></a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="component-shell-container" v-if="currentTab!='acl'">
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
  { title: 'Upload document', value: 'post-doc'},
  { title: 'Get document', value: 'get-doc'},
  { title: 'Access control', value: 'acl'},
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
    jwt: {}
  }),
  created () {
    serverBus.$on('allOrgs', (allOrgs) => {
      this.orgs = allOrgs
      console.log(allOrgs)
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
      this.patient.acldocid = null
      if (newTab == "get-doc" || newTab == "acl") {
        this.docListForUser = []
        this.getDocListForUser()
      }
    },

    handleFileUpload() {
      this.patient.postdocfile = this.$refs.file.files[0]
    },
    
    async postDocJson () {
      var docName = this.patient.postdocname
      var docContent = this.patient.postdoccontent
     
      if (docName && docContent) {
        const apiResponse = await Api.postDocJson({
          name: docName,
          content: docContent
        })
        this.response = apiResponse.data
        this.docStatusPoll = setInterval(() => {
          this.getPostDocStatus(apiResponse.data.response.correlationId, docName)
        }, 1000)
        setTimeout(() => {
          clearInterval(this.docStatusPoll)
        }, 10*1000)
      }
    },

    async getPostDocStatus (corrId, docName) {
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

          RedisApi.postUserToDocMapping([this.jwt.uid], {
            id: Object.keys(apiResponse.data[corrId].documentStatus)[0],
            name: docName
          })
          RedisApi.postDocToUserMapping(Object.keys(apiResponse.data[corrId].documentStatus)[0], [{
            id: this.jwt.uid,
            name: userName,
            email: userEmail
          }])
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
        await RedisApi.postUserToDocMapping([userId], {
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
  float: right;
}

.table-wrapper {
  width: 100%;
  background: #fff;
  box-shadow: 0 1px 1px rgba(0,0,0,.05);
}

.table {
  margin-bottom: 0;
}

.table-wrapper {
  overflow: auto;
  height: calc(50vh - 185px);
}

table.table tr th, table.table tr td {
  border-color: #e9e9e9;
  vertical-align: middle;
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

</style>
