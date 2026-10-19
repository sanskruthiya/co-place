const folklore_list = [
    {lat:'35.89905', lng:'140.00542', img:'s01.jpg', caption:'1_紅い龍と布施弁天', url:'https:\/\/kankou.kashiwa-cci.or.jp\/folk-tale\/story-01', thumbnail:'./app/js/image/s01.jpg'},
    {lat:'35.89905', lng:'140.00542', img:'s02.jpg', caption:'2_目つぶしの絵馬', url:'https:\/\/kankou.kashiwa-cci.or.jp\/folk-tale\/story-02', thumbnail:'./app/js/image/s02.jpg'},
    {lat:'35.86623', lng:'139.97610', img:'s03.jpg', caption:'3_雉子とにわとり', url:'https:\/\/kankou.kashiwa-cci.or.jp\/folk-tale\/story-03', thumbnail:'./app/js/image/s03.jpg'},
    {lat:'35.86846', lng:'139.99091', img:'s04.jpg', caption:'4_手賀沼にもぐった牛', url:'https:\/\/kankou.kashiwa-cci.or.jp\/folk-tale\/story-04', thumbnail:'./app/js/image/s04.jpg'},
    {lat:'35.85227', lng:'140.03619', img:'s05.jpg', caption:'5_地獄から戻ったお姫様', url:'https:\/\/kankou.kashiwa-cci.or.jp\/folk-tale\/story-05', thumbnail:'./app/js/image/s05.jpg'},
    {lat:'35.83857', lng:'140.05303', img:'s06.jpg', caption:'6_夜あるくお地蔵さま', url:'https:\/\/kankou.kashiwa-cci.or.jp\/folk-tale\/story-06', thumbnail:'./app/js/image/s06.jpg'},
    {lat:'35.91913', lng:'139.95292', img:'s07.jpg', caption:'7_善哉庵の尼さん', url:'https:\/\/kankou.kashiwa-cci.or.jp\/folk-tale\/story-07', thumbnail:'./app/js/image/s07.jpg'},
    {lat:'35.92004', lng:'139.95295', img:'s08.jpg', caption:'8_底見ずの池', url:'https:\/\/kankou.kashiwa-cci.or.jp\/folk-tale\/story-08', thumbnail:'./app/js/image/s08.jpg'},
    {lat:'35.90500', lng:'139.97280', img:'s09.jpg', caption:'9_城の越し', url:'https:\/\/kankou.kashiwa-cci.or.jp\/folk-tale\/story-09', thumbnail:'./app/js/image/s09.jpg'},
    {lat:'35.89724', lng:'140.00453', img:'s10.jpg', caption:'10_でいだらぼっち その1', url:'https:\/\/kankou.kashiwa-cci.or.jp\/folk-tale\/story-10', thumbnail:'./app/js/image/s10.jpg'},
    {lat:'35.90800', lng:'140.00155', img:'s11.jpg', caption:'11_七里ヶ渡し', url:'https:\/\/kankou.kashiwa-cci.or.jp\/folk-tale\/story-11', thumbnail:'./app/js/image/s11.jpg'},
    {lat:'35.90281', lng:'139.94290', img:'s12.jpg', caption:'12_こんぶくろ池 その1', url:'https:\/\/kankou.kashiwa-cci.or.jp\/folk-tale\/story-12', thumbnail:'./app/js/image/s12.jpg'},
    {lat:'35.90281', lng:'139.94290', img:'s13.jpg', caption:'13_こんぶくろ池 その2', url:'https:\/\/kankou.kashiwa-cci.or.jp\/folk-tale\/story-13', thumbnail:'./app/js/image/s13.jpg'},
    {lat:'35.87612', lng:'139.95637', img:'s14.jpg', caption:'14_うなぎ道・大杉みち', url:'https:\/\/kankou.kashiwa-cci.or.jp\/folk-tale\/story-14', thumbnail:'./app/js/image/s14.jpg'},
    {lat:'35.87328', lng:'139.98072', img:'s15.jpg', caption:'15_野馬を呼ぶ丘', url:'https:\/\/kankou.kashiwa-cci.or.jp\/folk-tale\/story-15', thumbnail:'./app/js/image/s15.jpg'},
    {lat:'35.86363', lng:'139.98070', img:'s16.jpg', caption:'16_きつねつき', url:'https:\/\/kankou.kashiwa-cci.or.jp\/folk-tale\/story-16', thumbnail:'./app/js/image/s16.jpg'},
    {lat:'35.85959', lng:'139.97371', img:'s17.jpg', caption:'17_水戸屋稲荷物語', url:'https:\/\/kankou.kashiwa-cci.or.jp\/folk-tale\/story-17', thumbnail:'./app/js/image/s17.jpg'},
    {lat:'35.85854', lng:'139.99570', img:'s18.jpg', caption:'18_食べかけ雑煮', url:'https:\/\/kankou.kashiwa-cci.or.jp\/folk-tale\/story-18', thumbnail:'./app/js/image/s18.jpg'},
    {lat:'35.86339', lng:'140.00038', img:'s19.jpg', caption:'19_藤姫の恋', url:'https:\/\/kankou.kashiwa-cci.or.jp\/folk-tale\/story-19', thumbnail:'./app/js/image/s19.jpg'},
    {lat:'35.84314', lng:'139.97907', img:'s20.jpg', caption:'20_法林寺の大いちょう', url:'https:\/\/kankou.kashiwa-cci.or.jp\/folk-tale\/story-20', thumbnail:'./app/js/image/s20.jpg'},
    {lat:'35.84291', lng:'139.97519', img:'s21.jpg', caption:'21_ゆずの木', url:'https:\/\/kankou.kashiwa-cci.or.jp\/folk-tale\/story-21', thumbnail:'./app/js/image/s21.jpg'},
    {lat:'35.85436', lng:'139.94792', img:'s22.jpg', caption:'22_ごろが池の弁天さま', url:'https:\/\/kankou.kashiwa-cci.or.jp\/folk-tale\/story-22', thumbnail:'./app/js/image/s22.jpg'},
    {lat:'35.83112', lng:'139.98638', img:'s23.jpg', caption:'23_鷲山のむじな', url:'https:\/\/kankou.kashiwa-cci.or.jp\/folk-tale\/story-23', thumbnail:'./app/js/image/s23.jpg'},
    {lat:'35.83850', lng:'139.98626', img:'s24.jpg', caption:'24_まれいど', url:'https:\/\/kankou.kashiwa-cci.or.jp\/folk-tale\/story-24', thumbnail:'./app/js/image/s24.jpg'},
    {lat:'35.83887', lng:'139.98928', img:'s25.jpg', caption:'25_厄病おん出し', url:'https:\/\/kankou.kashiwa-cci.or.jp\/folk-tale\/story-25', thumbnail:'./app/js/image/s25.jpg'},
    {lat:'35.81729', lng:'139.98818', img:'s26.jpg', caption:'26_でいだらぼっち その2', url:'https:\/\/kankou.kashiwa-cci.or.jp\/folk-tale\/story-26', thumbnail:'./app/js/image/s26.jpg'},
    {lat:'35.81624', lng:'139.98489', img:'s27.jpg', caption:'27_力石', url:'https:\/\/kankou.kashiwa-cci.or.jp\/folk-tale\/story-27', thumbnail:'./app/js/image/s27.jpg'},
    {lat:'35.82605', lng:'139.99597', img:'s28.jpg', caption:'28_とったり庄兵衛', url:'https:\/\/kankou.kashiwa-cci.or.jp\/folk-tale\/story-28', thumbnail:'./app/js/image/s28.jpg'},
    {lat:'35.82601', lng:'139.98697', img:'s29.jpg', caption:'29_狐いっぴょ', url:'https:\/\/kankou.kashiwa-cci.or.jp\/folk-tale\/story-29', thumbnail:'./app/js/image/s29.jpg'},
    {lat:'35.82533', lng:'139.99517', img:'s30.jpg', caption:'30_丑の刻まいり', url:'https:\/\/kankou.kashiwa-cci.or.jp\/folk-tale\/story-30', thumbnail:'./app/js/image/s30.jpg'},
    {lat:'35.81646', lng:'139.99357', img:'s31.jpg', caption:'31_塩どっけ', url:'https:\/\/kankou.kashiwa-cci.or.jp\/folk-tale\/story-31', thumbnail:'./app/js/image/s31.jpg'},
    {lat:'35.81647', lng:'139.99349', img:'s32.jpg', caption:'32_念仏塚', url:'https:\/\/kankou.kashiwa-cci.or.jp\/folk-tale\/story-32', thumbnail:'./app/js/image/s32.jpg'},
    {lat:'35.83439', lng:'139.94913', img:'s33.jpg', caption:'33_北の森の光りもの', url:'https:\/\/kankou.kashiwa-cci.or.jp\/folk-tale\/story-33', thumbnail:'./app/js/image/s33.jpg'},
    {lat:'35.84944', lng:'140.03982', img:'s34.jpg', caption:'34_弁栄上人の大蛇退治', url:'https:\/\/kankou.kashiwa-cci.or.jp\/folk-tale\/story-34', thumbnail:'./app/js/image/s34.jpg'}
];

const map = L.map('map', {
    zoomControl: false,
    zoomSnap: 0.5,
    minZoom: 12,
    maxZoom: 18,
    condensedAttributionControl: false
}).setView([35.8700,139.9700],12.5);

L.control.condensedAttribution({
    emblem: '&copy;',
    prefix: '<a href="https://kankou.kashiwa-cci.or.jp/folk-tale/" target="_blank">柏のむかしばなし(柏市観光協会)</a> | <a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>'
  }).addTo(map);

const bounds = [[35.9850, 139.8000], [35.7000, 140.1500]];
map.setMaxBounds(bounds);

const basemap_osm = L.tileLayer('https://{s}.tile.openstreetmap.jp/{z}/{x}/{y}.png', {attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',maxZoom: 28});
const basemap_gsi = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg', {attribution: '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">地理院タイル</a>',maxZoom: 18});

const folklore_layer = L.photo.cluster({
    spiderfyDistanceMultiplier: 5.0,
    maxClusterRadius: 100,
    disableClusteringAtZoom: 18,
    spiderfyOnMaxZoom: true,
    zoomToBoundsOnClick: true,
    //showCoverageOnHover: false,
    icon:{iconSize:[70, 50]}
}).on('click', function (evt) {
    evt.layer.bindPopup(L.Util.template('<img src="./app/js/image/{img}"><hr class="style01"><a href="{url}" target="_blank"><p class="remark">{caption}</p></a>', evt.layer.photo), {className: 'leaflet-popup-photo', minWidth:280, maxWidth:500}).openPopup();
});

const folklore_cluster = folklore_layer.add(folklore_list)

const boundary_style = {"fillColor":"transparent", "color":"#ff7800", "weight":5, "opacity": 0.5};
const boundary_layer = new L.geoJson(json_boundary, {style:boundary_style});

basemap_osm.addTo(map);
folklore_cluster.addTo(map);
boundary_layer.addTo(map);

map.panBy([1,1], 12.5);

const info = L.control({position:'bottomleft'});
info.onAdd = function(map){
    this._div = L.DomUtil.create('div', 'info');
    this._div.innerHTML = '<p>柏のむかしばなしマップ</p>'
    return this._div;
}
info.addTo(map);

const overlayMaps = {
    'ー<i class="fa fa-caret-right fa-fw" style="color:#555"></i>柏市域界': boundary_layer
};

const baseMaps = {  
    '<i class="fas fa-map-marked-alt" style="color:#555"></i><i class="fa fa-caret-right fa-fw" style="color:#555"></i>マップ': basemap_osm,
    '<i class="far fa-image" style="color:#555"></i><i class="fa fa-caret-right fa-fw" style="color:#555"></i>衛星画像': basemap_gsi
};

const slidemenutitle = '<h3 align="center">このマップについて</h3>';
let contents = '<p align="left"><ul><li>この説明画面を閉じるには、ここの右斜め上にある <i class="fa fa-backward" style="color:grey"></i> ボタンを押してください。</li>'
contents += '<li>このマップは、<span class="style01">柏市観光協会が提供している「柏のむかしばなし」</span>（<a href="https://kankou.kashiwa-cci.or.jp/folk-tale/" target="_blank">リンクはこちら</a>）の情報を転載および二次利用して、当サイト管理者が独自に加工・作成したものです。</li>'
contents += '<li>スマートフォンなどお使いの機器の位置情報取得を許可し、<i class="fas fa-crosshairs" style="color:black"></i>　ボタンを押すことで、<span class="style01">現在位置を表示</span>することができます。市内を散策しながら昔話の舞台をお楽しみください。</li>'
contents += '<li>このマップを通して多くの方に「柏のむかしばなし」に興味を持っていただき、その舞台を巡っていただくことを希望しますが、<span class="style01">現地は駐車場やトイレなど完備していないところが多いため、周遊・探索の際はくれぐれも近隣住民のご迷惑にならないようご配慮ください。</span></li>'
contents += '<li>なお、本ウェブサイトがご利用者様の位置情報等を含め<span class="style01">個人情報を記録することは一切ございません</span>のでご安心ください。</li></ul></p>'
contents += '<h3 align="center">お問い合わせ先</h3>'
contents += '<p align="left"><ul><li>「柏のむかしばなし」に関するお問い合わせは、下記の　<span class="style01">柏市観光協会</span>　までご連絡ください。<br><i class="fas fa-envelope fa-fw" style="color:grey"></i>: kankou"at"kashiwa-cci.or.jp<br><a href="https://kankou.kashiwa-cci.or.jp/" target="_blank">柏市観光協会のウェブサイトはこちら</a></p></li><hr class="style01">';
contents += '<p align="left"><li>本ウェブサイトに関するお問い合わせは、下記のSNSにて<span class="style01">本ウェブサイト管理者</span> までご連絡ください。<br><a href="https://twitter.com/smille_feuille" target="_blank"><i class="fab fa-twitter-square" style="color:lightblue"></i> twitter@Smille_feuille</a></li></ul></p>';

L.control.layers(baseMaps, overlayMaps,{collapsed:false}).addTo(map);
/*
if (L.Browser.mobile) {
    L.control.layers(baseMaps, overlayMaps,{collapsed:true}).addTo(map);
}
else{
    L.control.layers(baseMaps, overlayMaps,{collapsed:false}).addTo(map);
}
*/

L.control.slideMenu(slidemenutitle + contents, {width:'320px', icon:'fas fa-info', changeperc: '5', delay: '20', hidden: false}).addTo(map);
L.control.locate({position:'topleft', icon:'fas fa-crosshairs'}).addTo(map);
L.control.scale({maxWidth:150, metric:true, imperial:false, position: 'topleft'}).addTo(map);
//L.control.polylineMeasure({position:'topleft', imperial:false, showClearControl:true, measureControlLabel:'m'}).addTo(map);
