let currentUser = null;

// Helper functions for login state
function isLoggedIn() {
    return localStorage.getItem('loggedIn') === 'true';
}

function getLoggedInUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Show Sign-In Page
function showSignIn() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="watermark">CuisineCompass</div>
        <header>
            <h1>Embark on a delicious journey</h1>
        </header>
        <h3>Sign in and let your taste buds lead the way!</h3>
        <form id="signInForm">
            <label for="email">Email:</label>
            <input type="email" id="email" required>
            <label for="password">Password:</label>
            <input type="password" id="password" required>
            <button type="submit">Sign In</button>
        </form>
        <p>Don't have an account? <a href="#" onclick="showSignUp()">Sign Up</a></p>
    `;

    document.getElementById('signInForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(user => user.email === email && user.password === password);

        if (user) {
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify(user));
            showDashboard();
        } else {
            alert('Invalid credentials');
        }
    });
}

// Show Sign-Up Page
function showSignUp() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="watermark">CuisineCompass</div>
        <header>
            <h1>Join now to navigate the ultimate flavor journey</h1>
        </header>
        <h3>Sign up to chart your course through a world of flavors!</h3>
        <form id="signUpForm">
            <label for="newEmail">Email:</label>
            <input type="email" id="newEmail" required>
            <label for="newPassword">Password:</label>
            <input type="password" id="newPassword" required>
            <button type="submit">Sign Up</button>
        </form>
        <p>Already have an account? <a href="#" onclick="showSignIn()">Sign In</a></p>
    `;

    document.getElementById('signUpForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const newEmail = document.getElementById('newEmail').value;
        const newPassword = document.getElementById('newPassword').value;
        const users = JSON.parse(localStorage.getItem('users')) || [];

        if (users.some(user => user.email === newEmail)) {
            alert('Email already exists');
        } else {
            users.push({ email: newEmail, password: newPassword });
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify({ email: newEmail }));
            showSignIn();
        }
    });
}

// Show Dashboard
function showDashboard() {
    if (!isLoggedIn()) {
        showSignIn();
        return;
    }

    currentUser = getLoggedInUser();
    const content = document.getElementById('content');
    content.innerHTML = `
        <header>
            <h1>Cuisine Compass</h1>
        </header>
        <h2>Welcome, ${currentUser.email}!</h2>
        <button onclick="toggleDarkMode()">Toggle Dark Mode</button>
        <form id="recipeSearchForm">
            <label for="ingredients">Enter ingredients:</label>
            <input type="text" id="ingredients" required>
            <button type="submit">Search</button>
        </form>
        <h2>Recipes</h2>
        <div id="loading" style="display:none;">Loading...</div>
        <select id="filter">
            <option value="">Sort by</option>
            <option value="calories">Calories</option>
            <option value="time">Cooking Time</option>
        </select>
        <ul id="recipeList"></ul>
        <h2>Saved Recipes</h2>
        <ul id="savedRecipes"></ul>
        <h2>Grocery List</h2>
        <ul id="groceryList"></ul>
        <button onclick="saveGroceryList()">Save Grocery List</button>
        <button id="logoutButton" onclick="logout()">Logout</button>
    `;
    document.getElementById('recipeSearchForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const ingredients = document.getElementById('ingredients').value;
        fetchRecipes(ingredients);
    });

    document.getElementById('filter').addEventListener('change', applySorting);

    loadSavedRecipes();
}

// Logout function
function logout() {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('currentUser');
    showSignIn();
}

// Fetch recipes
function fetchRecipes(ingredients) {
    if (!navigator.onLine) {
        alert("You are offline. This recipe requires an internet connection.");
        return;
    }
    const userAgent = 'CuisineCompass - Version 1.0';
    const url = `https://world.openfoodfacts.org/cgi/search.pl?action=process&tagtype_0=ingredients&tag_contains_0=contains&tag_0=${ingredients}&json=true`;

    document.getElementById('loading').style.display = 'block';

    fetch(url, { headers: { 'User-Agent': userAgent } })
        .then(response => response.json())
        .then(data => {
            document.getElementById('loading').style.display = 'none';
            displayRecipes(data.products);
        })
        .catch(() => {
            document.getElementById('loading').style.display = 'none';
            alert('Error fetching recipes');
        });
}

// Display recipes
function displayRecipes(products) {
    const recipeList = document.getElementById('recipeList');
    recipeList.innerHTML = '';

    if (products.length === 0) {
        recipeList.innerHTML = '<li>No recipes found.</li>';
        return;
    }

    products.forEach(product => {
        const li = document.createElement('li');
        const ingredients = product.ingredients_text || "No ingredients listed";
        li.innerHTML = `
            <h3><a href="${product.url}" target="_blank">${product.product_name || "Unknown Recipe"}</a></h3>
            <p><strong>Ingredients:</strong> ${ingredients.length > 100 ? ingredients.substring(0, 100) + '... <a href="' + product.url + '" target="_blank">read more</a>' : ingredients}</p>
            <button onclick="saveRecipe('${product.product_name}', '${product.url}')">Save</button>
            <button onclick="addToGroceryList('${ingredients}')">Add to Grocery List</button>
        `;
        recipeList.appendChild(li);
    });
}

// Save recipe
function saveRecipe(recipeName, recipeUrl) {
    const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes')) || [];
    if (!savedRecipes.some(recipe => recipe.name === recipeName)) {
        savedRecipes.push({ name: recipeName, url: recipeUrl });
        localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
        loadSavedRecipes();
        alert('Recipe saved!');
    } else {
        alert('Recipe already saved.');
    }
}

// Load saved recipes
function loadSavedRecipes() {
    const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes')) || [];
    const savedList = document.getElementById('savedRecipes');
    savedList.innerHTML = '';

    savedRecipes.forEach(recipe => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${recipe.url}" target="_blank">${recipe.name}</a> <button onclick="removeSavedRecipe('${recipe.name}')">Remove</button>`;
        savedList.appendChild(li);
    });
}

// Remove saved recipe
function removeSavedRecipe(recipeName) {
    let savedRecipes = JSON.parse(localStorage.getItem('savedRecipes')) || [];
    savedRecipes = savedRecipes.filter(recipe => recipe.name !== recipeName);
    localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
    loadSavedRecipes();
}

// Add to grocery list
function addToGroceryList(ingredients) {
    const groceryList = document.getElementById('groceryList');
    const li = document.createElement('li');
    li.textContent = ingredients;
    groceryList.appendChild(li);
}

// Save grocery list
function saveGroceryList() {
    const groceryList = document.getElementById('groceryList').innerText;
    const blob = new Blob([groceryList], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'grocery-list.txt';
    a.click();
}

// Toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

// Initialize the app
if (isLoggedIn()) {
    showDashboard();
} else {
    showSignIn();
}

//JavaScript Snippet to Check for Updates
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('//JavaScript Snippet to Check for Updates
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('https://drkimogad.github.io/CuisineCompass/service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
                // Check for service worker updates
                registration.update();

                // Listen for when a new service worker is available and update it
                registration.addEventListener('updatefound', () => {
                    const installingWorker = registration.installing;
                    installingWorker.addEventListener('statechange', () => {
                        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New version available, notify user and skip waiting
                            if (confirm('A new version of the app is available. Would you like to update?')) {
                                installingWorker.postMessage({ action: 'skipWaiting' });
                            }
                        }
                    });
                });
            })
            .catch((error) => {
                console.error('Error registering service worker:', error);
            });
    });
}')
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
                // Check for service worker updates
                registration.update();

                // Listen for when a new service worker is available and update it
                registration.addEventListener('updatefound', () => {
                    const installingWorker = registration.installing;
                    installingWorker.addEventListener('statechange', () => {
                        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New version available, notify user and skip waiting
                            if (confirm('A new version of the app is available. Would you like to update?')) {
                                installingWorker.postMessage({ action: 'skipWaiting' });
                            }
                        }
                    });
                });
            })
            .catch((error) => {
                console.error('Error registering service worker:', error);
            });
    });
}

