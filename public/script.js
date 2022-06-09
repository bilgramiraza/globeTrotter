setup();
async function setup() {
  let data = await getWeatherData();//
  displayData(data);                //Triggers on Page Load
  setInterval(async ()=>{                 //
    data = await getWeatherData();  //Reloads Data and Repaints DOM Every 5 seconds
    displayData(data);
  }, 5000);  
  const recordBtn = document.querySelector('#record');
  recordBtn.addEventListener('click',()=>{
    sendData(data);
  });
}

async function getCoords() {
  let getLocationPromise = new Promise((resolve, reject)=>{   //Extracts Location coords 
    if(navigator.geolocation){                                //for external uses
      navigator.geolocation.getCurrentPosition((position)=>{
        lat = position.coords.latitude
        long = position.coords.longitude
        resolve({latitude: lat, 
                longitude: long});
      });
    }
    else{
      reject("your browser doesn't support geolocation");
    }
  });
  try {
    return await getLocationPromise;    
  } catch (error) {
    alert(error);
    return {latitude: null, longitude: null};
  }
}

async function getWeatherData() {
  const position = await getCoords();
  try {
    const weatherResponse = await fetch(`/weather/${position.latitude},${position.longitude}`);
    const weatherData = await weatherResponse.json();
    return {...weatherData, ...position};
  } catch (error) {
    alert(error);
    return {
      latitude:null,
      longitude:null,
      temp:null,
      tempMin:null,
      tempMax:null,
      lastUpdatedTime:null,
      aqi:null,
      pm25:null,
      pm10:null};
  }
}

function displayData(data){
  if(!data.latitude){
    return;
  }
  const latDOM = document.querySelector('.lat');
  const lonDOM = document.querySelector('.lon');
  const tempDOM = document.querySelector('.temp');
  const tempMaxDOM = document.querySelector('.tempMax');
  const tempMinDOM = document.querySelector('.tempMin');
  const aqiDOM = document.querySelector('.aqi');
  const pm2_5DOM = document.querySelector('.pm25');
  const pm10DOM = document.querySelector('.pm10');
  const timeStampDOM = document.querySelector('.timeStamp');

  latDOM.textContent = data.latitude.toFixed(2);
  lonDOM.textContent = data.longitude.toFixed(2);
  tempDOM.textContent = data.temp;
  tempMaxDOM.textContent = data.tempMax;
  tempMinDOM.textContent = data.tempMin;
  aqiDOM.textContent=data.aqi;
  pm2_5DOM.textContent=data.pm25;
  pm10DOM.textContent=data.pm10;
  timeStampDOM.textContent=new Date(data.lastUpdatedTime*1000).toUTCString();
}

async function sendData(data) {
  const captionDOM = document.querySelector('.caption');
  data.caption = captionDOM.value;
  const options = {
    method:'POST',
    headers:{
      "Content-Type": 'application/json',
    },
    body:JSON.stringify(data),
  };
  const response = await fetch('/api',options);
  console.log(await response.json());
}