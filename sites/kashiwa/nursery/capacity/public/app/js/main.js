const map = L.map('map', {
    zoomControl: false,
    zoomSnap: 0.5,
    minZoom: 12,
    maxZoom: 18,
    condensedAttributionControl: false
}).setView([35.8622,139.9709],13);

L.control.condensedAttribution({
    emblem: '&copy;',
    prefix: '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet-Слава Україні!</a> | <a href="https://www.city.kashiwa.lg.jp/haguhagu/index.html">柏市子育て情報 はぐはぐ柏</a>'
  }).addTo(map);

const bounds = [[36.2000,139.8000], [35.5000,140.4000]];
map.setMaxBounds(bounds);

const basemap_osm = L.tileLayer('https://{s}.tile.openstreetmap.jp/{z}/{x}/{y}.png', {attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',maxZoom: 28});

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

function getColor_nursery(d){
    return d.replace(/[^0-9]/g, '').length == 0 ? 'black': //数字なしの場合は例外として黒色表示
    Number(d.replace(/[^0-9]/g, '')) > 14 ? 'blue':
    Number(d.replace(/[^0-9]/g, '')) > 9 ? 'green':
    Number(d.replace(/[^0-9]/g, '')) > 5 ? 'orange':
    Number(d.replace(/[^0-9]/g, '')) > 2 ? 'lightred':
    Number(d.replace(/[^0-9]/g, '')) >= 0 ? 'red':
    'black';
}

function getCapacity_nursery(d){
    return d == '-' ? '募集対象外':
    d == "×" ? '新規受入予定なし':
    d == "△" ? '要確認':
    /[0-9]+△/u.test(d) ? d.replace(/[^0-9]/g, '') + '人募集（定員超の受入可能性有）':
    /[0-9]+/u.test(d) ? d + '人募集':
    '確認中';
}

function onEachFeature_nursery_kl(feature, layer){
    let popupContent;
    popupContent =
        '<table class="tablestyle02">'+
        '<tr><td>名称</td><td>'+(feature.properties.name)+'</td></tr>'+
        //'<tr><td>リンク</td><td><p class="remarks"><a href="https://www.google.com/search?q=柏市+'+(feature.properties.name)+'" target="_blank">Googleで検索</a>'+(feature.properties.url_lookmee ? (feature.properties.url_lookmee == "-" ? "（ルクミー未確認）" : ' ／ <a href="'+(feature.properties.url_lookmee)+'" target="_blank">ルクミーで見る</a>') : "") + '</p></td></tr>'+
        '<tr><td>リンク</td><td><p class="remarks"><a href="https://www.google.com/search?q=柏市+'+(feature.properties.name)+'" target="_blank">Googleで検索</a></p></td></tr>'+
        '<tr><td>区分</td><td>'+(feature.properties.status_info != '-' ? feature.properties.type +', '+feature.properties.status_info : feature.properties.type)+'</td></tr>'+
        //'<tr><td>区分</td><td>'+(feature.properties.status_flag.startsWith('既設') ? feature.properties.type : feature.properties.type +', '+feature.properties.status_info)+'</td></tr>'+
        '<tr><td>定員</td><td>'+(feature.properties.capacity)+'</td></tr>'+
        '<tr><td>時間<p class="remarks">(要確認)</p></td><td>開園：'+(feature.properties.open_hour)+'<br>'+'保育標準：'+(feature.properties.std_time)+'<br>'+'保育短：'+(feature.properties.short_time)+'</td></tr>'+
        '<tr><td>駐車場</td><td>'+(feature.properties.parking == "-" ? "確認中" : feature.properties.parking+'台')+'</td></tr>'+
        '<tr><td>受入年齢</td><td>'+(feature.properties.age_info)+'</td></tr>'+
        '<tr><td>0歳</td><td>' + (getCapacity_nursery(feature.properties.age0)) + '</td></tr>'+
        '<tr><td>1歳</td><td>' + (getCapacity_nursery(feature.properties.age1)) + '</td></tr>'+
        '<tr><td>2歳</td><td>' + (getCapacity_nursery(feature.properties.age2)) + '</td></tr>'+
        '<tr><td>3歳</td><td>' + (getCapacity_nursery(feature.properties.age3)) + '</td></tr>'+
        '<tr><td>4歳</td><td>' + (getCapacity_nursery(feature.properties.age4)) + '</td></tr>'+
        '<tr><td>5歳</td><td>' + (getCapacity_nursery(feature.properties.age5)) + '</td></tr>'+
        '</table>';
    const popupStyle = L.popup({autoPan:true}).setContent(popupContent);
    layer.bindPopup(popupStyle);
}

function onEachFeature_nursery_m(feature, layer){
    if (feature.properties && feature.properties.name){
        const popupContent =
        '<table class="tablestyle02">'+
        '<tr><td>名称</td><td>'+(feature.properties.name)+'</td></tr>'+
        //'<tr><td>リンク</td><td><p class="remarks"><a href="https://www.google.com/search?q=柏市+'+(feature.properties.name)+'" target="_blank">Googleで検索</a>'+(feature.properties.url_lookmee ? (feature.properties.url_lookmee == "-" ? "（ルクミー未確認）" : ' ／ <a href="'+(feature.properties.url_lookmee)+'" target="_blank">ルクミーで見る</a>') : "") + '</p></td></tr>'+
        '<tr><td>リンク</td><td><p class="remarks"><a href="https://www.google.com/search?q=柏市+'+(feature.properties.name)+'" target="_blank">Googleで検索</a></p></td></tr>'+
        '<tr><td>区分</td><td>'+(feature.properties.status_info != '-' ? feature.properties.type +', '+feature.properties.status_info : feature.properties.type)+'</td></tr>'+
        '<tr><td>定員</td><td>'+(feature.properties.capacity)+'</td></tr>'+
        '<tr><td>時間<p class="remarks">(要確認)</p></td><td>'+(feature.properties.open_hour)+'</td></tr>'+
        '<tr><td>対象年齢</td><td>'+(feature.properties.age_info)+'</td></tr>'+
        '</table>';
        const popupStyle = L.popup({autoPan:true}).setContent(popupContent);
        layer.bindPopup(popupStyle);
    }
}

function onEachFeature_nursery_n(feature, layer){
    if (feature.properties && feature.properties.name){
        const popupContent =
        '<table class="tablestyle02">'+
        '<tr><td>名称</td><td>'+(feature.properties.name)+'</td></tr>'+
        //'<tr><td>リンク</td><td><p class="remarks"><a href="https://www.google.com/search?q=柏市+'+(feature.properties.name)+'" target="_blank">Googleで検索</a>'+(feature.properties.url_lookmee ? (feature.properties.url_lookmee == "-" ? "（ルクミー未確認）" : ' ／ <a href="'+(feature.properties.url_lookmee)+'" target="_blank">ルクミーで見る</a>') : "") + '</p></td></tr>'+
        '<tr><td>リンク</td><td><p class="remarks"><a href="https://www.google.com/search?q=柏市+'+(feature.properties.name)+'" target="_blank">Googleで検索</a></p></td></tr>'+
        '<tr><td>区分</td><td>'+(feature.properties.status_info != '-' ? feature.properties.type +', '+feature.properties.status_info : feature.properties.type)+'</td></tr>'+
        '</table>';
        const popupStyle = L.popup({autoPan:true}).setContent(popupContent);
        layer.bindPopup(popupStyle);
    }
}

function onEachFeature_childcare(feature, layer){
    if (feature.properties && feature.properties.name){
        const popupContent =
        '<table class="tablestyle02">'+
        '<tr><td>名称</td><td>'+(feature.properties.name)+'</td></tr>'+
        '<tr><td>リンク</td><td><p class="remarks"><a href="https://www.google.com/search?q=柏市+'+(feature.properties.name)+'" target="_blank">Googleで検索</a>'+(feature.properties.url ? (feature.properties.url == "-" ? "" : ' ／ <a href="'+(feature.properties.url)+'" target="_blank">施設情報サイト</a>') : "") + '</p></td></tr>'+
        '<tr><td>区分</td><td>'+(feature.properties.type)+'</td></tr>'+
        '<tr><td>備考</td><td>'+(feature.properties.status_info ? feature.properties.status_info : "-")+'</td></tr>'+
        '</table>';
        const popupStyle = L.popup({autoPan:true}).setContent(popupContent);
        layer.bindPopup(popupStyle);
    }
}

const nursery_age3_layer = new L.geoJson(json_nursery, {
    filter: function(feature, layer) {
        return feature.properties.uid.startsWith('K') || feature.properties.uid.startsWith('L');
    },
    onEachFeature: onEachFeature_nursery_kl,
    pointToLayer: function(feature, latlng){
        if (feature.properties.age3 == '-' || feature.properties.age3 == '×'){
            return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:'lightgray', prefix:'fa', html:'x'})});
        }
        else if (feature.properties.age3 == '△'){
            return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:'purple', prefix:'fa', html:'△'})});
        }
        else if (feature.properties.age3.replace(/[^0-9]/g, '').length > 0) {
            return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:getColor_nursery(feature.properties.age3), prefix:'fa', html:(feature.properties.age3.replace(/[^0-9]/g, ''))})});
        }
        else {
            return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:'gray', prefix:'fa', html:'?'})});
        }
    }
});

const nursery_age2_layer = new L.geoJson(json_nursery, {
    filter: function(feature, layer) {
        return feature.properties.uid.startsWith('K') || feature.properties.uid.startsWith('L');
    },
    onEachFeature: onEachFeature_nursery_kl,
    pointToLayer: function(feature, latlng){
        if (feature.properties.age2 == '-' || feature.properties.age2 == '×'){
            return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:'lightgray', prefix:'fa', html:'x'})});
        }
        else if (feature.properties.age2 == '△'){
            return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:'purple', prefix:'fa', html:'△'})});
        }
        else if (feature.properties.age2.replace(/[^0-9]/g, '').length > 0) {
            return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:getColor_nursery(feature.properties.age2), prefix:'fa', html:(feature.properties.age2.replace(/[^0-9]/g, ''))})});
        }
        else {
            return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:'gray', prefix:'fa', html:'?'})});
        }
    }
});           

const nursery_age1_layer = new L.geoJson(json_nursery, {
    filter: function(feature, layer) {
        return feature.properties.uid.startsWith('K') || feature.properties.uid.startsWith('L');
    },
    onEachFeature: onEachFeature_nursery_kl,
    pointToLayer: function(feature, latlng){
        if (feature.properties.age1 == '-' || feature.properties.age1 == '×'){
            return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:'lightgray', prefix:'fa', html:'x'})});
        }
        else if (feature.properties.age1 == '△'){
            return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:'purple', prefix:'fa', html:'△'})});
        }
        else if (feature.properties.age1.replace(/[^0-9]/g, '').length > 0) {
            return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:getColor_nursery(feature.properties.age1), prefix:'fa', html:(feature.properties.age1.replace(/[^0-9]/g, ''))})});
        }
        else {
            return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:'gray', prefix:'fa', html:'?'})});
        }
    }
});

const nursery_age0_layer = new L.geoJson(json_nursery, {
    filter: function(feature, layer) {
        return feature.properties.uid.startsWith('K') || feature.properties.uid.startsWith('L');
    },
    onEachFeature: onEachFeature_nursery_kl,
    pointToLayer: function(feature, latlng){
        if (feature.properties.age0 == '-' || feature.properties.age0 == '×'){
            return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:'lightgray', prefix:'fa', html:'x'})});
        }
        else if (feature.properties.age0 == '△'){
            return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:'purple', prefix:'fa', html:'△'})});
        }
        else if (feature.properties.age0.replace(/[^0-9]/g, '').length > 0) {
            return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:getColor_nursery(feature.properties.age0), prefix:'fa', html:(feature.properties.age0.replace(/[^0-9]/g, ''))})});
        }
        else {
            return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:'gray', prefix:'fa', html:'?'})});
        }
    }
});

const nursery_m_layer = new L.geoJson(json_nursery, {
    filter: function(feature, layer) {
        return feature.properties.uid.startsWith('M');
    },
    onEachFeature: onEachFeature_nursery_m,
    pointToLayer: function(feature, latlng){
        return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:'purple', prefix:'fa', html:("認外")})});
    }
});

const nursery_n_layer = new L.geoJson(json_nursery, {
    filter: function(feature, layer) {
        return feature.properties.uid.startsWith('N');
    },
    onEachFeature: onEachFeature_nursery_n,
    pointToLayer: function(feature, latlng){
        return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:'pink', prefix:'fa', html:("幼")})});
    }
});

const nursery_o_layer = new L.geoJson([], {});

// 検索用透明マーカー作成関数
const createInvisibleMarker = (feature, latlng) => {
    return L.marker(latlng, {
        opacity: 0,
        icon: L.divIcon({
            className: 'search-only-marker',
            iconSize: [0, 0],
            html: ''
        })
    });
};

// 検索用透明レイヤ
const nursery_search_layer = new L.geoJson(json_nursery, { pointToLayer: createInvisibleMarker });
const childcare_search_layer = new L.geoJson(childcare_data, { pointToLayer: createInvisibleMarker });

const iconColor_chilcare = 'white';
const markerColor_chilcare = 'cadetblue';

const childcare_p_layer = new L.geoJson(childcare_data, {
    filter: function(feature, layer) {
        return feature.properties.uid.startsWith('P');
    },
    onEachFeature: onEachFeature_childcare,
    pointToLayer: function(feature, latlng){
        return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', iconColor:iconColor_chilcare, markerColor:markerColor_chilcare, prefix:'fa', html:("ほっ")})});
    }
});

const childcare_q_layer = new L.geoJson(childcare_data, {
    filter: function(feature, layer) {
        return feature.properties.uid.startsWith('Q');
    },
    onEachFeature: onEachFeature_childcare,
    pointToLayer: function(feature, latlng){
        return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', iconColor:iconColor_chilcare, markerColor:markerColor_chilcare, prefix:'fa', html:("学童")})});
    }
});

const childcare_r_layer = new L.geoJson(childcare_data, {
    filter: function(feature, layer) {
        return feature.properties.uid.startsWith('R');
    },
    onEachFeature: onEachFeature_childcare,
    pointToLayer: function(feature, latlng){
        return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', iconColor:iconColor_chilcare, markerColor:markerColor_chilcare, prefix:'fa', html:("図書")})});
    }
});

const childcare_u_layer = new L.geoJson(childcare_data, {
    filter: function(feature, layer) {
        return feature.properties.uid.startsWith('U');
    },
    onEachFeature: onEachFeature_childcare,
    pointToLayer: function(feature, latlng){
        return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', iconColor:iconColor_chilcare, markerColor:markerColor_chilcare, prefix:'fa', html:("園庭")})});
    }
});

const childcare_w_layer = new L.geoJson(childcare_data, {
    filter: function(feature, layer) {
        return feature.properties.uid.startsWith('W');
    },
    onEachFeature: onEachFeature_childcare,
    pointToLayer: function(feature, latlng){
        return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', iconColor:iconColor_chilcare, markerColor:markerColor_chilcare, prefix:'fa', html:("はぐ")})});
    }
});

const childcare_y_layer = new L.geoJson(childcare_data, {
    filter: function(feature, layer) {
        return feature.properties.uid.startsWith('Y');
    },
    onEachFeature: onEachFeature_childcare,
    pointToLayer: function(feature, latlng){
        return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', iconColor:iconColor_chilcare, markerColor:markerColor_chilcare, prefix:'fa', html:("相談")})});
    }
});

const childcare_stvx_layer = new L.geoJson(childcare_data, {
    filter: function(feature, layer) {
        return feature.properties.uid.startsWith('S') || feature.properties.uid.startsWith('T') || feature.properties.uid.startsWith('V') || feature.properties.uid.startsWith('X');
    },
    onEachFeature: onEachFeature_childcare,
    pointToLayer: function(feature, latlng){
        return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', iconColor:iconColor_chilcare, markerColor:markerColor_chilcare, prefix:'fa', html:("他")})});
    }
});

const location_group = L.layerGroup([label_layer, boundary_layer])
const childcare_group = L.layerGroup([childcare_p_layer, childcare_q_layer, childcare_r_layer, childcare_u_layer, childcare_w_layer, childcare_y_layer, childcare_stvx_layer]);
const search_group = L.layerGroup([nursery_search_layer, childcare_search_layer]);

basemap_osm.addTo(map);
location_group.addTo(map);
search_group.addTo(map);
nursery_age0_layer.addTo(map);

const info = L.control({position:'bottomleft'});
info.onAdd = function(map){
    this._div = L.DomUtil.create('div', 'info');
    this._div.innerHTML = '<p class="info-title">柏市保育園の受入予定数マップ（2026年4月）</p><p class="comments"><a href="https://www.city.kashiwa.lg.jp/hoikuunei/haguhagu/hokatsu/joho/r84gatunyuuenn.html" target="_blank">令和8年度4月分保育園受入予定人数の主な情報元</a></p>'
    return this._div;
}
info.addTo(map);

const overlayMaps = {
    '<i class="fas fa-map-marker" style="color:#9932cc"></i><i class="fa fa-caret-right fa-fw" style="color:#555"></i>認可外保育所': nursery_m_layer,
    '<i class="fas fa-map-marker" style="color:#ffa07a"></i><i class="fa fa-caret-right fa-fw" style="color:#555"></i>幼稚園': nursery_n_layer,
    '<i class="fas fa-map-marker" style="color:#5f9ea0"></i><i class="fa fa-caret-right fa-fw" style="color:#555"></i>子育て支援施設': childcare_group,
    '<i class="fas fa-font" style="color:#555"></i><i class="fa fa-caret-right fa-fw" style="color:#555"></i>ラベル・市界': location_group
};

const baseMaps = {
    '<i class="fas fa-map-marker-alt" style="color:#555"></i><i class="fa fa-caret-right fa-fw" style="color:#555"></i>3歳 受入予定人数': nursery_age3_layer,
    '<i class="fas fa-map-marker-alt" style="color:#555"></i><i class="fa fa-caret-right fa-fw" style="color:#555"></i>2歳 受入予定人数': nursery_age2_layer,
    '<i class="fas fa-map-marker-alt" style="color:#555"></i><i class="fa fa-caret-right fa-fw" style="color:#555"></i>1歳 受入予定人数': nursery_age1_layer,
    '<i class="fas fa-map-marker-alt" style="color:#555"></i><i class="fa fa-caret-right fa-fw" style="color:#555"></i>0歳 受入予定人数': nursery_age0_layer,
    '<i class="fas fa-map-marker-alt" style="color:#999"></i><i class="fa fa-caret-right fa-fw" style="color:#555"></i>保育・こども園 非表示': nursery_o_layer
};

const slidemenutitle = '<h3 align="center">柏市保育園の受入予定人数マップ<br>（ 2026年4月版 ）</h3>';
let contents ='<p class="remark" align="center">この説明画面を閉じるには<br>ここの右斜め上にある <i class="fa fa-backward" style="color:grey"></i> ボタンを押してください。</p>';
contents += '<h2>凡例</h2>'
contents += '<p class="remark" align="center">受入人数は、2025年11月1日時点の<br>状況に基づいて推定されたものとなります。</p>';
contents += '<table border="0" bordercolor="#999" cellpadding="5" cellspacing="0"><tr><td align="right" width="120"><i class="fas fa-map-marker-alt" style="color:red"></i> :</td><td width="180">2人以下</td></tr><tr><td align="right" width="120"><i class="fas fa-map-marker-alt" style="color:orangered"></i> :</td><td width="180">3人〜5人</td></tr><tr><td align="right" width="120"><i class="fas fa-map-marker-alt" style="color:orange"></i> :</td><td width="180">6人〜9人</td></tr><tr><td align="right" width="120"><i class="fas fa-map-marker-alt" style="color:green"></i> :</td><td width="180">10人〜14人</td></tr><tr><td align="right" width="120"><i class="fas fa-map-marker-alt" style="color:#1E90FF"></i> :</td><td width="180">15人以上</td></tr></table>';
contents += '<h2>説明</h2><p align="left"><ul><li>このウェブページは「<a href="https://www.city.kashiwa.lg.jp/hoikuunei/haguhagu/hokatsu/joho/r8kakusyuyousiki.html" target="_blank">柏市　こどもをはぐくむ柏市子育てサイト はぐはぐ柏 令和8年度保育園等申込みのご案内</a>」の情報を参照して、<span class="style01">当サイト管理者が独自に加工・作成したもの</span>です。(2025年11月13日更新)</li>'
contents += '<li><span class="style01">2025年4月の各保育園の受入人数</span>などを反映させた施設情報をマップ上で確認できます。<span class="style01">2025年4月開園予定の保育園</span>の位置と受入予定数についても確認して掲載しています。</li>'
contents += '<li>各保育園の受入情報は<a href="https://www.city.kashiwa.lg.jp/hoikuunei/haguhagu/hokatsu/joho/r84gatunyuuenn.html" target="_blank">令和8年度4月分保育園等受入れ予定人数</a>及び各園のウェブサイトを適宜反映しています。詳細な情報は参照元のウェブサイトからご確認ください。</li>'
contents += '<li>各施設の場所の情報は<a href="https://www.city.kashiwa.lg.jp/hoikuunei/haguhagu/hokatsu/joho/r8kakusyuyousiki.html" target="_blank">令和8年度保育園等利用申込み案内</a>や「<a href="https://www.city.kashiwa.lg.jp/kodomoseisaku/haguhagu/kosodatemap/map.html" target="_blank">はぐはぐ柏　子育ててマップ」</a>や「<a href="https://www.city.kashiwa.lg.jp/databunseki/shiseijoho/jouhoukoukai/opendate/childsupport.html" target="_blank">柏市オープンデータ　子育て支援施設」</a>を参照しつつ、当サイト管理者の独自調査も含めて加工しています。</li>'
contents += '<li><span class="style01">柏市内に滞在中であれば</span>、スマートフォンなどお使いの機器の位置情報取得を許可し、<i class="fas fa-crosshairs" style="color:black"></i>　ボタンを押すことで、<span class="style01">現在位置を表示</span>することができます。</li>'
contents += '<li>なお、本ウェブサイトがご利用者様の位置情報等を含め<span class="style01">個人情報を記録することは一切ございません</span>のでご安心ください。</li>'
contents += '<li>ご意見等は<a href="https://form.run/@party--1681740493" target="_blank">問い合わせフォーム（外部サービス）</a>からお知らせください。</li></ul></p><hr class="style01">';

//L.control.layers(baseMaps, overlayMaps,{collapsed:false}).addTo(map);
if (L.Browser.mobile) {
    L.control.layers(baseMaps, overlayMaps, {collapsed:true}).addTo(map).expand();
}
else{
    L.control.layers(baseMaps, overlayMaps, {collapsed:false}).addTo(map);
}

const searchControl = new L.control.search({
    position: 'topright',
    layer: search_group,
    autoResize: false,
    textErr: '該当する保育園等が見つかりませんでした。',
    initial: false,
    propertyName: 'name',
    hideMarkerOnCollapse: false,
    zoom: 16,
    minLength: 1,
    collapsed: false,
    textPlaceholder: '保育園等を名前で検索　　　　　　　　　' 
});

map.addControl(searchControl);
L.control.slideMenu(slidemenutitle + contents, {width:'310px', icon:'fas fa-info'}).addTo(map);
L.control.polylineMeasure({position:'topleft', imperial:false, showClearControl:true, measureControlLabel:'m'}).addTo(map);
L.control.locate({position:'topleft', icon:'fas fa-crosshairs'}).addTo(map);
L.control.scale({maxWidth:120, metric:true, imperial:false, position: 'topleft'}).addTo(map);
