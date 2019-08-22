const { ipcRenderer } = require("electron");
const os = require("os");

if (os.platform() == "linux") {
  const MAIN_BUTTON = 17;
  const gpio = require("rpi-gpio");
  const rpi_gpio_buttons = require("rpi-gpio-buttons");
}

const days = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];

const months = [
  "Janvier",
  "Fevrier",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Decembre"
];

var list;

var currentMusic = 0;

var show = false;

function checkPlatform() {
  var nodeListButton = document.getElementsByTagName("button").length;

  if (os.platform() !== "linux") {
    for (var i = 0; i < nodeListButton; i++) {
      document.getElementsByTagName("button")[i].style.display = "block";
    }
  }
}

function timeFunc() {
  var today = new Date();
  var hours = today.getHours();
  if (hours < 10) {
    hours = "0" + hours;
  }
  var minutes = today.getMinutes();
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  var time = hours + ":" + minutes;
  var day = days[today.getDay()];
  var date = today.getDate();
  var month = months[today.getMonth()];
  var year = today.getFullYear();
  var now = day + " " + date + " " + month + " " + year;
  document.getElementById("hour").innerHTML = time;
  document.getElementById("date").innerHTML = now;
  setTimeout(timeFunc, 60000);
}

function wheather() {
  var url =
    "https://api.openweathermap.org/data/2.5/weather?q=Paris,fr&appid=c21a75b667d6f7abb81f118dcf8d4611&units=metric";
  fetch(url).then(function(response) {
    response.json().then(callBackGetSuccess);
  });
  setTimeout(wheather, 900000);
}

function callBackGetSuccess(data) {
  const wheatherArray = ["Clear", "Clouds", "Rain"];
  const temperature = document.getElementById("zone_temperature");
  temperature.innerHTML = Math.floor(data.main.temp) + "°";
  const city = document.getElementById("city");
  city.innerHTML = data.name;
  const icon = document.getElementById("icon");
  wheatherArray.forEach(function(className) {
    icon.classList.remove(className);
  });
  icon.classList.add(data.weather[0].main);
}

ipcRenderer.on("agenda-data-ready", (event, events) => {
  console.log("mesevenements :", events);
  if (events.length === 0) {
    return (document.getElementById("events").innerHTML =
      "Vous n'avez pas d'évènements de prévu aujourd'hui");
  }
  document.getElementById("events").innerHTML = events
    .map(function(evenements) {
      console.log(evenements);
      if (evenements.start.dateTime) {
        var dateEvents = new Date(evenements.start.dateTime);
        var minutes = dateEvents.getMinutes();
        if (minutes < 10) {
          minutes = "0" + minutes;
        }
        var hours = dateEvents.getHours();
        if (hours < 10) {
          hours = "0" + heures;
        }
        return (
          "<li>" +
          "<span class='dateEvents'>" +
          hours +
          "h" +
          minutes +
          "   " +
          "</span>" +
          "<span class='summaryEvents'>" +
          evenements.summary +
          "</span>" +
          "</li>"
        );
      } else {
        return (
          "<li>" +
          "<span class='dateEvents'>" +
          "Toute la journée" +
          " " +
          "</span>" +
          "<span class='summaryEvents'>" +
          evenements.summary +
          "</span>" +
          "</li>"
        );
      }
    })
    .join("");
});

function refreshAgenda() {
  ipcRenderer.send("give-me-data");
  setTimeout(refreshAgenda, 5 * 60 * 1000);
}

ipcRenderer.on("music-data", (event, items) => {
  list = items;
  audio.src = "musics/" + items[0];
  document.getElementById("musicTitle").innerHTML = items[0];

  var incrementation = 0;
  var musicNumber = 1;
  document.getElementById("musics").innerHTML = items
    .map(function(item) {
      var path = "musics";
      return (
        "<li id='li_" +
        incrementation++ +
        "' >" +
        musicNumber++ +
        ".    " +
        item +
        "</li>"
      );
    })
    .join("");
  let itemsLi = document.querySelectorAll("#musics li");
  itemsLi.forEach(function(itemLi) {
    observer.observe(itemLi);
  });
});

ipcRenderer.send("wait-for-data");

const audio = document.getElementById("audio");

document.getElementById("playbutton").innerHTML = "play";

var isPlaying = false;

function playMusic() {
  if (show === false) {
    return;
  }
  if (isPlaying) {
    audio.pause();
    document.getElementById("audioPlayer").classList.add("pause");
  } else {
    audio.play();
    document.getElementById("li_" + currentMusic).style.fontWeight = "bold";
    document.getElementById("audioPlayer").classList.remove("pause");
  }
}
audio.onplaying = function() {
  isPlaying = true;
  document.getElementById("playbutton").innerHTML = "pause";
};
audio.onpause = function() {
  isPlaying = false;
  document.getElementById("playbutton").innerHTML = "play";
};

audio.onended = NextMusic;

let observer = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.intersectionRatio === 1) {
      entry.target.setAttribute("isVisible", "true");
    } else {
      entry.target.setAttribute("isVisible", "false");
    }
  });
});

function nextMusic() {
  document.getElementById("li_" + currentMusic).style.fontWeight = "normal";
  currentMusic++;
  if (currentMusic === list.length) {
    currentMusic = 0;
  }
  document.getElementById("li_" + currentMusic).style.fontWeight = "bold";
  if (
    document.getElementById("li_" + currentMusic).getAttribute("isVisible") ===
    "false"
  ) {
    document.getElementById("audioPlayer").scrollTop += 40;
  }
  if (currentMusic === 0) {
    document.getElementById("audioPlayer").scrollTop = 0;
  }
  audio.src = "musics/" + list[currentMusic];

  audio.play();

  document.getElementById("musicTitle").innerHTML = list[currentMusic];
}

function previousMusic() {
  document.getElementById("li_" + currentMusic).style.fontWeight = "normal";
  currentMusic--;
  if (currentMusic === -1) {
    currentMusic = list.length - 1;
  }
  document.getElementById("li_" + currentMusic).style.fontWeight = "bold";
  if (
    document.getElementById("li_" + currentMusic).getAttribute("isVisible") ===
    "false"
  ) {
    document.getElementById("audioPlayer").scrollTop -= 40;
  }
  if (currentMusic === list.length - 1) {
    document.getElementById("audioPlayer").scrollTop = document.getElementById(
      "audioPlayer"
    ).scrollHeight;
  }
  audio.src = "musics/" + list[currentMusic];
  audio.play();
  document.getElementById("musicTitle").innerHTML = list[currentMusic];
}

function changePage() {
  if (show) {
    document.getElementById("homePage").style.display = "block";
    document.getElementById("audioPlayer").style.display = "none";
  } else {
    document.getElementById("homePage").style.display = "none";
    document.getElementById("audioPlayer").style.display = "block";
  }
  show = !show;
}

if (os.platform() == "linux") {
  const button = rpi_gpio_buttons([MAIN_BUTTON], {
    mode: rpi_gpio_buttons.MODE_BCM
  });

  gpio.setMode(gpio.MODE_BCM);

  gpio.on("change", function(channel, value) {
    console.log(channel + " " + value);
    if (channel === 18 && value) {
      if (audio.volume >= 0.1) {
        audio.volume -= 0.1;
      }
    } else if (channel === 17 && value) {
      playMusic();
    } else if (channel === 27 && value) {
      nextMusic();
    } else if (channel === 22 && value) {
      previousMusic();
    } else if (channel === 23 && value) {
      if (audio.volume <= 0.9) {
        audio.volume += 0.1;
      }
    }
  });

  button.on("double_clicked", function(pin) {
    changePage();
  });

  gpio.setup(18, gpio.DIR_IN, gpio.EDGE_BOTH);

  gpio.setup(17, gpio.DIR_IN, gpio.EDGE_BOTH);

  gpio.setup(27, gpio.DIR_IN, gpio.EDGE_BOTH);

  gpio.setup(22, gpio.DIR_IN, gpio.EDGE_BOTH);

  gpio.setup(23, gpio.DIR_IN, gpio.EDGE_BOTH);
}

checkPlatform();

timeFunc();

wheather();

refreshAgenda();
