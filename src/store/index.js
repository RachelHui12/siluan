
import Vue from 'vue'


const state={
	loginway:'login',
	show:'shop',
	clientheight:0,
	clientwidth:0,

	user: window.sessionStorage.getItem('user'),
	selectedItem:{},
	sessionSelectedItem:{},
	cart:[]
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
}
const actions={

	//改变登录方式
	changeLoginway({commit},type){
		commit('CHANGE_LOGINWAY',type)
	}
}
const getters={
	getLoginway:function(state){
		return state.loginway
	}
}
export default new Vuex.Store({
	state,
	mutations,
	actions,
	getters
})