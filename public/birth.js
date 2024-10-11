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

// Function to fetch and display all birthday data
function fetchAndDisplayBirthdays() {
    fetch('/birthdays') // Fetch all birthdays from the database
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Parse the JSON response
        })
        .then(data => {
            const container = document.getElementsByClassName("cont")[0];
            const fragment = document.createDocumentFragment(); // Use DocumentFragment for performance

            // Check if there are no birthdays
            if (data.length === 0) {
                const noBirthdaysMessage = document.createElement('p');
                noBirthdaysMessage.textContent = 'No birthdays to display.';
                container.appendChild(noBirthdaysMessage);
                return;
            }

            const today = new Date();
            data.forEach((val) => {
                // Convert the birthday date from the database to a Date object
                const happy_birthday = new Date(val.date); 

                // Check if the date is valid
                if (isNaN(happy_birthday)) {
                    console.error('Invalid date:', val.date);
                    return; // Skip this iteration if the date is invalid
                }

                // Get a random image from the array
                const randomImage = imageArray[Math.floor(Math.random() * imageArray.length)];
                
                // Create the profile card elements
                const containerDiv = document.createElement('div');
                containerDiv.className = 'profile-card-container';

                const profileCardDiv = document.createElement('div');
                profileCardDiv.className = 'profile-card';

                const header = document.createElement('header');

                const link = document.createElement('a');
                link.href = '#';

                // Use the random image
                const img = document.createElement('img');
                img.src = randomImage; // Set the random image URL
                img.alt = 'Profile Picture';

                link.appendChild(img);
                header.appendChild(link);

                const bioDiv = document.createElement('div');
                bioDiv.className = 'profile-bio';

                const h2 = document.createElement('h2');
                h2.textContent = val.name; // Accessing name from the database

                const p = document.createElement('p');
                p.textContent = `DOB: ${happy_birthday.toLocaleDateString()} ${today.getMonth() === happy_birthday.getMonth() && today.getDate() === happy_birthday.getDate() ? 'Celebrating birthday today' : ''}`;

                bioDiv.appendChild(h2);
                bioDiv.appendChild(p);

                profileCardDiv.appendChild(header);
                profileCardDiv.appendChild(bioDiv);
                containerDiv.appendChild(profileCardDiv);

                // Append to the document fragment instead of the DOM directly
                fragment.appendChild(containerDiv);
            });

            // Append the fragment to the container in the HTML
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

// Call the function to fetch and display birthdays when the page loads
window.onload = fetchAndDisplayBirthdays;
