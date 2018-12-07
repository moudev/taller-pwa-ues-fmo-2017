'use strict';

$(document).ready(function(){

	const URL_API = `http://api.openweathermap.org/data/2.5/weather`;
	const KEY_API = `f6e407b829409d96e3580c2dc0678cec`;

	var app = {
	    isLoading: true,
	    visibleCards: {},
	    selectedCities: [],
	    spinner: $('.loader'),
	    cardTemplate: $('.cardTemplate'),
	    container: $('.main'),
	    addDialog: $('.dialog-container')
	  };

	$("#butRefresh").click(function(){
		updateCards();
	});

	$("#butAdd").click(function(){
		showModal(true);
	});

	$("#butAddCancel").click(function(){
		showModal(false);
	});

	$("#butAddCity").click(function(){
		console.log("Click Add City")
		let cityName = $("#selectCityToAdd").val();
		console.log(cityName);
    
	    if (!app.selectedCities) {
	      app.selectedCities = [];
	    }
	    let City = {
	    	"name":cityName
	    }
	    getDataCity(City,true);
	    app.selectedCities.push(City);
	    /*******************/
		//AGREGADO PASO 4
		/*******************/
        	saveCitysInLocalStorage();
        /*******************/
		//AGREGADO PASO 4
		/*******************/
	    showModal(false);
    
    
	});


	

/************************************************************
*	GET DATA CITY
*
*	if (jqXHR.status === 0) {
*                alert('Not connect.\n Verify Network.');
*            } else if (jqXHR.status == 404) {
+                alert('Requested page not found. [404]');
+            } else if (jqXHR.status == 500) {
+                alert('Internal Server Error [500].');
+            } else if (exception === 'parsererror') {
+               alert('Requested JSON parse failed.');
+            } else if (exception === 'timeout') {
+                alert('Time out error.');
+           } else if (exception === 'abort') {
+                alert('Ajax request aborted.');
+            } else {
+                alert('Uncaught Error.\n' + jqXHR.responseText);
+            }
*************************************************************/
	function getDataCity(city, addToDOM ){
	/*******************/
	//AGREGADO PASO 6
	/*******************/

		//Primero hay que comprobar si ya está agregado en cache
		//para mostrar datos rapidamente
		console.log("Get data city: "+city.name);
		let cityInCache = false;
		let returnCity = '';
		if ('caches' in window) {
	      let URL = URL_API+'?q='+city.name+'&APPID='+KEY_API+'&lang=es&units=metric';
	      let URL2 = URL.replace(' ','+');
	      console.log((URL2));
	      caches.match(URL2).then(function(response) {
	       	if (response) {
	       			response.json().then(function updateFromCache(json) {
	       			cityInCache = true;
	       			let results = json;//Resultado de Cache
	       			console.log("URL peticion: "+URL);
	       			console.log("Estaba en Cache: "+JSON.stringify(results))
	       			if(addToDOM){
	       				setCardCity(results);
	       			}else{
	       				console.log("Retornando: "+results)
	       				returnCity = results;
	       			}
	       		});
	       	}
	      });
	   	}//cache


	/*******************/
	//AGREGADO PASO 6
	/*******************/

	/*******************/
	//AGREGADO PASO 3
	/*******************/
		$.ajax({
			dataType: "JSON",
			url: URL_API,
			data: { q: city.name,"APPID": KEY_API ,"lang":'es',"units":'metric' },
			success: function (result) {
				console.log("Trayendo de la WEB: "+JSON.stringify(result));
				if(addToDOM){
       				setCardCity(result);
       			}else{
       				returnCity = result;
       			}
			},
			error: function(request, status, error)
			{
				//Si hay error que verifique si la ciudad
				//esta en cache, si no esta en cache
				//que muestre los datos iniciales de la app
				let state = request.status;//Error 404||0
				
				if(cityInCache == false){
					console.log("No esta en cache ni en WEB: "+JSON.stringify(initialData));
					if(addToDOM){
       				setCardCity(initialData[0]);
       			}else{
       				returnCity = initialData[0];
       			}
				}
				
			}
		});//ajax

	/*******************/
	//AGREGADO PASO 3
	/*******************/
		
	}

/************************************************************
*	UPDATE DATA CITY
*************************************************************/
	function setCardCity(city){
		console.log("setdata");
		console.log(city);
		let key_card = city.id;
		let card = app.visibleCards[key_card];
		
		//if no existe la card hay que crearla
		if(!card){
			card = $(".cardTemplate").clone();
			card.removeClass("cardTemplate");
			card.attr('id', key_card);
			card.removeAttr("hidden");
			app.container.append(card);
			app.visibleCards[key_card] = card;//Guardando todo el elemento DOM
			console.log("Cards:"+JSON.stringify(app.visibleCards))
		}

		//Dat City Variables
		let name 		= city.name,
			time 		= city.dt,
			humidity 	= city.main.humidity,
			temp 		= city.main.temp,
			tem_max 	= city.main.temp_max,
			tem_min 	= city.main.temp_min,
			sunrise 	= city.sys.sunrise,
			sunset 		= city.sys.sunset,
			icon		= city.weather[0].id;

			console.log(name);
			console.log(time);
			console.log(humidity);
			console.log(temp);
			console.log(tem_max);
			console.log(tem_min);
			console.log(sunrise);
			console.log(icon);


		//Set Text Content
		card.find('.icon').addClass(getIcon(icon));
		card.find('.location').text(name);
		card.find('.date').text((new Date(time*1000)).toUTCString());//Convert a Unix timestamp to time in JavaScript
		card.find('.description-date').text('Descripcion');
		card.find('.current .temperature .value').text(Math.ceil(temp));
		card.find('.current .humidity').text(humidity+'%');
		card.find('.current .temp-max .value').text(Math.ceil(tem_max));
		card.find('.current .temp-min .value').text(Math.ceil(tem_min));
		card.find('.current .sunrise').text((new Date(sunrise*1000)).toUTCString());
		card.find('.current .sunset').text((new Date(sunset*1000)).toUTCString());



		//final

		if (app.isLoading) {
	      app.spinner.attr('hidden', true);
	      app.container.removeAttr('hidden');
	      app.isLoading = false;
    	}
		//final
	}



/************************************************************
*	SHOW  MODAL ADD CITY
*************************************************************/
	function showModal(visible) {
    if (visible) {
      app.addDialog.addClass('dialog-container--visible');
    } else {
      app.addDialog.removeClass('dialog-container--visible');
    }
  }


/************************************************************
*	SHOW ICON IMAGE
*************************************************************/
	function getIcon(code) {
    let weatherCode = parseInt(code);
        switch (weatherCode) {
          case 0:
            return 'clear-day';
          case 501: // severe thunderstorms
          case 502: // thunderstorms
          case 503: // isolated thunderstorms
          case 504: // scattered thunderstorms
          case 511: // scattered thunderstorms (not a typo)
          case 520: // thundershowers
          case 521: // isolated thundershowers
          case 522: // isolated thundershowers
          case 531: // isolated thundershowers
            return 'rain';
          case 200: // severe thunderstorms
          case 201: // thunderstorms
          case 202: // isolated thunderstorms
          case 210: // scattered thunderstorms
          case 211: // scattered thunderstorms (not a typo)
          case 212: // thundershowers
          case 221: // isolated thundershowers
          case 230: // isolated thundershowers
          case 231: // isolated thundershowers
          case 232: // isolated thundershowers
            return 'thunderstorms';
          case 600: // severe thunderstorms
          case 601: // thunderstorms
          case 602: // isolated thunderstorms
          case 611: // scattered thunderstorms
          case 612: // scattered thunderstorms (not a typo)
          case 615: // thundershowers
          case 616: // isolated thundershowers
          case 620: // isolated thundershowers
          case 631: // isolated thundershowers
          case 632: // isolated thundershowers
            return 'snow';
          case 300: // severe thunderstorms
          case 301: // thunderstorms
          case 302: // isolated thunderstorms
          case 310: // scattered thunderstorms
          case 311: // scattered thunderstorms (not a typo)
          case 312: // thundershowers
          case 313: // isolated thundershowers
          case 314: // isolated thundershowers
          case 321: // isolated thundershowers
            return 'drizzle';
          case 801: // cloudy
          case 802: // mostly cloudy (night)
          case 803: // mostly cloudy (day)
          case 804: // clear (night)
            return 'cloudy';
        }
  }



/*******************/
//AGREGADO PASO 4
/*******************/

	/************************************************************
	*	SAVE CITYS SELECTED
	*************************************************************/
		function saveCitysInLocalStorage(){
			let selectedCities = JSON.stringify(app.selectedCities);
	    	localStorage.selectedCities = selectedCities;
		}

/*******************/
//AGREGADO PASO 4
/*******************/


/*******************/
//AGREGADO PASO 6
/*******************/

		/************************************************************
		*	UPDATE ALL CARDS
		*************************************************************/
			function updateCards(){
				app.selectedCities.forEach(function(city) {
			    	console.log("Actualizando Data: "+ JSON.stringify(city))
			      getDataCity(city,true);
			    });
			}

/*******************/
//AGREGADO PASO 6
/*******************/

/************************************************************
*	INITIAL ALL APP
*************************************************************/
		let initialData = [{
		    cod: '200',
		    id: '2643743',
		    name: 'London',
		    dt: '2016-07-22T01:00:00Z',
		    main:{
		    	temp: 'temp',
		    	humidity: 'humedad',
		    	temp_min: 'max',
		    	temp_max: 'min'
		    },
		    weather:[{
		    	id:200
		    }],
		    sys: {
		    	sunrise: 'sunrise',
		    	sunset: 'sunset'
		    }
		  }];

	function init(){
		app.selectedCities = localStorage.selectedCities;
	  if (app.selectedCities) {
	    app.selectedCities = JSON.parse(app.selectedCities);
	    console.log(JSON.stringify(app.selectedCities));
	    app.selectedCities.forEach(function(city) {
	    	console.log("Data de la CITY GUardada: "+ JSON.stringify(city))
	      getDataCity(city,true);
	    });
	  } else {
	  	console.log("No estaba en el Listado. "+initialData[0]);
	    getDataCity(initialData[0],true);
	    app.selectedCities = [ {"name":initialData[0].name} ];
	    /*******************/
		//AGREGADO PASO 4
		/*******************/
        	saveCitysInLocalStorage();
        /*******************/
		//AGREGADO PASO 4
		/*******************/
	  }
	}

	init();


/*******************/
//AGREGADO PASO 5
/*******************/

/************************************************************
*	SERVICE WORKER
*************************************************************/
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('/service.js')
		.then(function(reg) {
		    console.log('Registrando Service ' + reg.scope);
		}).catch(function(error) {
			   console.log('Falló la Registración' + error);
		});
	}
	
/*******************/
//AGREGADO PASO 5
/*******************/	


});//Document