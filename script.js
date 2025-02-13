let currentUser = null;

// Helper functions for login state
function isLoggedIn() {
    return localStorage.getItem('loggedIn') === 'true';
}

function getLoggedInUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Hash password using SHA-256
function hashPassword(password) {
    return CryptoJS.SHA256(password).toString();
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
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!email || !password) {
            alert('Please fill in all fields.');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(user => user.email === email && user.password === hashPassword(password));

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
        const newEmail = document.getElementById('newEmail').value.trim();
        const newPassword = document.getElementById('newPassword').value.trim();

        if (!newEmail || !newPassword) {
            alert('Please fill in all fields.');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];

        if (users.some(user => user.email === newEmail)) {
            alert('Email already exists');
        } else {
            users.push({ email: newEmail, password: hashPassword(newPassword) });
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
        <ul id="recipeList"></ul>
        <h2>Saved Recipes</h2>
        <ul id="savedRecipes"></ul>
        <h2>Grocery List</h2>
        <ul id="groceryList"></ul>
        <button onclick="saveGroceryList()">Save Grocery List</button>
        <button id="logoutButton">Logout</button>
    `;

    // Add event listener for the logout button
    document.getElementById('logoutButton').addEventListener('click', logout);

    // Add event listener for the recipe search form
    document.getElementById('recipeSearchForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const ingredients = document.getElementById('ingredients').value.trim();

        if (!ingredients) {
            alert('Please enter ingredients.');
            return;
        }

        fetchRecipes(ingredients);
    });

    loadSavedRecipes();
    loadGroceryList();
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
        alert("You are offline. Please check your internet connection and try again.");
        return;
    }

    const userAgent = 'CuisineCompass';
    const url = `https://world.openfoodfacts.org/cgi/search.pl?action=process&tagtype_0=ingredients&tag_contains_0=contains&tag_0=${ingredients}&json=true`;

    document.getElementById('loading').style.display = 'block';

    fetch(url, { headers: { 'User-Agent': userAgent } })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('loading').style.display = 'none';
            displayRecipes(data.products);
        })
        .catch(() => {
            document.getElementById('loading').style.display = 'none';
            alert('Error fetching recipes. Please try again later.');
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
    li.innerHTML = `${ingredients} <button onclick="removeFromGroceryList(this, '${ingredients}')">Remove</button>`;
    groceryList.appendChild(li);

    // Save to local storage
    const savedList = JSON.parse(localStorage.getItem('groceryList')) || [];
    if (!savedList.includes(ingredients)) {
        savedList.push(ingredients);
        localStorage.setItem('groceryList', JSON.stringify(savedList));
    } else {
        alert('Ingredient already in grocery list');
    }
}

// Remove from grocery list
function removeFromGroceryList(button, ingredients) {
    const li = button.parentElement;
    li.remove();

    // Remove from local storage
    const savedList = JSON.parse(localStorage.getItem('groceryList')) || [];
    const updatedList = savedList.filter(item => item !== ingredients);
    localStorage.setItem('groceryList', JSON.stringify(updatedList));
}

// Load grocery list on page load
function loadGroceryList() {
    const savedList = JSON.parse(localStorage.getItem('groceryList')) || [];
    const groceryList = document.getElementById('groceryList');
    groceryList.innerHTML = ''; // Clear existing list to avoid duplication
    savedList.forEach(ingredients => {
        const li = document.createElement('li');
        li.innerHTML = `${ingredients} <button onclick="removeFromGroceryList(this, '${ingredients}')">Remove</button>`;
        groceryList.appendChild(li);
    });
}

// Call loadGroceryList on page load
window.onload = function() {
    loadGroceryList(); // Load grocery list on page load
    if (isLoggedIn()) {
        showDashboard();
    } else {
        showSignIn();
    }
};

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
