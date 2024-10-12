document.addEventListener("DOMContentLoaded", () => {
    var resultContainer = document.getElementById("result");
    var text = document.createElement("h1");
    text.innerText = "Upcoming Birthdays";
    resultContainer.appendChild(text);

    var addButton = document.getElementById("btn");

    addButton.addEventListener("click", () => {
        var name = document.getElementById("name").value;
        var dob = document.getElementById("date").value;
        var email = document.getElementById("email").value;

        if (!name || !dob || !email) {
            alert("Please fill in all fields.");
            return;
        }

        var birthdayData = {
            name: name,
            email: email,
            date: dob
        };

        fetch('/birthdays', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(birthdayData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        showPopupDialog(name);
      
    });
    function showPopupDialog(name) {
        // Create the dialog box container
        var dialogBox = document.createElement("div");
        dialogBox.classList.add("dialog-box");

        // Create the content for the dialog box
        var dialogContent = `
            <div class="dialog-content">
                <h3>Hey ${name},</h3>
                <p>Your birthday has been registered successfully!
                You will receive greetings on your special day. 🎉</p>
                <button id="closeDialog">Okay</button>
            </div>
        `;
        dialogBox.innerHTML = dialogContent;

        // Add the dialog box to the body
        document.body.appendChild(dialogBox);

        // Add event listener to close the dialog
        var closeButton = document.getElementById("closeDialog");
        closeButton.addEventListener("click", () => {
            document.body.removeChild(dialogBox);
        });
    }

    // Function to fetch, calculate days, sort, and display top 5 nearest birthdays
    async function upcome() {
        try {
            const response = await fetch('/birthdays'); // Fetch birthday data from server
            const apidata = await response.json(); // Parse JSON response

            // Clear previous birthday messages, but keep the heading
            const heading = resultContainer.querySelector("h1"); // Get the heading
            resultContainer.innerHTML = ''; // Clear previous results

            // Re-append the heading
            if (heading) {
                resultContainer.appendChild(heading);
            }

            const today = new Date();

            // Calculate days remaining and sort the birthdays
            const birthdaysWithDays = apidata.map(birthday => {
                const birthdayDate = new Date(birthday.date);
                let nextBirthday = new Date(today.getFullYear(), birthdayDate.getMonth(), birthdayDate.getDate());

                // If the birthday this year has passed, consider the next year's birthday
                if (today > nextBirthday) {
                    nextBirthday.setFullYear(today.getFullYear() + 1);
                }

                const differenceInTime = nextBirthday - today;
                const daysUntilNextBirthday = Math.floor(differenceInTime / (1000 * 60 * 60 * 24));

                return {
                    ...birthday,
                    nextBirthday: nextBirthday.toLocaleDateString(), // Format the date nicely
                    daysUntilNextBirthday
                };
            });

            // Sort birthdays based on the number of days remaining, and take the top 5
            const sortedBirthdays = birthdaysWithDays.sort((a, b) => a.daysUntilNextBirthday - b.daysUntilNextBirthday).slice(0, 5);

            // Display the sorted birthdays
            sortedBirthdays.forEach(birthday => {
                var para = document.createElement("p");
                
                const humor = birthday.daysUntilNextBirthday === 0
                    ? `🎉 Today is ${birthday.name}'s birthday! Time to party! 🥳`
                    : `Just ${birthday.daysUntilNextBirthday + 1} more days until ${birthday.name}'s birthday on ${birthday.nextBirthday}. Get ready for the cake! 🎂`;

                para.innerText = humor;

                var deleteButton = document.createElement("button");
                deleteButton.innerText = "Delete";
                deleteButton.style.color = "#AE1100";

                // Event listener to delete the birthday reminder (UI only, add server-side handling)
                deleteButton.addEventListener("click", () => {
                    resultContainer.removeChild(para);
                    // Optionally: Send a request to server to delete this birthday
                });

                para.appendChild(deleteButton);
                resultContainer.appendChild(para);
                para.style.color = "black";
            });
        } catch (error) {
            console.error('Error fetching birthdays:', error);
        }
    }

    upcome(); // Initial call to display upcoming birthdays on page load
});
