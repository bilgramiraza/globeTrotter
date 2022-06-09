setup();

function setup(){
  const reloadBtn = document.querySelector('#getData');
  const myMap = createWeatherMap();
  reloadBtn.addEventListener('click',async ()=>{setMarkers(myMap)});
}
function createWeatherMap() {
  const myMap = L.map('weatherMap').setView([0,0], 1);
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  const tileURL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const tiles = L.tileLayer(tileURL, {attribution});
  tiles.addTo(myMap);
  myMap.setView([0,0], 2);
  return myMap;
}

async function getData() {
  const response = await fetch('/api');
  const data = await response.json();
  return data;
}

async function setMarkers(myMap) {
  const data = await getData();
  for(item of data){
    const popupText = `Latitude:${item.latitude} Longitude:${item.longitude} \n Caption:${item.caption} \n`+
                      `Recorded Temps:\n Temp:${item.temp}&deg;C \t Avg:${item.tempMin}&deg;C/${item.tempMax}&deg;C \n`+
                      `Recorded AQI:\n Air Quality:${item.aqi} \n pm2.5:${item.pm25}μg/m3 pm10:${item.pm10}μg/m3`;
    const marker = L.marker([item.latitude, item.longitude]).addTo(myMap);
    marker.bindPopup(popupText);
  }
}