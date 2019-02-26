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
          <div class="table-title">
            <div class="row">
              <div class="col-sm-8"><h2>Document <b>ACL</b></h2></div>
              <div class="col-sm-4">
                <button type="button" class="btn btn-info add-new"><i class="fa fa-plus"></i> Give Access</button>
              </div>
            </div>
          </div>
          <table class="table table-bordered">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email Id</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
                <tr>
                    <td>John Doe</td>
                    <td>admin@admin.comn</td>
                    <td>Doctor</td>
                    <td>
          <a class="add" title="Add" data-toggle="tooltip"><Octicon :icon="plus"></Octicon></a>
                        <a class="delete" title="Delete" data-toggle="tooltip"><Octicon :icon="trashcan"></Octicon></a>
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
          RedisApi.postUserToDocMapping([this.jwt.uid], {
            id: Object.keys(apiResponse.data[corrId].documentStatus)[0],
            name: docName
          })
          RedisApi.postDocToUserMapping(Object.keys(apiResponse.data[corrId].documentStatus)[0], [this.jwt.uid])
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

.table-title {
  margin: 0 0 10px;
}

.table-title h2 {
  margin: 6px 0 0;
  font-size: 18px;
}

.table-title .add-new {
  float: right;
  height: 30px;
  font-weight: bold;
  font-size: 12px;
  text-shadow: none;
  min-width: 100px;
  border-radius: 50px;
  line-height: 13px;
}

table.table {
  table-layout: fixed;
}

table.table tr th, table.table tr td {
  border-color: #e9e9e9;
}

table.table th i {
  font-size: 13px;
  margin: 0 5px;
  cursor: pointer;
}

table.table th:last-child {
  width: 100px;
}

table.table td a {
  cursor: pointer;
  display: inline-block;
  margin: 0 5px;
  min-width: 24px;
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

table.table .form-control {
  height: 32px;
  line-height: 32px;
  box-shadow: none;
  border-radius: 2px;
}

table.table .form-control.error {
  border-color: #f50000;
}

table.table td .add {
  display: none;
}

</style>
