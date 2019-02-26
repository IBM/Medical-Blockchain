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
      <textarea rows="10" class="form-control" v-model="token" placeholder="Paste token here..."></textarea>
      <button type="submit" class="btn btn-info btn-sm" v-on:click="verifyLogin()">Login</button>
    </div>
  </div>
</template>                                                     
                                                               
<script>                                                      
import Octicon, { person, reply, signOut } from 'octicons-vue'
import VueJwtDecode from 'vue-jwt-decode'
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
    href: 'https://pbsa-prod.us-south.containers.mybluemix.net/d06f7015-3474-40ac-ae5d-d77f220fa068/onboarding/v1/logins',
    token: ''
  }),
  methods: {
    login () {
      this.isLogin = !this.isLogin
      if (this.isLogin) {
        window.open(this.href, 'loginwindow', 'height=435,width=962')
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
      if (!this.token)
        return this.loginFail()

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
  top: -30px;
  left: calc(50vw/2 - 30px);
}

.logout-button {
  position: relative;
  top: -30px;
  left: calc(-50vw/2 + 30px);
}

</style>
