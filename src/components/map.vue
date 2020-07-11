<template lang='html'>

    <div class="allmap" id="allmap"></div>
</template>
<script>
//     import Vue from 'vue';
// import { debug } from 'util';
import mapboxgl from 'mapbox-gl'
export default {
        props:{
            isEdit:Boolean,
            default:false
        },
        data () {
        return {
           bmap:"",
           addBaiduMapResourceStatus:"fail",
           isSetPoint:false
        }
    },
    async created(){
       await this.addBaiduMapResource();
       this.addBaiduMapResourceStatus="success";
    },
    mounted(){
        if(!this.isEdit){
             setTimeout(()=>{
                this.init(0,0)
            },500)
        }
    },
    methods:{
        addBaiduMapResource(){
            //异步加载百度地图资源
            return new Promise((resolve,reject)=>{
                 var script=document.createElement("script"); 
                script.setAttribute("type", "text/javascript"); 
                script.setAttribute("src", "http://api.map.baidu.com/api?v=3.0&ak=YVRSGjElVmaurEnwamjKkyojWf7gWeQ0&callback=init"); 
                var heads = document.getElementsByTagName("head"); 
                if(heads.length){
                    heads[0].appendChild(script); 
                }   
                else{
                    document.documentElement.appendChild(script); 
                }
                script.onload=(()=>{
                     resolve()
                })
            })
        },
        init(lng,lat){
            var bmap = new BMap.Map("allmap");
            this.bmap=bmap;
            bmap.setDefaultCursor("url('bird.cur')");
            var point= new BMap.Point(lng,lat);
            bmap.centerAndZoom(point,12)
            var myCity=	 new BMap.LocalCity();
            myCity.get(myFun);
            function myFun(result){
                var cityName = result.name;
                bmap.setCenter(cityName);
            }
            bmap.addEventListener("click",(e)=>{
               var marker=new BMap.Marker(new BMap.Point(e.point.lng,e.point.lat))
                try{
                    bmap.clearOverlays();
                }
                catch(err){
                    // 删除所有点
                    var allOverlay = bmap.getOverlays();
                    for (var i = 0; i < allOverlay.length -1; i++){
                    bmap.removeOverlay(allOverlay[i]);
                    }
                }
                bmap.addOverlay(marker);    //增加点
                this.$emit("position",e.point.lng,e.point.lat)
            });
        },
        search(searchValue){
            var map = this.bmap;
            var local = new BMap.LocalSearch(map, {
                renderOptions:{map: map}
            });
            local.search(searchValue);
        },
        async set(lng,lat){
            if(this.addBaiduMapResourceStatus==="fail"){
                await this.addBaiduMapResource()
            }
            this.$nextTick(()=>{
                if(BMap&&BMap.Map){
                    var bmap = new BMap.Map("allmap");
                    this.bmap=bmap;
                    this.bmap.centerAndZoom(new BMap.Point(lng,lat),12);
                    var marker=new BMap.Marker(new BMap.Point(lng,lat));
                    this.bmap.addOverlay(marker);
                    bmap.addEventListener("click",(e)=>{
                    var marker=new BMap.Marker(new BMap.Point(e.point.lng,e.point.lat))
                        try{
                            bmap.clearOverlays();
                        }
                        catch(err){
                            // 删除所有点
                            var allOverlay = bmap.getOverlays();
                            for (var i = 0; i < allOverlay.length -1; i++){
                            bmap.removeOverlay(allOverlay[i]);
                            }
                        }
                        if(this.isSetPoint===false){
                            bmap.addOverlay(marker);    //增加点
                            this.$emit("position",e.point.lng,e.point.lat);
                            this.isSetPoint=true;
                        }
                    });
                }else{
                    this.addBaiduMapResourceStatus==="fail";
                    this.set(lng,lat)
                }
                
            })
           
        }
    }
  }
</script>
<style scoped>
    #allmap{
        width: 100%;
        height:  100%;
    }
</style>