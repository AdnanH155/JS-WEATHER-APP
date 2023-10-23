const mainCard = document.querySelector(".mainCard");
const lowerCard = document.querySelectorAll(".lowerCard");
const searchInput = document.querySelector(".searchInput");
const inputError = document.querySelector(".error");

// everything runs through the main function
main();

// gets user location and links to the api for daily and weekly forecasts
async function main() {
  navigator.geolocation.getCurrentPosition((position) => {
    const fixedCoords = {
      lon: position.coords.longitude,
      lat: position.coords.latitude,
    };
    console.log(position.coords);
    getData(fixedCoords);
    getWeeklyData(fixedCoords, "");
  });

  searchInput.addEventListener("keydown", async (event) => {
    if (event.code === "Enter") {
      event.preventDefault();
      try {
        const schema = joi.object({
          location: joi.string().required().min(3).max(30),
        });
        await schema.validateAsync({
          location: event.target.value,
        });
        const coords = await userGeoLocation(event.target.value);
        if (coords.length > 0) {
          getData(coords[0]);
          getWeeklyData(coords[0], event.target.value);
        } else {
          inputError.innerHTML = `City not found`;
        }
      } catch (error) {
        console.log(error);
        inputError.innerHTML = `Incorrect input please try again`;
      }
    }
  });
}

// gathers the users location
async function userGeoLocation(city) {
  try {
    const { data } = await axios.get(
      `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=37b29f091f8754cf8600dea56dee3863`
    );
    return data;
  } catch (error) {
    console.log(error);
    inputError.innerHTML = `API failed`;
  }
}
async function getData(coords) {
  console.log(coords);

  //   Obtains the Weather from the API for the daily forecast- Controller
  try {
    const { data } = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=37b29f091f8754cf8600dea56dee3863`
    );
    // calls the main card with the data collected through the API
    cardCreater(data);
  } catch (error) {
    console.log(error);
    inputError.innerHTML = `API failed`;
  }
}

async function getWeeklyData(coords, name) {
  console.log(coords);
  try {
    // obtains the weather from the API for the weekly forecast
    const { data } = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=37b29f091f8754cf8600dea56dee3863`
    );
    weeklyCardCreater(data.list, name);
  } catch (error) {
    console.log(error);
    inputError.innerHTML = `API failed`;
  }
}

// creates the HTML for the main card
function cardCreater(data) {
  mainCard.innerHTML = `<div>
        <h1 class="mainDate"> ${new Date(
          data.dt * 1000
        ).toLocaleDateString()}</h1>
        <div class=weatherInfo>
            <p class="temp">${Math.round(data.main.temp - 273.15)}&deg;c</p> 
            <img src="https://openweathermap.org/img/wn/${
              data.weather[0].icon
            }.png"/> 
        </div>

        <div class="iconDescription"
            <p></p>
            <p></p>
            <p>${data.weather[0].description}</p>
        </div>
    
        <div class="trioHeaders">
            <p>Feels like</p>
            <p>Humidity</p>
            <p>Wind Speed</p>
        </div>

        <div class="trioData">
            <p> ${Math.round(data.main.feels_like - 273.15)}&deg;c </p>
            <p> ${data.main.humidity}%</p>
            <p> ${data.wind.speed} mph</p>
        </div>

        <div class="sun">
            <p> Sun-rise : ${new Date(
              data.sys.sunrise * 1000
            ).toLocaleTimeString()} </p> 
            <p> Sun-set : ${new Date(
              data.sys.sunset * 1000
            ).toLocaleTimeString()} </p>
        </div>

        <div class="sunIcons">
            <img src="https://openweathermap.org/img/wn/01d.png"/>
            <img src="https://openweathermap.org/img/wn/01n.png"/>
        </div>
    </div>`;
}
// WEEKLY CARDS
function weeklyCardCreater(data, name) {
  const dateArray = newDateArray();

  const lowerCards = Array.from(lowerCard);
  dateArray.forEach((item, index) => {
    const newData = data.filter((child) => {
      if (new Date(item).getDate() === new Date(child.dt * 1000).getDate()) {
        return child;
      }
    });
    const temp =
      newData.reduce((total, item) => {
        return total + item.main.temp;
      }, 0) / newData.length;

    const feelLike =
      newData.reduce((total, item) => {
        return total + item.main.feels_like;
      }, 0) / newData.length;

    const humidity =
      newData.reduce((total, item) => {
        return total + item.main.humidity;
      }, 0) / newData.length;
    console.log(newData);
    lowerCards[index].innerHTML = `
      <div>
        <h3 class="locationName"> ${firstCap(name)}</h3>
        <p class=weeklyDate> ${item.toLocaleDateString()} </p>
      </div>
      <div>
        <p class="locationTemp">${Math.round(temp - 273.15)}&deg;c</p>
        <p class="weeklyFeels"> F:${Math.round(
          feelLike - 273.15
        )}&deg H:${Math.round(humidity)}%</p>
      </div>
      <div class="weeklyFeels">
        <img src="https://openweathermap.org/img/wn/${
          newData[0].weather[0].icon
        }.png"/> 
      </div>
      <div class = "weeklyDescription">
        <p> ${newData[0].weather[0].description} </p>
        </div>
    </div>`;
  });
}
// utility function
function newDateArray() {
  const currentDate = new Date();
  console.log(currentDate);
  const array = [];
  for (let index = 0; index < 5; index++) {
    let nextDay = new Date();
    nextDay.setDate(currentDate.getDate() + index);
    array.push(nextDay);
  }
  return array;
}
function firstCap(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
