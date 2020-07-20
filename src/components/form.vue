<template>
<div>
  <van-nav-bar
  title="上传信息"
  left-text="返回"
  left-arrow
  @click-left="onClickLeft"
/>
<van-form @submit="onSubmit">
  <van-field
    v-model="name"
    name="名称"
    label="名称"
    placeholder="名称"
    :rules="[{ required: true, message: '请填写名称' }]"
  />
  <van-field
    readonly
    clickable
    name="picker"
    :value="type"
    label="四乱类型"
    placeholder="点击选择四乱类型"
    @click="showPicker = true"
  />
<van-popup v-model="showPicker" position="bottom">
  <van-picker
    show-toolbar
    :columns="columns"
    @confirm="ontype"
    @cancel="showPicker = false"
  />
</van-popup>

    <van-field
    v-model="description"
    type="text"
    name="描述信息"
    label="描述信息"
    placeholder="描述信息"
    :rules="[{ required: true, message: '请填写描述信息' }]"
  />
  <van-field name="uploader" label="文件上传">
  <template #input>
    <van-uploader v-model="uploader" />
  </template>
</van-field>
<van-field
  readonly
  clickable
  name="calendar"
  :value="dates"
  label="日期"
  placeholder="点击选择日期"
  @click="showCalendar = true"
/>
<van-calendar v-model="showCalendar" @confirm="ondate" />
  <div style="margin: 16px;">
    <van-button round block type="info" native-type="submit">
      提交
    </van-button>
  </div>
</van-form>

</div>
</template>

<script>
import { EventBus } from "../eventbus.js";
import axios from 'axios';
import {mapGetters} from 'vuex'
import store from '@/store'
export default {
    data(){
        return{
            name:'',
            type:'',
            description:'',
            date:'',
            dates: '',
            showCalendar: false,
            uploader:[],
            columns: ['乱建', '乱堆', '乱占', '乱采'],
            showPicker: false,
            fea:null
        }
    },
    computed:{
      ...mapGetters({
				feature:'getfeature',
			}),
    },
    methods:{
    ondate(date) {
      this.dates = `${date.getMonth() + 1}/${date.getDate()}`;
      this.showCalendar = false;
    },
    onSubmit(){
        var upload={
          name:this.name,
          type:this.type,
          des:this.description,
          photo:this.uploader,
          date:this.dates,
          fea:this.feature
        }
        
        console.log(upload);
        axios.post('api/upload',upload);
        this.$router.push('/map');
    },
    ontype(value) {
      this.type = value;
      this.showPicker = false;
      console.log(this.fea);

    },
    onClickLeft(){
      this.$router.push('/map');
    },
    loadfeature(feature){
      console.log('111');
      this.fea=feature;
    }
    },
    created(){
      console.log(store.state.feature);
      EventBus.$on("upload", this.loadfeature);
    },
    beforeDestroy(){
      EventBus.$off("upload", this.loadfeature);
    }
}
</script>