<template>
  <div id="app">
    <Admin solutionId="medrec_test_1"></Admin>
    <Doctor></Doctor>
    <Organization solutionId="medrec_test_1"></Organization>
    <Patient></Patient>
  </div>
</template>

<script>

import Admin from '@/components/Admin'
import Organization from '@/components/Organization'
import Doctor from '@/components/Doctor'
import Patient from '@/components/Patient'

export default {
  name: 'app',
  components: {
    Admin,
    Organization,
    Doctor,
    Patient
  },
  created () {
    sessionStorage['org-token'] = ""
    sessionStorage['user-doctor-token'] = ""
    sessionStorage['user-patient-token'] = ""
  }
}

</script>

<style>

body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

h3 {
  padding-top: 7px;
  color: rgb(116, 224, 223) !important;
}

input {
  background-color: rgb(73, 73, 73) !important;
  color: white !important;
}

select {
  background-color: rgb(73, 73, 73) !important;
  color: white !important;
}

::placeholder {
  color: white !important;
  opacity: 0.6 !important;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.tree-view-item-key {
  color: #00ff00;
}

.tree-view-item {
  color: #ffffff;
}

.component-container {
  border: 0.5px solid rgb(73, 73, 73);
  width: 50vw;
  height: 50vh;
  box-sizing: border-box;
  background-color: rgba(23, 23, 23, 1);
}

.expand-panel {
  transition: height 500ms, width 500ms;
  z-index: 9999999;
}

.component-inner-container {
  padding: 20px;
}

.reactive-list {
  height: calc(50vh - 60px);
  overflow: scroll;
}

.top-div {
  height: 110px;
}

.component-shell-container {
  padding: 20px;
  background-color: rgba(73, 73, 73, 1);
  margin-left: 20px;
  margin-right: 20px;
  height: calc(50vh - 158px);
  overflow: scroll;
  text-align: left;
}

.tabs {
  position: relative;
  margin: 0 auto;
}

.tabs__item {
  display: inline-block;
  margin: 0 5px;
  padding: 10px;
  padding-bottom: 8px;
  font-size: 14px;
  letter-spacing: 0.8px;
  color: white;
  text-decoration: none;
  border: none;
  background-color: transparent;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.25s;
}

.tabs__item_active {
  color: white;
}

.tabs__item:hover {
  border-bottom: 2px solid gray;
  color: white;
}

.tabs__item:focus {
  outline: none;
  border-bottom: 2px solid gray;
  color: white;
}

.tabs__item:first-child {
  margin-left: 0;
}

.tabs__item:last-child {
  margin-right: 0;
}

.tabs__active-line {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background-color: white;
	transition: transform 0.4s ease, width 0.4s ease;
}

.login-component {
  height: 0;
}

</style>
