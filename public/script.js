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
        var gender=document.getElementById("gen").value;

        if (!name || !dob || !email) {
            alert("Please fill in all fields.");
            return;
        }

        // Calculate days until next birthday
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const birthdayDate = new Date(dob);
        let nextBirthday = new Date(today.getFullYear(), birthdayDate.getMonth(), birthdayDate.getDate());
        nextBirthday.setHours(0, 0, 0, 0);

        // If the next birthday is in the past, move it to the next year
        if (today > nextBirthday) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }

        const differenceInTime = nextBirthday - today;
        const daysUntilNextBirthday = Math.floor(differenceInTime / (1000 * 60 * 60 * 24));

        // Create the birthdayData object with the calculated daysUntilNextBirthday
        var birthdayData = {
            name: name,
            email: email,
            date: dob,
            days: daysUntilNextBirthday,
            gender:gender
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
        .then(() => {
            showPopupDialog(name);
            // Clear input fields after adding a birthday
            document.getElementById("name").value = "";
            document.getElementById("date").value = "";
            document.getElementById("email").value = "";
            upcome(); // Refresh the list of upcoming birthdays
        })
        .catch(error => {
            console.error('Error adding birthday:', error);
        });
    });

    function showPopupDialog(name) {
        var dialogBox = document.createElement("div");
        dialogBox.classList.add("dialog-box");

        var dialogContent = `
            <div class="dialog-content">
                <h3>Hey ${name},</h3>
                <p>Your birthday has been registered successfully!
                You will receive greetings on your special day. 🎉</p>
                <button id="closeDialog">Okay</button>
            </div>
        `;
        dialogBox.innerHTML = dialogContent;

        document.body.appendChild(dialogBox);

        var closeButton = document.getElementById("closeDialog");
        closeButton.addEventListener("click", () => {
            document.body.removeChild(dialogBox);
        });
    }

    async function upcome() {
        try {
            const response = await fetch('/birthdays');
            const apidata = await response.json();

            resultContainer.innerHTML = '';
            resultContainer.appendChild(text);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const birthdaysWithDays = apidata.map(birthday => {
                const birthdayDate = new Date(birthday.date);
                let nextBirthday = new Date(today.getFullYear(), birthdayDate.getMonth(), birthdayDate.getDate());
                nextBirthday.setHours(0, 0, 0, 0);

                if (today > nextBirthday) {
                    nextBirthday.setFullYear(today.getFullYear() + 1);
                }

                const differenceInTime = nextBirthday - today;
                const daysUntilNextBirthday = Math.floor(differenceInTime / (1000 * 60 * 60 * 24));

                return {
                    ...birthday,
                    nextBirthday: nextBirthday.toLocaleDateString(),
                    daysUntilNextBirthday
                };
            });

            const sortedBirthdays = birthdaysWithDays.sort((a, b) => a.daysUntilNextBirthday - b.daysUntilNextBirthday).slice(0, 5);

            sortedBirthdays.forEach(birthday => {
                var para = document.createElement("p");

                const humor = birthday.daysUntilNextBirthday === 0
                    ? `🎉 Today is ${birthday.name}'s birthday! Time to party! 🥳`
                    : `Just ${birthday.daysUntilNextBirthday} more days until ${birthday.name}'s birthday on ${birthday.nextBirthday}. Get ready for the cake! 🎂`;

                para.innerText = humor;

                var deleteButton = document.createElement("button");
                deleteButton.innerText = "Delete";
                deleteButton.style.color = "#AE1100";

                deleteButton.addEventListener("click", () => {
                    resultContainer.removeChild(para);
                });

                para.appendChild(deleteButton);
                resultContainer.appendChild(para);
                para.style.color = "black";
            });
        } catch (error) {
            console.error('Error fetching birthdays:', error);
        }
    }

    upcome();
});
