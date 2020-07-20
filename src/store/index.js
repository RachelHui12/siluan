
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
const state={
	loginway:'login',
	show:'map',
	clientheight:0,
	clientwidth:0,

	user: window.sessionStorage.getItem('user'),
	center: [114, 30],
	zoom:13,
	json:[],
	feature:''
}
// mutation：（必须是同步函数）
// 更改store中state值的唯一方法就是提交mutation，每个 mutation 都有一个字符串的 事件类型 (type) 和 一个 回调函数 (handler)。这个回调函数就是我们实际进行状态更改的地方，并且它会接受 state 作为第一个参数

const mutations={

	CHANGE_LOGINWAY(state,type){
		state.loginway=type
	},
	GET_USER: (state, data) => {
		// 把用户名存起来
		state.user = data
		window.sessionStorage.setItem('user', data)
	},
	GET_FEATURES:(state, data) => {
		// 把特征存起来
		state.feature = data
	},
	GET_CENTER:(state, data) => {
		state.center = data
	},
	GET_ZOOM:(state, data) => {
		state.zoom = data
	},
}
const actions={

	//改变登录方式
	changeLoginway({commit},type){
		commit('CHANGE_LOGINWAY',type)
	},
	changefeatures({commit},type){
		commit('GET_FEATURES',type)
	},
	changecenter({commit},type){
		commit('GET_CENTER',type)
	},
	changezoom({commit},type){
		commit('GET_ZOOM',type)
	},
}
const getters={
	getLoginway:function(state){
		return state.loginway
	},
	getfeature:function(state){
		return state.feature
	},
	getMapcenter:function(state){
		return state.center
	},
	getzoom:function(state){
		return state.zoom
	},
}
export default new Vuex.Store({
	state,
	mutations,
	actions,
	getters
})