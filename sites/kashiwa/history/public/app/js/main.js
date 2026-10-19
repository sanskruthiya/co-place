const map = L.map('map', {
    zoomControl: false,
    zoomSnap: 0.5,
    minZoom: 14,
    maxZoom: 17
}).setView([35.8622,139.9709],16);

const bounds = [[35.9500,139.8500], [35.7000,140.1500]];
map.setMaxBounds(bounds);

//const basemap_osm = L.tileLayer('https://{s}.tile.openstreetmap.jp/{z}/{x}/{y}.png', {attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',maxZoom: 17});
//const basemap_gsi_new = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg', {attribution: '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">地理院タイル</a>',maxZoom: 17});
const basemap_gsi_2019 = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/nendophoto2019/{z}/{x}/{y}.png', {attribution: '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">地理院タイル</a>',maxZoom: 17,errorTileUrl:'app/css/images/noimage.png'});
const basemap_gsi_2008 = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/nendophoto2008/{z}/{x}/{y}.png', {attribution: '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">地理院タイル</a>',maxZoom: 17,errorTileUrl:'app/css/images/noimage.png'});
const basemap_gsi_80s = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/gazo3/{z}/{x}/{y}.jpg', {attribution: '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">地理院タイル</a>',maxZoom: 17,errorTileUrl:'app/css/images/noimage.png'});
const basemap_gsi_70s = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/gazo1/{z}/{x}/{y}.jpg', {attribution: '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">地理院タイル</a>',maxZoom: 17,errorTileUrl:'app/css/images/noimage.png'});
const basemap_gsi_60s = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/ort_old10/{z}/{x}/{y}.png', {attribution: '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">地理院タイル</a>',maxZoom: 17,errorTileUrl:'app/css/images/noimage.png'});

const boundary_style = {"fillColor":"transparent", "color":"#ff7800", "weight":5, "opacity": 0.7};
const boundary_layer = new L.geoJson(json_boundary, {style:boundary_style});

const label_marker = {
    radius: 0,
    fillColor: "transparent",
    color: "transparent",
    weight: 0,
    opacity: 0,
    fillOpacity: 1.0
};

const TooltipClass = {
    'className': 'class-tooltip'
}
  
function onEachFeature_label(feature, layer){
    const label = feature.properties.name_tag;
    const tooltipContent = '<p class="tipstyle03">'+label+'</p>';
    layer.bindTooltip(tooltipContent, {permanent: true, direction: 'center', opacity:0.9, ...TooltipClass});
}

const label_layer = new L.geoJson(label_data, {
    onEachFeature: onEachFeature_label,
    pointToLayer: function(feature, latlng){
        return L.circleMarker(latlng, label_marker);
    }
});

/*
map.on('zoomend', function() {
    if (map.getZoom() < 16){
        label_layer.clearLayers();
        label_layer.addData(label_data_1)
        label_layer.addTo(map)
    }else{
        label_layer.clearLayers();
        label_layer.addData(label_data_2)
        label_layer.addTo(map)
    }
    });

map.zoomIn(0.5);
*/

label_layer.addTo(map);
boundary_layer.addTo(map);
basemap_gsi_2019.addTo(map);

const overlayMaps = {
    '<i class="fas fa-font fa-fw" style="color:#555"></i><i class="fa fa-caret-right fa-fw" style="color:grey"></i> ラベル': label_layer,
    //'ー<i class="fa fa-caret-right fa-fw" style="color:#555"></i>柏市域界': boundary_layer
};

const baseMaps = {
    //'<i class="far fa-image" style="color:#555"></i><i class="fa fa-caret-right fa-fw" style="color:#555"></i>最新': basemap_gsi_new,
    '<i class="far fa-image" style="color:#555"></i><i class="fa fa-caret-right fa-fw" style="color:#555"></i>2019年度': basemap_gsi_2019,
    '<i class="far fa-image" style="color:#555"></i><i class="fa fa-caret-right fa-fw" style="color:#555"></i>2008年度': basemap_gsi_2008,
    '<i class="far fa-image" style="color:#555"></i><i class="fa fa-caret-right fa-fw" style="color:#555"></i>1980年代': basemap_gsi_80s,
    '<i class="far fa-image" style="color:#555"></i><i class="fa fa-caret-right fa-fw" style="color:#555"></i>1970年代': basemap_gsi_70s,
    '<i class="far fa-image" style="color:#555"></i><i class="fa fa-caret-right fa-fw" style="color:#555"></i>1960年代': basemap_gsi_60s,
    //'<i class="fas fa-map-marked-alt" style="color:#555"></i><i class="fa fa-caret-right fa-fw" style="color:#555"></i>マップ': basemap_osm
};

const slidemenutitle = '<h3 align="center">柏市の時系列変化マップ</h3><hr class="style01">';
let contents = '<p align="left"><ul><li>国土地理院が提供している<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>の情報を参照し、<span class="style01">柏市の変遷を年代別の空中写真で確認するマップ</span>です。</li>';
contents += '<li>このウェブページは「<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>」で配信されている年代別の空中写真を参照して、当サイト管理者が独自に加工・作成したものです。</li>';
contents += '<li>「1960年代」は1961年～1969年、「1970年代」は1974年～1978年、「1980年代」は1984年～1986年の期間に撮影されたものになります。</li>';
contents += '<li>ラベル表示の内容は「<a href="https://nlftp.mlit.go.jp/ksj/" target="_blank">国土数値情報</a>」から取得した<span class="style01">鉄道駅及びバス停の情報</span>を参照して作成しています（一部、情報が古い可能性があります）。</li>';
contents += '<li><span class="style01">柏市内に滞在中であれば</span>、スマートフォンなどお使いの機器の位置情報取得を許可し、<i class="fas fa-map-marker-alt" style="color:#555"></i>　ボタンを押すことで、<span class="style01">現在位置を表示</span>することができます。市内を散策しながら街の変化を体感してみてください。</li>';
contents += '<li>なお、本ウェブサイトがご利用者様の位置情報等を含め<span class="style01">個人情報を記録することは一切ございません</span>のでご安心ください。</li>';
contents += '<li>ご意見等は<a href="https://form.run/@party--1681740493" target="_blank">問い合わせフォーム（外部サービス）</a>からお知らせください。</li></ul></p>';

L.control.layers(baseMaps, overlayMaps,{collapsed:false}).addTo(map);
/*
if (L.Browser.mobile) {
    L.control.layers(baseMaps, overlayMaps,{collapsed:true}).addTo(map);
}
else{
    L.control.layers(baseMaps, overlayMaps,{collapsed:false}).addTo(map);
}
*/

L.control.slideMenu(slidemenutitle + contents, {width:'280px', icon:'fas fa-info'}).addTo(map);
L.control.locate({position:'topleft', icon:'fas fa-map-marker-alt'}).addTo(map);
L.control.scale({maxWidth:150, metric:true, imperial:false, position: 'bottomleft'}).addTo(map);
