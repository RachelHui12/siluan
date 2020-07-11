<template>
	<div class="login">
		<div class="logo">
			<!-- <img src="../assets/logo.jpg" alt=""> -->
		<h2 style="color: #569CD6;">河湖四乱核查系统</h2>	
		</div>
		<!-- 用户名 -->
		<InputGroup 
			type="text" 
			placeholder="用户名"
			v-model="phone"
			
			:disabled="disabled"
			:error="errors.phone"
			
		/>
		<!-- 输入验证码 -->
		<InputGroup 
			type="password" 
			v-model="verifyCode"
			placeholder="密码"
			:error="errors.code"
		/>
		<!-- 用户服务协议 -->
    <div class="login_des">
      <p>
        新用户登录即自动注册，表示已同意
        <span>《用户服务协议》</span>
      </p>
    </div>
		<!-- 登录按钮 -->
    <div class="login_btn">
      <button @click="handleLogin" :disabled="isClick">登录</button>
    </div>
	<div v-if="status">
     <p style="color:red;">用户名或密码错误</p>
    </div>
	</div>
</template>
<script>
	import InputGroup from './InputGroup'
import axios from 'axios';

	export default {
		name:"login",
		data() {
			return {
				phone:"", //用户名
				verifyCode:"", //验证码
				disabled:false,  
				errors:{}, //验证提示信息
				status:false,
			}
		},
		computed: {
			//用户名和验证码都不能为空
			isClick(){
				if(!this.phone || !this.verifyCode) {
					return true
				} else {
					return false
				}
				
			}
		},
		methods: {
			validatePhone(){
				//判断输入的用户名是否合法
				if(!this.phone) {
					this.errors = {
						phone:"用户名不能为空"
					}
					// return false
				} else {
					this.errors ={}
					return true
				}
			},
			handleLogin() {
				//点击发送
				// axios.get('api/chinatimeline').then(response =>{
				// 	this.chartData.rows = response.data;
				// 	})
				// .catch(function(err){
				// console.log(err);
				// });
				axios.post('api/getusers',{user: this.phone,password:this.verifyCode}).then((response) => {
					if(response.data=='1' ){
						
						this.$router.push('/map');
						this.status=false;
					}
					else{
						this.status=true;
					}
					}) ;
				// if(this.phone=='admin' && this.verifyCode=='123'){
				// 	this.$router.push('/map');
				// 	this.status=false;
					
				// }
				// else{
				// 	this.status=true;
				// }
			}
		},
		components:{
			InputGroup
		}
	}
</script>
<style scoped>
	.login {
		width: 100%;
		height: 100%;
		padding: 30px;
		box-sizing: border-box;
		background-color: white;
		overflow: hidden;
	}
	.logo {
		text-align: center;
	}
	.logo img {
		width: 150px
	}
	.text_group,
	.login_des,
	.login_btn {
		margin-top: 20px;
	}
	.login_des span{
		color: #4d90fe;
	}
	.login_btn button {
		width: 100%;
		height: 40px;
		background-color: #48ca38;
		border-radius: 4px;
		color: white;
		font-size: 14px;
		border:none;
		outline: none;
	}
	.login_btn button[disabled] {
		background-color: #8bda81;
	}
</style>
