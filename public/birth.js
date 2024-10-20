// Array of image URLs
const imageArray = [
    'bimg1.jpg',
    'bimg2.jpg',
    'bimg3.jpg',
    'bimg4.jpg',
    'bimg5.jpg',
    'bimg6.jpg',
    'img.jpg'
];

function fetchAndDisplayBirthdays() {
    fetch('/birthdays') 
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); 
        })
        .then(data => {
            const container = document.getElementsByClassName("cont")[0];
            const fragment = document.createDocumentFragment(); 

            container.innerHTML = ''; // Clear previous content

            if (data.length === 0) {
                const noBirthdaysMessage = document.createElement('p');
                noBirthdaysMessage.textContent = 'No birthdays to display.';
                container.appendChild(noBirthdaysMessage);
                return;
            }

            data.forEach((val) => {
                const happy_birthday = new Date(val.date); 

                if (isNaN(happy_birthday)) {
                    console.error('Invalid date:', val.date);
                    return; 
                }

                // Calculate the next birthday date
                const today = new Date();
                let nextBirthday = new Date(happy_birthday);
                nextBirthday.setFullYear(today.getFullYear());

                // If the birthday has already passed this year, set it to next year
                if (today > nextBirthday) {
                    nextBirthday.setFullYear(today.getFullYear() + 1);
                }

                // Calculate the remaining days until the next birthday
                const timeDifference = nextBirthday - today; // difference in milliseconds
                const remainingDays = Math.ceil(timeDifference / (1000 * 3600 * 24)); // convert milliseconds to days

                // Calculate age in years, weeks, and days
                const ageInMilliseconds = today - happy_birthday;
                const ageDate = new Date(ageInMilliseconds);
                const ageYears = ageDate.getUTCFullYear() - 1970; // Subtract 1970 because getUTCFullYear() returns years since 1970
                const ageDays = Math.floor(ageInMilliseconds / (1000 * 3600 * 24));
                const ageWeeks = Math.floor(ageDays / 7); // Calculate weeks from total days

                const randomImage = imageArray[Math.floor(Math.random() * imageArray.length)];

                const containerDiv = document.createElement('div');
                containerDiv.className = 'profile-card-container';
                containerDiv.dataset.name = val.name.toLowerCase(); // Store name for search filtering

                const profileCardDiv = document.createElement('div');
                profileCardDiv.className = 'profile-card';

                const header = document.createElement('header');

                const link = document.createElement('a');
                link.href = '#';

                const img = document.createElement('img');
                if (val.gender == "male") {
                    img.src = "bimg1.jpg"; 
                    img.alt = 'Profile Picture';
                } else {
                    img.src = "bimg6.jpg"; 
                }

                link.appendChild(img);
                header.appendChild(link);

                const bioDiv = document.createElement('div');
                bioDiv.className = 'profile-bio';

                const h2 = document.createElement('h2');
                h2.textContent = `${val.name}`;

                const p = document.createElement('p');
                p.textContent = `DOB: ${happy_birthday.toLocaleDateString()} ${today.getMonth() === happy_birthday.getMonth() && today.getDate() === happy_birthday.getDate() ? 'Celebrating birthday today' : ''}`;
                
                const line = document.createElement("p");
                line.innerText = `More ${remainingDays} days to go to celebrate birthday`;

                const ageInfo = document.createElement("p");
                ageInfo.innerText = `Age: ${ageYears} years, ${ageWeeks} weeks, and ${ageDays % 7} days`;

                bioDiv.appendChild(h2);
                bioDiv.appendChild(line);
                bioDiv.appendChild(p);
                bioDiv.appendChild(ageInfo); // Append age info

                profileCardDiv.appendChild(header);
                profileCardDiv.appendChild(bioDiv);
                containerDiv.appendChild(profileCardDiv);

                fragment.appendChild(containerDiv);
            });

            container.appendChild(fragment);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            const container = document.getElementsByClassName("cont")[0];
            const errorMessage = document.createElement('p');
            errorMessage.textContent = 'Error fetching birthdays. Please try again later.';
            container.appendChild(errorMessage);
        });
}

function setupSearch() {
    const searchInput = document.getElementById("text");
    searchInput.addEventListener("input", () => {
        const searchTerm = searchInput.value.toLowerCase();
        const cards = document.querySelectorAll(".profile-card-container");
        
        cards.forEach(card => {
            const name = card.dataset.name;
            if (name.includes(searchTerm)) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    });
}

window.onload = () => {
    fetchAndDisplayBirthdays();
    setupSearch(); 
};
