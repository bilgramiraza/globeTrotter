const express = require('express');
const Datastore = require('nedb');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
app.listen(port,()=>console.log(`listening at port ${port}`));
app.use(express.static('public'));
app.use(express.json({limit:'1mb'}));

const database = new Datastore('database.db');
database.loadDatabase();

app.post('/api',(request, response)=>{
  let data = request.body;
  data.timeStamp = Date.now();
  database.insert(data);
  response.json({
    status:'success',
    ...data,
  });
});

app.get('/api',(request, response)=>{
  database.find({},(error, data)=>{
    if(error){
      console.log(error);
      response.end();
      return;
    }
    response.json(data);
  });
});

app.get('/weather/:coords',openWeatherAPI);
async function openWeatherAPI( request, response) {
  const [lat,lon] = request.params.coords.split(',');
  const apiKey = process.env.API_KEY;
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&lat=${lat}&lon=${lon}&appid=${apiKey}`;
  const aqiUrl = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  const weatherResponse = await fetch(weatherUrl);
  const aqiResponse = await fetch(aqiUrl);
  const weatherData = await weatherResponse.json();
  const aqiData = await aqiResponse.json();
  let aqi = '';
  switch (aqiData.list[0].main.aqi) {
    case 1:aqi = 'Good';
      break;
    case 2:aqi = 'Fair';
      break;
    case 3:aqi = 'Moderate';
      break;
    case 4:aqi = 'Poor';
      break;
    case 5:aqi = 'Very Poor';
      break;
  }
  const data = {
    temp:weatherData.main.temp,
    tempMin:weatherData.main.temp_min,
    tempMax:weatherData.main.temp_max,
    lastUpdatedTime:aqiData.list[0].dt,
    aqi:aqi,
    pm25:aqiData.list[0].components.pm2_5,
    pm10:aqiData.list[0].components.pm10,
  };
  response.json(data);  
}
