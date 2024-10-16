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

         
            if (data.length === 0) {
                const noBirthdaysMessage = document.createElement('p');
                noBirthdaysMessage.textContent = 'No birthdays to display.';
                container.appendChild(noBirthdaysMessage);
                return;
            }

            const today = new Date();
            data.forEach((val) => {
            
                const happy_birthday = new Date(val.date); 

             
                if (isNaN(happy_birthday)) {
                    console.error('Invalid date:', val.date);
                    return; 
                }

                const randomImage = imageArray[Math.floor(Math.random() * imageArray.length)];
                
            
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


window.onload = fetchAndDisplayBirthdays;
