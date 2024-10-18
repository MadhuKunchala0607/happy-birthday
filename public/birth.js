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
                containerDiv.dataset.name = val.name.toLowerCase(); // Store name for search filtering

                const profileCardDiv = document.createElement('div');
                profileCardDiv.className = 'profile-card';

                const header = document.createElement('header');

                const link = document.createElement('a');
                link.href = '#';

                const img = document.createElement('img');
                if(val.gender=="male"){
                img.src = "bimg1.jpg"; 
                img.alt = 'Profile Picture';
                }
                else{
                    
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
                const line=document.createElement("p")
                line.innerText= ` More ${val.days} days to go to celebrate birthday `

             

                bioDiv.appendChild(h2);
                bioDiv.appendChild(line)
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
