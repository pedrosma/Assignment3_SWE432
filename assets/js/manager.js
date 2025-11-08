//import module
import { User } from './models/user.js';

//variables
let djCount = 3;                    
const stationName = "Campus Radio";  
var isOpen = true;                  

//object
let radioHost = {
    name: "Alex",
    showName: "Morning Melodies",
    yearsExperience: 5
};
console.log(radioHost.name);
radioHost.yearsExperience = 6;
radioHost.timeSlot = "8am - 10am";
console.log(radioHost);

//use User class
const dj1 = new User("DJ Nova", "EDM");
const dj2 = new User("DJ Luna", "Lo-Fi");

dj1.introduce();
dj2.introduce();

//window object
document.addEventListener("DOMContentLoaded", function() {
    console.log("Page loaded!");
    
    setupEvents();
    
    let dateInput = document.getElementById("date");
    let today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
});

//event listener
function setupEvents() {
    //sidebar toggle
    let toggleBtn = document.getElementById('toggle-btn');
    toggleBtn.addEventListener('click', function() {
        let sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('collapsed');
        console.log("Sidebar toggled");
    });

    //submit form
    let form = document.getElementById("signUpForm");
    form.addEventListener("submit", handleSubmit);

    // Event #3: Hover test - mouseenter event
    let hoverBtn = document.getElementById("hover-btn");
    hoverBtn.addEventListener("mouseenter", function() {
        this.style.backgroundColor = "#60a5fa";
        this.textContent = "You're hovering!";
    });

    // Event #4: Hover test - mouseleave event
    hoverBtn.addEventListener("mouseleave", function() {
        this.style.backgroundColor = "";
        this.textContent = "Hover Test";
    });

    // Event #5: Click test - click event
    let clickBtn = document.getElementById("click-btn");
    clickBtn.addEventListener("click", function() {
        let output = document.getElementById("test-output");
        output.textContent = "Button was clicked at " + new Date().toLocaleTimeString();
        output.style.color = "#4ade80";
    });
}

//form validation
function handleSubmit(event) {
    event.preventDefault(); 

    let date = document.getElementById("date").value;
    let time = document.getElementById("time").value;
    let djName = document.getElementById("dj").value;
    let genre = document.getElementById("genre").value;
    
    if (date == "" || time == "" || djName == "" || genre == "") {
        displayMessage("Please fill in all fields!", "error");
        return;
    }
    
    let namePattern = /^[A-Za-z\s]+$/;
    if (!namePattern.test(djName)) {
        displayMessage("DJ name can only contain letters and spaces!", "error");
        return;
    }
    
    let selectedDate = new Date(date + "T" + time);
    let now = new Date();
    if (selectedDate < now) {
        displayMessage("Cannot select a time in the past!", "error");
        return;
    }
    
    let tableRows = document.querySelectorAll("#schedule-body tr");
    let duplicate = false;
    
    //loop
    for (let i = 0; i < tableRows.length; i++) {
        let existingDJ = tableRows[i].cells[1].textContent;
        if (existingDJ == djName) {
            duplicate = true;
            break;
        }
    }
    
    //conditional
    if (duplicate) {
        displayMessage("This DJ is already in the schedule!", "error");
        return;
    }
    
    // If all validations pass, add to table
    addToTable(time, djName, genre);
    displayMessage("DJ assigned successfully!", "success");
    
    // Clear the form
    document.getElementById("signUpForm").reset();
}


function addToTable(time, djName, genre) {
    let tableBody = document.getElementById("schedule-body");

    let newRow = document.createElement("tr");
    
    let hour = parseInt(time.split(':')[0]);
    let nextHour = hour + 1;
    let timeSlot = hour + ":00 - " + nextHour + ":00";
    
    newRow.innerHTML = 
        "<td>" + timeSlot + "</td>" +
        "<td>" + djName + "</td>" +
        "<td>" + genre + "</td>" +
        "<td><button onclick='deleteRow(this)' class='btn-small'>Remove</button></td>";
    
    tableBody.appendChild(newRow);
    djCount++;
    newRow.style.backgroundColor = "#60a5fa";

    setTimeout(function() {
        newRow.style.backgroundColor = "";
    }, 2000);
}

//inline event handlers
function changeTheme() {
    document.body.classList.toggle('light');
    console.log("Theme changed");
}

function clearForm() {
    document.getElementById("signUpForm").reset();
    displayMessage("Form cleared", "info");
}

function deleteRow(button) {
    let confirmDelete = window.confirm("Are you sure you want to remove this DJ?");
    
    if (confirmDelete && button) {
        let row = button.parentElement.parentElement;
        row.remove();
        djCount--;
        displayMessage("DJ removed from schedule", "info");
    }
}

function filterSongs() {
    let searchText = document.getElementById("song-search").value.toLowerCase();
    let songList = document.querySelectorAll("#song-list li");
    
    songList.forEach(function(item) {
        let text = item.textContent.toLowerCase();
        
        if (text.includes(searchText)) {
            item.style.display = "";
            item.style.backgroundColor = "#23314d";
        } else {
            item.style.display = "none";
        }
    });
}

// INLINE HANDLER - Simple alert (renamed to avoid conflict)
function showSimpleAlert() {
    window.alert("This is a simple alert message!");
}

// Helper function to display form messages
function displayMessage(text, type) {
    let messageDiv = document.getElementById("form-message");
    messageDiv.textContent = text;
    messageDiv.className = "message " + type;
    messageDiv.style.display = "block";
    
    // Hide message after 3 seconds
    setTimeout(function() {
        messageDiv.style.display = "none";
    }, 3000);
}

// Make inline functions available globally
window.changeTheme = changeTheme;
window.clearForm = clearForm;
window.deleteRow = deleteRow;
window.filterSongs = filterSongs;
window.showSimpleAlert = showSimpleAlert;