L.Map.include({
  _initControlPos: function () {
    var corners = this._controlCorners = {}, l = 'leaflet-',container = this._controlContainer =L.DomUtil.create('div', l + 'control-container', this._container);

    function createCorner(vSide, hSide) {
      var className = l + vSide + ' ' + l + hSide;
      corners[vSide + hSide] = L.DomUtil.create('div', className, container);
    }

    createCorner('top', 'left');
    createCorner('top', 'right');
    createCorner('bottom', 'left');
    createCorner('bottom', 'right');
    createCorner('top', 'center');
    createCorner('middle', 'center');
    createCorner('middle', 'left');
    createCorner('middle', 'right');
    createCorner('bottom', 'center');
  }
});


document.addEventListener('touchmove',function (){document.body.scrollTop = 0;});
var legenda = L.control({position: 'bottomright'});

var colores = 
{
	dffs: new Array("<strong>Denuncias forestales y de fauna silvestre</strong>",
		"<input type='radio' id='1' name='1' value='1' onclick='activar_reporte(this);'><label for='Reporte 1'>Número de denuncias registradas</label>",
		"<input type='radio' id='2' name='1' value='2' onclick='activar_reporte(this);'><label for='Reporte 2'>Número de casos Priorizados para el SNCVFFS</label>",
		"<input type='radio' id='3' name='1' value='3' onclick='activar_reporte(this);'><label for='Reporte 3'>Número de Casos para la MRCVFFS</label>"), 	
	anp: new Array("<strong>Área Natural Protegida</strong>",
		"<i style='background:#63b086'></i> Parques Nacionales",
		"<i style='background:#ffa77f'></i> Santuarios Nacionales",
		"<i style='background:#752400'></i> Santuarios históricos",
		"<i style='background:#e174ff'></i> Refugio de Vida Silvestre",
		"<i style='background:#0086a8'></i> Reservas Paisajísticas",
		"<i style='background:#ffff74'></i> Reservas Nacionales",
		"<i style='background:#ffd37f'></i> Reservas Comunales",
		"<i style='background:#e69a00'></i> Cotos de Caza",
		"<i style='background:#a3ff74'></i> Bosque de Protección"
		),
	zr : new Array("<strong>Zonas Reservadas</strong>",
		"<i style='background:#fc717b'></i> ZR",), 
	acr : new Array("<strong>Área Conservación Regional</strong>", "<i style='background:#a2b331'></i> ACR"),
	za : new Array("<strong>Zonas de amortiguamiento en ANP</strong>", "<i style='background:#cccccc'></i> ZA"),
	cf : new Array("<strong>Concesiones Forestales</strong>",
		"<i style='background:#a97520'></i> Conservación",
		"<i style='background:#e89e2e'></i> Ecoturismo",
		"<i style='background:#6f7b1e'></i> Fines maderables",
		"<i style='background:#ab3fb9'></i> Forestación y/o Reforestación",
		"<i style='background:#ad3211'></i> Plantaciones forestales",
		"<i style='background:#c43f9f'></i> Productos forestales diferentes a la madera"),
	p : new Array("<strong>Permisos</strong>",
		"<i style='background:#d0ffc5'></i> Bosque seco",
		"<i style='background:#b9f5e9'></i> Maderable",
		"<i style='background:#cffdd5'></i> No maderable",
		"<i style='background:#b8e3f4'></i> Servicio de Ecosistemas forestales"),
	rirt : new Array("<strong>Interculturalidad - Reservas PIACI</strong>",
		"<i style='background:#00b186'></i> Reserva Indígena",
		"<i style='background:#ed7c3a'></i> Reserva territorial ",
		"<i style='background:#ff9ba0'></i> Reserva en solicitud de creación"),
};
var latitud = -9.163819879371493, longitud = -74.37548838473978, datos_reporte, datos;

var mb_atributo = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
		'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
		'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
mb_url = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

var escala_grises   = L.tileLayer(mb_url, {id: 'mapbox/light-v9', tileSize: 512, zoomOffset: -1, attribution: mb_atributo});		
var satelite_arcgis = L.esri.basemapLayer('ImageryClarity');
var noche_arcgis = L.esri.basemapLayer('DarkGray');
var legenda_reporte, sliderControl, slider, temporalLegend,cities;

var mapa = L.map('map', {
	center: [latitud, longitud],
	zoom:  (screen.width < 1280 ? 5 : 6),
	minZoom: 5,
	layers: [noche_arcgis],
	zoomControl: false
});

$.getJSON("city-data.json")  	
.done(function(data) {
	datos_reporte = procesar_datos_reporte(data);
	datos = data;
}).fail(function() { alert("No se puede cargar la información.")});

var anp = L.tileLayer.wms('http://geoservicios.sernanp.gob.pe/arcgis/services/representatividad/peru_sernanp_010201/MapServer/WMSServer?', {layers: '0',
	format: 'image/png',
    transparent: true,
    version: '1.3.0',
    dpi: 96,
    map_resolution:96,
    format_options:'dpi:96',
    attribution: "&copy; <a href='https://www.sernanp.gob.pe/'>SERNANP</a>"
    }).addTo(mapa);

var zr = L.tileLayer.wms('http://geoservicios.sernanp.gob.pe/arcgis/services/representatividad/peru_sernanp_010202/MapServer/WMSServer?', {layers: '0',
	format: 'image/png',
    transparent: true,
    version: '1.3.0',
    attribution: "&copy; <a href='https://www.sernanp.gob.pe/'>SERNANP</a>",
    tiled: false,
	unloadInvisibleTiles: false,
	FIRSTTITLE: true,
	visible : false }).addTo(mapa);

var acr = L.tileLayer.wms('http://geoservicios.sernanp.gob.pe/arcgis/services/representatividad/peru_sernanp_010203/MapServer/WMSServer?', {layers: '1',
	format: 'image/png',
    transparent: true,
    version: '1.3.0',
    attribution: "&copy; <a href='https://www.sernanp.gob.pe/'>SERNANP</a>",
    tiled: false,
	unloadInvisibleTiles: false,
	FIRSTTITLE: true,
	visible : false }).addTo(mapa);

var za = L.tileLayer.wms('http://geoservicios.sernanp.gob.pe/arcgis/services/gestion_de_anp/peru_sernanp_021401/MapServer/WMSServer?', {layers: '1',
	format: 'image/png',
    transparent: true,
    version: '1.3.0',
    attribution: "&copy; <a href='https://www.sernanp.gob.pe/'>SERNANP</a>",
    tiled: false,
	unloadInvisibleTiles: false,
	FIRSTTITLE: true,
	visible : false }).addTo(mapa);

var cf =L.esri.dynamicMapLayer({
    url: 'https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Modalidad_Acceso/MapServer',
    opacity: 0.7,
    layers:[0],
    attribution: "&copy; <a href='https://www.serfor.gob.pe/'>SERFOR</a>",
	}).addTo(mapa);

	var p =L.esri.dynamicMapLayer({
    url: 'https://geo.serfor.gob.pe/geoservicios/rest/services/Visor/Modalidad_Acceso/MapServer',
    opacity: 0.7,
    layers:[5],
    attribution: "&copy; <a href='https://www.serfor.gob.pe/'>SERFOR</a>",
	}).addTo(mapa);

var rirt =L.tileLayer.wms('https://geoservicios.cultura.gob.pe/geoserver/interoperabilidad/wms?', {layers: 'interoperabilidad:cultura_reserva_indigena',
	format: 'image/png',
    transparent: true,
    version: '1.3.0',
    attribution: "&copy; <a href='https://www.cultura.gob.pe/'>CULTURA</a>",
    tiled: true}).addTo(mapa);

var dpto = L.esri.featureLayer({
  	url:'http://geoservicios.sernanp.gob.pe/arcgis/rest/services/sernanp_peru/peru_inei_000501/MapServer/0',style: function (feature) {
		   	return { color: '#d4dbd5', weight: 1.5, opacity: 1, fillOpacity: 0};	        
    },
	attribution: "&copy; Limites Referenciales | <a href='https://www.igp.gob.pe/'>IGP</a>"
}).addTo(mapa);	

	L.Control.Watermark = L.Control.extend({
	onAdd: function(map) {
    var img = L.DomUtil.create('img');
    img.src = 'img/serfor.png';
    img.style.width = '255px';
    img.style.height= '48px'
    return img;
	},
	onRemove: function(map) {}
});

L.control.watermark = function(opts) {return new L.Control.Watermark(opts);};
L.control.watermark({ position: 'topright' }).addTo(mapa); //topleft, topright, bottomleft, bottomright
L.control.navbar({position:'topleft'}).addTo(mapa);
L.control.zoom({position:'topleft'}).addTo(mapa);
//mapa.zoomControl.setPosition('topright');	

var toggle = L.easyButton({
  states: [{
    stateName: 'add-markers',
    icon: 'fa fa-arrow-down',
    title: 'Ocultar leyenda',
    onClick: function(control) {
      $('.legend').hide();
      control.state('remove-markers');
    }
  }, {
    icon: 'fa fa-arrow-up',
    stateName: 'remove-markers',
    onClick: function(control) {
      $('.legend').show();
      control.state('add-markers');
    },
    title: 'Mostrar leyenda',	    
  }]
, position: 'bottomright'});
toggle.addTo(mapa);

var capas_base = {
	"Escala de grises": escala_grises,
	"Noche": noche_arcgis,
	"Satelite": satelite_arcgis
};

var capas_tematicas = {
	"SERNANP":{
		"Áreas Naturales Protegidas" : anp,
		"Zonas Reservadas" : zr,
		"Áreas de Conservación Regional" : acr,
		"Zonas de amortiguamiento en ANP" : za,
	},
	"SERFOR":{
		"Concesiones forestales": cf,
		"Permisos": p,
	},
	"CULTURA":{
		"Reservas Territoriales e Indígenas": rirt,	
	},
};

L.control.groupedLayers(capas_base, capas_tematicas, {position: 'topright'}).addTo(mapa);

/*var sernanp = L.layerGroup([anp]);
var serfor = L.layerGroup([cf]);

var Universities = new L.control.layers({
    'Cessions and Universities': sernanp,
    'State Raised Endowements and Universities': serfor
}, null, { collapsed: true }).addTo(mapa);*/

var esri_worldTopoMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {attribution: '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'});

var miniMap = new L.Control.MiniMap(esri_worldTopoMap, {toggleDisplay: true,minimized: true, position: 'bottomleft'}).addTo(mapa);

L.control.scale({position: 'bottomleft'}).addTo(mapa);

L.control.mousePosition({position:'bottomleft', emptystring: ' ', numDigits: '2'}).addTo(mapa);

var control = document.getElementsByClassName('leaflet-control-layers')[0];
control.getElementsByTagName('input')[3].click();
control.getElementsByTagName('input')[4].click();
control.getElementsByTagName('input')[5].click();
control.getElementsByTagName('input')[6].click();
//control.getElementsByTagName('input')[7].click();
control.getElementsByTagName('input')[8].click();
control.getElementsByTagName('input')[9].click();
//$('.leaflet-control-layers-selector')[0].click();	*/

legenda.onAdd = function (map) {
	var div = L.DomUtil.create('div', 'info legend'),labels = [];

	//var elem = L.DomUtil.get('yourelementid');
	L.DomEvent.on(div, 'mousewheel', L.DomEvent.stopPropagation);

	labels.push(colores.dffs.join('<br>'));
	labels.push(colores.cf.join('<br>'));		
	div.innerHTML = labels.join('<br>');
	return div;
};
legenda.addTo(mapa);

function createPropSymbols(timestamps, data){

			cities = L.geoJson(data, {		

				pointToLayer: function(feature, latlng) {	

					return L.circleMarker(latlng, {		
					
					    fillColor: "#708598",	
					    color: '#537898',	
					    weight: 1,	
					    fillOpacity: 0.6  

					});
				}
			}).addTo(mapa);  

			updatePropSymbols(timestamps[0]);
}
function updatePropSymbols(timestamp){

	cities.eachLayer(function(layer) {  
		
		var props = layer.feature.properties,
			radius = calcPropRadius(props[timestamp]),
			popupContent = "<b>" + String(props[timestamp]) + " casos</b><br>" +
						   "<i>" + props.name +
						   "</i> en el </i>" + timestamp + "</i>";

		layer.setRadius(radius);
		layer.bindPopup(popupContent, { offset: new L.Point(0,-radius) }); 
		layer.on({

			mouseover: function(e) {
				this.openPopup();
				this.setStyle({color: 'red'});
			},
			mouseout: function(e) {
				this.closePopup();
				this.setStyle({color: '#537898'});
					
			}
		});  

	});
}
function procesar_datos_reporte(data){

	var timestamps = [],	
		min = Infinity,	
		max = -Infinity;

	for (var feature in data.features) {	

		var properties = data.features[feature].properties;	

		for (var attribute in properties) {	
			//console.log(attribute);

			if ( attribute != 'id' &&
				 attribute != 'iddpto' &&
				 attribute != 'name' &&
				 attribute != 'lat' &&
				 attribute != 'lon' ) 
			{
				if ( $.inArray(attribute,timestamps) ===  -1) {	
					timestamps.push(attribute);	
				}
				if (properties[attribute] < min) {	
					min = properties[attribute];	
				}
				if (properties[attribute] > max) { 
					max = properties[attribute];
				}
			}
		}
	}

	console.log(timestamps);

	return {	
		timestamps : timestamps,
		min : min,
		max : max
	}
}
function calcPropRadius(attributeValue){
	var scaleFactor = 20,  area = attributeValue * scaleFactor; 
		return Math.sqrt(area/Math.PI)*2;				
}
function crear_reporte_leyenda(min, max){
	if (min < 10) {	
		min = 10; 
	}
	function roundNumber(inNumber) {

   		return (Math.round(inNumber/10) * 10);  
	}

	legenda_reporte = L.control( { position: 'bottomright' } );

	legenda_reporte.onAdd = function(map) {

		var legendaContainer = L.DomUtil.create("div", "legenda"),  
			symbolsContainer = L.DomUtil.create("div", "symbolsContainer"),
			classes = [roundNumber(min), roundNumber((max-min)/2), roundNumber(max)], 
			legendaCircle,  
			diameter,
			diameters = [];  

		L.DomEvent.addListener(legendaContainer, 'mousedown', function(e) { L.DomEvent.stopPropagation(e); });  

		$(legendaContainer).append("<h2 id='legendaTitle'>Número de denuncias <br/>registradas</h2>");
		console.log(classes);
		
		for (var i = 0; i < classes.length; i++) {  

			legendaCircle = L.DomUtil.create("div", "legendaCircle");  
			diameter = calcPropRadius(classes[i])*2; 
			diameters.push(diameter);
			
			var lastdiameter;
			
			if (diameters[i-1]){
				lastdiameter = diameters[i-1];
			} else {
				lastdiameter = 0;
			};
			
			$(legendaCircle).attr("style", "width: "+diameter+"px; height: "+diameter+"px; margin-left: -"+((diameter+lastdiameter+2)/2)+"px;" );

			
			$(legendaCircle).append("<span class='legendaValue'>"+classes[i]+"<span>");

		
			$(symbolsContainer).append(legendaCircle);	

		};

		$(legendaContainer).append(symbolsContainer); 

		return legendaContainer; 

	};

	legenda_reporte.addTo(mapa);  
}
function createSliderUI(timestamps){

	sliderControl = L.control({position:'bottomcenter'});
	sliderControl.onAdd = function(map) {
		slider = L.DomUtil.create("input", "range-slider");

		L.DomEvent.addListener(slider, 'mousedown', function(e) {L.DomEvent.stopPropagation(e);});
		$(slider)
			.attr({'type':'range', 'max': timestamps[timestamps.length-1], 'min':timestamps[0], 'step': 1,'value': String(timestamps[0])})
	        .on('input change', function() {
	        	updatePropSymbols($(this).val().toString());
	            $(".temporal-legenda").text(this.value);
	        });
		return slider;
	}

	sliderControl.addTo(mapa);
	createTemporalLegend(timestamps[0]);
	$(slider).draggable();
}
function createTemporalLegend(startTimestamp){
	temporalLegend = L.control({ position: 'bottomcenter' });
	temporalLegend.onAdd = function(map) {
		var output = L.DomUtil.create("output", "temporal-legenda");
		return output;  
	}
	temporalLegend.addTo(mapa);  
	$(".temporal-legenda").text(startTimestamp); 
}
function actualizar_leyenda(){
	var labels = [];
	labels.push(colores.dffs.join('<br>'));
	var div_info_legend = document.getElementsByClassName('info legend')[0];

	if(control.getElementsByTagName('input')[3].checked)
	{
		labels.push(colores.anp.join('<br>'));
	}		
	if(control.getElementsByTagName('input')[4].checked)
	{
		labels.push(colores.zr.join('<br>'));
	}
	if(control.getElementsByTagName('input')[5].checked)
	{		
		labels.push(colores.acr.join('<br>'));
	}
	if(control.getElementsByTagName('input')[6].checked)
	{		
		labels.push(colores.za.join('<br>'));
	}
	if(control.getElementsByTagName('input')[7].checked)
	{		
		labels.push(colores.cf.join('<br>'));
	}
	if(control.getElementsByTagName('input')[8].checked)
	{		
		labels.push(colores.p.join('<br>'));
	}
	if(control.getElementsByTagName('input')[9].checked)
	{		
		labels.push(colores.rirt.join('<br>'));
	}
	div_info_legend.innerHTML = labels.join('<br>');
}

mapa.on('overlayadd', function(e){
	actualizar_leyenda();
});
mapa.on('overlayremove', function(e){
	actualizar_leyenda();
});

function activar_reporte(radio)
{
	if (radio.value == '1')
	{
		createPropSymbols(datos_reporte.timestamps, datos);  
		crear_reporte_leyenda(datos_reporte.min,datos_reporte.max);	
		createSliderUI(datos_reporte.timestamps);		
	}
	else
	{
		mapa.removeControl(legenda_reporte);
		//mapa.removeControl(sliderControl);
		mapa.removeControl(slider);
		mapa.removeControl(temporalLegend);
		mapa.removeLayer(cities);
		
	}     
}