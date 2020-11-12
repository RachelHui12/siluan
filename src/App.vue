<template>
  <div id="app" style="width: 100%;height: 100%;">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
   created () {
     //在页面加载时读取localStorage里的状态信息
    localStorage.getItem("center") && this.$store.replaceState(JSON.parse(localStorage.getItem("center")));
    
    //在页面刷新时将vuex里的信息保存到localStorage里
    window.addEventListener("beforeunload",()=>{
        localStorage.setItem("center",JSON.stringify(this.$store.state))
    })
  }
}
</script>

<style>

</style>
