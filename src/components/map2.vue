<template>
  <div id="app" v-loading="loading" element-loading-background="rgba(255, 255, 255, 0.4)">
    <div class="map-container">
      <div id="map" style="width: 100vw; height: 100vh"></div>
    </div>
    <div class="map-style-container">
      <el-select v-model="mapStyle" filterable allow-create default-first-option placeholder="Change a map's style"
        size="small" style="width: 100%">
        <el-option v-for="item in mapList" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
      
    </div>
    <div class="upload" @click="upload()">
      <el-button type="small" circle icon="el-icon-upload"></el-button>
    </div>
    <div class="search" @click="search()">
      <el-button type="small" circle icon="el-icon-search"></el-button>
    </div>
  </div>

</template>

<script>
import { EventBus } from "../eventbus.js";
import mapboxgl from 'mapbox-gl'
import turf from 'turf'
import MapboxDraw from 'mapbox-gl-draw'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { Dialog } from 'vant';
import {mapGetters} from 'vuex'
import store from '@/store'
import axios from 'axios';
import { Button } from 'vant';
export default {
    
    data(){
        return{
        positions: [],
        markers:{
            type:null,
            time:null,
            position:null
        },
        polygons:[],
        rawArea: null,
        inputVisible: false,
        inputValue: '',
        loading: false,
        mapOptions: {
        map: null,
        draw: null
        },
        unitList: [{
        value: 0,
        label: 'm² (平方米)'
        },{
        value: 1,
        label: 'ha (公顷)'
        },{
        value: 2,
        label: 'mu (亩)'
        }],
        unit: 0,
        mapList: [{
        value: 'mapbox://styles/mapbox/satellite-v9',
        label: '影像地图'
        },{
        value: 'mapbox://styles/mapbox/streets-v11',
        label: '行政地图'
        }],
        mapStyle: 'mapbox://styles/mapbox/satellite-v9'
        }
        },
        computed: {
          ...mapGetters({
            center:'getMapcenter',
            zoom:'getzoom'
          }),
          'fullname': function(){
              var center_json=this.mapOptions.map.getCenter();
              return this.mapOptions.map.center;
          }
  },
  mounted() {
    this.initMap();
    //从数据库中加载所有四乱地物
  },
  beforeDestroy(){
      this.savemapoptions();
      // this.$store.commit('GET_CENTER',this.mapOptions.map.center)
      // console.log(this.mapOptions.map.center)
  },
  watch: {
    positions: function () {
      this.mapOptions.draw.deleteAll();
      const drawId = 'calculate-polygon';
      if (this.positions.length === 0) {
        return;
      } else if (this.positions.length === 1) {
        this.mapOptions.draw.add({ 
          id: drawId,
          type: 'Feature',
          properties: {},
          geometry: { type: 'Point', coordinates: [this.positions[0].lng, this.positions[0].lat] }
        })
      } else if (this.positions.length === 2) {
        this.mapOptions.draw.add({ 
          id: drawId,
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: this.positions.map(p => [p.lng, p.lat]) }
        }) 
      } else {
        this.mapOptions.draw.add({ 
          id: drawId,
          type: 'Feature',
          properties: {},
          geometry: { type: 'Polygon', coordinates: [
            [...this.positions.map(p => [p.lng, p.lat]), [this.positions[0].lng, this.positions[0].lat]]
          ] }
        });
        this.rawArea = Math.round(turf.area(this.mapOptions.draw.getAll()) * 100) / 100;
      }
    },
    mapStyle: function () {
      this.mapOptions.map.setStyle(this.mapStyle)
    },
    mapOptions:function(){
      var center_json=this.mapOptions.map.getCenter();
       var center=[center_json.lng,center_json.lat];
       this.$store.dispatch('changecenter',center);
       var zoom = this.mapOptions.map.getZoom();
       this.$store.dispatch('changezoom',zoom);
       console.log(zoom);
    }
  },
  methods: {

     savemapoptions(){
       var center_json=this.mapOptions.map.getCenter();
       var center=[center_json.lng,center_json.lat];
       this.$store.dispatch('changecenter',center);
       var zoom = this.mapOptions.map.getZoom();
       this.$store.dispatch('changezoom',zoom);
       console.log(zoom);
     },
     test()
     {
console.log('ok');
     },
    //初始化地图
    initMap() {
      const mapboxToken = 'pk.eyJ1IjoiY3N0YW8iLCJhIjoiY2p1eThkYjgzMHNvbzQ0cnhqd3c3OTU1biJ9.vT96vIXE74LTVV4xXrv0Zw';
      mapboxgl.accessToken = mapboxToken;
      this.mapOptions.map = new mapboxgl.Map({
        container: 'map', // container id
        style: 'mapbox://styles/mapbox/satellite-v9', //hosted style id
        center:this.center, // starting position
        zoom: this.zoom, // starting zoom,
      });
      console.log(this.mapOptions.map.center);
      axios.get('api/init').then((response)=>{
        var polys=response.data;
         
        console.log(response.data);
        this.mapOptions.map.on('load',() => {
          this.mapOptions.map.addLayer({
            'id': 'objectlayer',
            'type': 'fill',
            'source': {
              'type':'geojson',
              'data':polys
            },
            'layout': {},
            'paint': {
            'fill-color': '#088',
            'fill-opacity': 0.8
          }
          });
          // this.mapOptions.map.addLayer({
          //   'id': 'objectlayer-highlight',
          //   'type': 'fill',
          //   'source': {
          //     'type':'geojson',
          //     'data':polys
          //   },
          //   'layout': {},
          //   'paint': {
          //   'fill-color': '#FFFF00',
          //   'fill-opacity': 0.8
          // },
          //   'filter': ['in', 'FIPS', '']
          // });
        });
      });
//function和=>区别？
      this.mapOptions.map.on('click', 'objectlayer', (e) => {
          var feature = e.features[0];
          var name = e.features[0].properties.name;
          var type = e.features[0].properties.genre;
          let description = `
              <div class="ib">
                <p><strong>名字:</strong>${name}</p>
                <p><strong>类型:</strong>${type}</p>
                <button id="solved" >是</button>
                <button id="unsolved" value=${name}>否</button>
              </div>
            `;
    
          var popup = new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(description)
              .addTo(this.mapOptions.map);
          // this.$nextTick(()=>{可以获取dom渲染之后的，mounted是渲染之前的
          this.$nextTick(()=>{
            var x = document.getElementById("solved");
            document.getElementById("solved").onclick=function(){
              console.log('已解决');
              popup.remove();
            };
            var x = document.getElementById("solved");
            document.getElementById("unsolved").onclick=function(name){
              console.log(this.value);
              Dialog.confirm({
                  message: '确定该地不是四乱建筑？',
                })
                  .then(() => {
                    // on confirm
                    // delete
                    axios.post('api/delete',{'id':this.value});
                    location.reload();
                    // this.mapOptions.map.remove()
                  })
                  .catch(() => {
                    // on cancel
                    // location.reload();
                  });
              popup.remove();
            };
          })
        });
        console.log(this.center);
        this.mapOptions.map.on("wheel", function (e) {
            console.log("A wheel event occurred.");
            // var range = map.getZoom();
            console.log(e.lngLat);
        });
        this.mapOptions.map.on('mousemove', function(e) {
          console.log('A mousemove event has occurred.');
          // var center_json=map.getCenter();
          // var center=[center_json.lng,center_json.lat];
          // this.$store.dispatch('changecenter',center);
          // var zoom = this.mapOptions.map.getZoom();
          // this.$store.dispatch('changezoom',zoom);
          console.log(e.lngLat);
        });
      this.mapOptions.draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            point:true,
            polygon: true,
            trash: true
        }
      });
      var nav = new mapboxgl.NavigationControl();
      this.mapOptions.map.addControl(
        new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        localGeocoder: this.forwardGeocoder,
        zoom: this.zoom,
        placeholder: 'Enter search e.g. Lincoln Park',
        mapboxgl: mapboxgl
        })
        );
      document
      .getElementsByClassName("mapboxgl-ctrl-top-right")[0]
      .setAttribute("style", "left:10px;z-index:20");
      this.mapOptions.map.addControl(this.mapOptions.draw);
      this.mapOptions.map.addControl(new mapboxgl.GeolocateControl({
          positionOptions: {
              enableHighAccuracy: true
          },
          zoom: this.zoom,
          showUserLocation:false
      }));

      this.mapOptions.map.on('draw.update', this.updateArea)
      this.mapOptions.map.on('draw.create', this.updateArea);
      this.mapOptions.map.on('draw.delete', this.updateArea);



    },
    forwardGeocoder(query) {
      var matchingFeatures = [];
      var customData = {
        'features': [
        {
        'type': 'Feature',
        'properties': {
        'title': 'Lincoln Park',
        'description':
        'A northside park that is home to the Lincoln Park Zoo'
        },
        'geometry': {
        'coordinates': [-87.637596, 41.940403],
        'type': 'Point'
        }
        },
        {
        'type': 'Feature',
        'properties': {
        'title': 'Burnham Park',
        'description': "A lakefront park on Chicago's south side"
        },
        'geometry': {
        'coordinates': [-87.603735, 41.829985],
        'type': 'Point'
        }
        },
        {
        'type': 'Feature',
        'properties': {
        'title': 'Millennium Park',
        'description':
        'A downtown park known for its art installations and unique architecture'
        },
        'geometry': {
        'coordinates': [-87.622554, 41.882534],
        'type': 'Point'
        }
        },
        {
        'type': 'Feature',
        'properties': {
        'title': 'Grant Park',
        'description':
        "A downtown park that is the site of many of Chicago's favorite festivals and events"
        },
        'geometry': {
        'coordinates': [-87.619185, 41.876367],
        'type': 'Point'
        }
        },
        {
        'type': 'Feature',
        'properties': {
        'title': 'Humboldt Park',
        'description': "A large park on Chicago's northwest side"
        },
        'geometry': {
        'coordinates': [-87.70199, 41.905423],
        'type': 'Point'
        }
        },
        {
        'type': 'Feature',
        'properties': {
        'title': 'Douglas Park',
        'description':
        "A large park near in Chicago's North Lawndale neighborhood"
        },
        'geometry': {
        'coordinates': [-87.699329, 41.860092],
        'type': 'Point'
        }
        },
        {
        'type': 'Feature',
        'properties': {
        'title': 'Calumet Park',
        'description':
        'A park on the Illinois-Indiana border featuring a historic fieldhouse'
        },
        'geometry': {
        'coordinates': [-87.530221, 41.715515],
        'type': 'Point'
        }
        },
        {
        'type': 'Feature',
        'properties': {
        'title': 'Jackson Park',
        'description':
        "A lakeside park that was the site of the 1893 World's Fair"
        },
        'geometry': {
        'coordinates': [-87.580389, 41.783185],
        'type': 'Point'
        }
        },
        {
        'type': 'Feature',
        'properties': {
        'title': 'Columbus Park',
        'description':
        "A large park in Chicago's Austin neighborhood"
        },
        'geometry': {
        'coordinates': [-87.769775, 41.873683],
        'type': 'Point'
        }
        }
        ],
      'type': 'FeatureCollection'
      };
      for (var i = 0; i < customData.features.length; i++) {
      var feature = customData.features[i];
      // handle queries with different capitalization than the source data by calling toLowerCase()
      if (
      feature.properties.title
      .toLowerCase()
      .search(query.toLowerCase()) !== -1
      ) {
      // add a tree emoji as a prefix for custom data results
      // using carmen geojson format: https://github.com/mapbox/carmen/blob/master/carmen-geojson.md
      feature['place_name'] = '🌲 ' + feature.properties.title;
      feature['center'] = feature.geometry.coordinates;
      feature['place_type'] = ['park'];
      matchingFeatures.push(feature);
      }
      }
      return matchingFeatures;
      },
    updateArea (e) {
      this.rawArea = null;
      var featureNum = this.mapOptions.draw.getAll().features.length;
      if (featureNum === 0) {
        this.positions = [];
      } else  {
        if(this.mapOptions.draw.getAll().features.length) {
            
            for(var i=0;i<this.mapOptions.draw.getAll().features.length;i++){
          let geometry = this.mapOptions.draw.getAll().features[i].geometry
          switch(geometry.type) {
            case 'Point':
              this.markers.position = [{lng: geometry.coordinates[0], lat: geometry.coordinates[1]}];
              break;
            case 'LineString':
              this.positions = geometry.coordinates.map(p => ({lng: p[0], lat: p[1]}));
              break;
            case 'Polygon':
              if(geometry.coordinates.length) {
                let temp = geometry.coordinates[0];
                this.polygons = temp.map(p => ({lng: p[0], lat: p[1]})).filter((_, i) => temp.length - 1 != i);
              } else {
                 this.polygons  = [];
              }
              break;
            default:
              break;
          }}
        } else {
          this.positions = [];
        }
      } 
    },
    inputmarker(obj){
        console.log(obj);
        store.dispatch('changefeatures',obj);
        this.$router.push('/form');
    },
    upload(){
      var re= this.mapOptions.draw.getSelected();
      if(re['features'].length ==0){
         Dialog({ message: '没有选择任何图形' });

      }
      else{
      this.inputmarker(re);
      }
    },
    search()
    {
      var bbox=0;
      var features = map.queryRenderedFeatures(bbox, {
          layers: ['counties']
          });
    }
  },
  destroyed() {
  },
}
</script>
<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}

.footer-bar {
  width: 80vw;
  height: 80px;
  position: fixed;
  left: 10vw;
  bottom: 50px;
  z-index: 1;
}

.el-tag+.el-tag {
  margin-left: 10px;
}

.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}

.input-new-tag {
  width: 110px;
  margin-left: 10px;
  vertical-align: bottom;
}

.operation {
  display: flex;
  margin-top: 10px;
}

.map-style-container {
  width: 100px;
  height: 32px;
  position: fixed;
  left: 0px;
  top: 80px;
  z-index: 1;
  display: flex;
}
.upload{

  position: fixed;
  right: 9px;
  top: 200px;
  z-index: 1;
  display: flex;
}
.search{
  position: fixed;
  right: 9px;
  top: 235px;
  z-index: 1;
  display: flex;

}
.position-wrap {
  display: flex;
  margin-left: 10px;
  max-width: calc(80vw - 134px - 110px - 10px);
  overflow-x: auto;
}

.tags {
  display: flex;
  width: 100%;
}

::-webkit-scrollbar {
  width: 2px;
  height: 2px;
}

.el-message-box {
  max-width: 420px;
  width: 100vw;
}
.mapboxgl-ctrl-group{
  top:200px !important;
}
</style>