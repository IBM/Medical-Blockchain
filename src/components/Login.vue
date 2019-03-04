<template>
  <div>
    <button class="btn btn-info btn-sm login-button" v-if="!isUserLoggedIn" v-on:click="login()">
      <Octicon :icon="reply" v-if="isLogin"></Octicon>
      <Octicon :icon="person" v-else-if="!isLogin"></Octicon>
    </button>
    <button class="btn btn-info btn-sm logout-button" v-else-if="isUserLoggedIn" v-on:click="logout()">
      <Octicon :icon="signOut"></Octicon>
    </button>

    <div class="form-group component-inner-container" v-if="isLogin">
      <textarea class="form-control" v-model="token" placeholder="Paste token here..."></textarea>
      <button type="submit" class="btn btn-info btn-sm jwt-submit" v-on:click="verifyLogin()">Login</button>
    </div>
  </div>
</template>                                                     
                                                               
<script>                                                      
import Octicon, { person, reply, signOut } from 'octicons-vue'
import VueJwtDecode from 'vue-jwt-decode'
import config from '@/secrets/config.json'
import { serverBus } from '@/main'

export default {                                             
  name: 'Login',                                             
  props: {
    caller: String
  },
  components: {
    Octicon
  },
  data: () => ({
    person, reply, signOut,
    isLogin: false,
    isUserLoggedIn: false,
    token: ''
  }),
  methods: {
    login () {
      this.isLogin = !this.isLogin
      if (this.isLogin) {
        window.open(config.iss + '/onboarding/v1/logins', 'loginwindow', 'height=435,width=962')
      }
      serverBus.$emit(`${this.caller}-isLogin`, this.isLogin)
    },

    logout () {
      sessionStorage[`${this.caller}-token`] = ""
      console.log("logout success")
      this.isUserLoggedIn = false
      serverBus.$emit(`${this.caller}-isLoggedIn`, false)
      serverBus.$emit(`${this.caller}-jwt`, {})
    },

    verifyLogin () {
      if (!this.token) {
        this.token = ''
        return this.loginFail()
      }

      return this.loginSuccess()
    },

    loginSuccess () {
      sessionStorage[`${this.caller}-token`] = this.token
      console.log("login success")
      this.isUserLoggedIn = true
      this.isLogin = !this.isLogin
      serverBus.$emit(`${this.caller}-isLogin`, this.isLogin)
      serverBus.$emit(`${this.caller}-isLoggedIn`, true)
      serverBus.$emit(`${this.caller}-jwt`, VueJwtDecode.decode(this.token))
      this.token = ''
    },

    loginFail () {
      console.log("login fail")
    }
  }
}                                                                         
</script>                                                                  
                                                                            
<!-- Add "scoped" attribute to limit CSS to this component only -->          
<style scoped>                           

.login-button {
  position: relative;
  top: -40px;
  left: calc(50vw/2 - 30px);
}

.logout-button {
  position: relative;
  top: -40px;
  left: calc(-50vw/2 + 30px);
}

.jwt-submit {
  margin-top: 10px;
}

textarea {
  height: calc(50vh - 160px) !important;
  background-color: rgb(73, 73, 73) !important;
  color: white !important;
}

</style>
