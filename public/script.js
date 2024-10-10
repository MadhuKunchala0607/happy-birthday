document.addEventListener("DOMContentLoaded", () => {
    var addButton = document.getElementById("btn");
    var resultContainer = document.getElementById("result");

    // Add event listener to the button
    addButton.addEventListener("click", () => {
        var name = document.getElementById("name").value;
        var dob = document.getElementById("date").value;
        var email = document.getElementById("email").value; // Get email value

        // Input validation
        if (!name || !dob || !email) {
            alert("Please fill in all fields.");
            return;
        }

        var today = new Date();
        var userBirthday = new Date(dob);

        // Check if the date is valid
        if (isNaN(userBirthday.getTime())) {
            alert("Invalid date format. Please enter a valid date.");
            return;
        }

        let nextBirthday = new Date(today.getFullYear(), userBirthday.getMonth(), userBirthday.getDate());
        if (today > nextBirthday) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }
        var differenceInTime = nextBirthday - today;
        var daysUntilNextBirthday = Math.floor(differenceInTime / (1000 * 60 * 60 * 24));

        // Object to send to the server
        var birthdayData = {
            name: name,
            email: email,
            date: dob
        };

        // Make a POST request to the server
        fetch('/birthdays', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(birthdayData), // Convert the object to a JSON string
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Parse the JSON response
        })
        .then(data => {
            // Create a new paragraph element for displaying the result
            var para = document.createElement("p");
            var deleteButton = document.createElement("button");
            deleteButton.innerText = "Delete";
            deleteButton.style.color = "#AE1100";

            // If the birthday is today
            if (today.getMonth() === userBirthday.getMonth() && today.getDate() === userBirthday.getDate()) {
                para.innerText = `Happy birthday ${name}! 🎉`;
                var song = document.createElement("audio");
                song.src = "path/to/your/song.mp3"; // Add the source of the audio file here
                song.autoplay = true; // Optionally autoplay the audio
                para.appendChild(song); // Append the audio element to the paragraph
                alert("Your birthday is saved.");
            } else if (daysUntilNextBirthday < 10) {
                para.innerText = `Hey ${name}, your next birthday is in ${daysUntilNextBirthday + 1} days.`;
                alert("Your birthday is saved.");
            } else {
                para.innerText = `Hey ${name}, your birthday is on ${userBirthday.toDateString()}.`;
            }

            para.appendChild(deleteButton);
            resultContainer.appendChild(para);
            para.style.color = "black";

            // Event listener to delete the birthday reminder
            deleteButton.addEventListener("click", () => {
                resultContainer.removeChild(para);
            });

            // Clear the input fields after saving
            document.getElementById("name").value = '';
            document.getElementById("date").value = '';
            document.getElementById("email").value = '';
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            alert('Error saving birthday. Please try again.');
        });
    });
});
