// const { ipcRenderer } = require("electron");
// var d = new Date();

// function hourFunc() {
//   var d = new Date();
//   var hours = d.getHours();
//   var minutes = d.getMinutes();
//   var time = "";
//   time += hours + ":" + minutes;
//   document.getElementById("heure").innerHTML = time;
//   setTimeout(hourFunc, 60000);
// }

// var day = d.getDate();
// var month = d.getMonth() + 1;
// var year = d.getFullYear();
// var now = "";
// now += day + "/" + month + "/" + year;

// document.getElementById("date").innerHTML = now;
// hourFunc();
// meteo();

// function meteo() {
//   var url =
//     "https://api.openweathermap.org/data/2.5/weather?q=Paris,fr&appid=c21a75b667d6f7abb81f118dcf8d4611&units=metric";
//   fetch(url).then(function(response) {
//     response.json().then(callBackGetSuccess);
//   });
// }

// function callBackGetSuccess(data) {
//   console.log(data);
//   var weatherArr = ["Clear", "Clouds", "Rain"];

//   var element = document.getElementById("zone_meteo");
//   element.innerHTML = Math.floor(data.main.temp) + "C";
//   var element2 = document.getElementById("ville");
//   element2.innerHTML = data.name;

//   var icone = document.getElementById("icone");
//   weatherArr.forEach(function(className) {
//     icone.classList.remove(className);
//   });
//   icone.classList.add(data.weather[0].main);
// }
// setTimeout(meteo, 900000);

// ipcRenderer.on("agenda-data-ready", (event, arg) => {
//   console.log(arg);
// });
// ipcRenderer.send("give-me-data");
