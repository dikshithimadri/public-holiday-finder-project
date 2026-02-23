let searchHistory = [];
let currentHolidayData = [];

document.addEventListener("DOMContentLoaded", function () {

    loadYears();
    loadMonths();
    loadCountries();


    document.getElementById("monthSelect").disabled = true;
    document.getElementById("typeSelect").disabled = true;
});


function loadYears() {

    let yearSelect = document.getElementById("yearSelect");
    let currentYear = new Date().getFullYear();

    for (let year = 2000; year <= 2050; year++) {

        let option = document.createElement("option");
        option.value = year;
        option.text = year;

        if (year === currentYear) {
            option.selected = true;
        }

        yearSelect.appendChild(option);
    }
}


function loadMonths() {

    let monthSelect = document.getElementById("monthSelect");

    for (let i = 1; i <= 12; i++) {

        let option = document.createElement("option");
        option.value = i;
        option.text = new Date(2025, i - 1, 1)
            .toLocaleString("en-US", { month: "long" });

        monthSelect.appendChild(option);
    }
}


async function loadCountries() {

    let countrySelect = document.getElementById("countrySelect");

    try {

        let response = await fetch("https://date.nager.at/api/v3/AvailableCountries");


        let countries = await response.json();

        countrySelect.innerHTML = "<option value=''> Select Country </option>";

        countries.forEach(function (country) {

            let option = document.createElement("option");
            option.value = country.countryCode;
            option.text = country.name;

            countrySelect.appendChild(option);
        });

    } catch (error) {
        countrySelect.innerHTML = "<option value=''>Failed to load countries</option>";
    }
}



async function searchHolidays() {

    let country = document.getElementById("countrySelect").value;
    let year = document.getElementById("yearSelect").value;

    let messageBox = document.getElementById("messageBox");
    let loadingText = document.getElementById("loadingText");
    let holidayList = document.getElementById("holidayList");
    let totalCount = document.getElementById("totalCount");

    messageBox.innerHTML = "";
    holidayList.innerHTML = "";
    totalCount.innerHTML = "";
    currentHolidayData = [];


    document.getElementById("monthSelect").value = "";
    document.getElementById("typeSelect").value = "";
    document.getElementById("monthSelect").disabled = true;
    document.getElementById("typeSelect").disabled = true;



    loadingText.classList.remove("hidden");

    try {

        let apiUrl = `https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`;
        let response = await fetch(apiUrl);

        if (response.status === 404) {
            loadingText.classList.add("hidden");
        }


        let holidayData = await response.json();

        loadingText.classList.add("hidden");

        if (!Array.isArray(holidayData) || holidayData.length === 0) {
            messageBox.innerHTML = "No holidays found.";
            return;
        }

        currentHolidayData = holidayData;


        document.getElementById("monthSelect").disabled = false;
        document.getElementById("typeSelect").disabled = false;

        displayHolidays(currentHolidayData);
        saveSearch(country, year);

    } catch (error) {

        console.log(error);
    }
}

function applyFilters() {

    if (currentHolidayData.length === 0) {
        return;
    }

    let month = document.getElementById("monthSelect").value;
    let type = document.getElementById("typeSelect").value;

    let filteredData = currentHolidayData;

    if (month !== "") {
        filteredData = filteredData.filter(function (holiday) {
            let holidayMonth = new Date(holiday.date).getMonth() + 1;
            return holidayMonth == month;
        });
    }

    if (type !== "") {
        filteredData = filteredData.filter(function (holiday) {
            return holiday.types.includes(type);
        });
    }

    displayHolidays(filteredData);
}

function displayHolidays(data) {

    let holidayList = document.getElementById("holidayList");
    let totalCount = document.getElementById("totalCount");

    holidayList.innerHTML = "";
    totalCount.innerHTML = "Total Holidays Found: " + data.length;

    let today = new Date();

    data.forEach(function (holiday) {

        let holidayDate = new Date(holiday.date);
        let dayName = holidayDate.toLocaleDateString();

        let card = document.createElement("div");
        card.className = "border p-4 rounded bg-gray-50";

        if (holidayDate > today) {
            add("highlight-upcoming");
        }

        card.innerHTML = `
            <h3 class="font-bold text-lg">${holiday.name}</h3>
            <p><strong>Date:</strong> ${holiday.date}</p>
            <p><strong>Day:</strong> ${dayName}</p>
            <p><strong>Holiday Type:</strong> ${holiday.types.join(" ")}</p>
        `;

        holidayList.appendChild(card);
    });
}


function Search(country, year) {

    let searchItem = country + " - " + year;

    if (!searchHistory.includes(searchItem)) {
        searchHistory.push(searchItem);

    }
}

