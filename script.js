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
        <h1>Sign In</h1>
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
        <h1>Sign Up</h1>
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
        <h1>Recipe Finder</h1>
        <p>Welcome, ${currentUser.email}!</p>
        <button onclick="logout()">Logout</button>
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
    const userAgent = 'RecipeFinderApp - Version 1.0';
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
        li.innerHTML = `
            <h3>${product.product_name || "Unknown Recipe"}</h3>
            <p><strong>Ingredients:</strong> ${product.ingredients_text || "No ingredients listed"}</p>
            <button onclick="saveRecipe('${product.product_name}')">Save</button>
            <button onclick="addToGroceryList('${product.ingredients_text}')">Add to Grocery List</button>
        `;
        recipeList.appendChild(li);
    });
}

// Save recipe
function saveRecipe(recipeName) {
    const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes')) || [];
    if (!savedRecipes.includes(recipeName)) {
        savedRecipes.push(recipeName);
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
        li.innerHTML = `${recipe} <button onclick="removeSavedRecipe('${recipe}')">Remove</button>`;
        savedList.appendChild(li);
    });
}

// Remove saved recipe
function removeSavedRecipe(recipeName) {
    let savedRecipes = JSON.parse(localStorage.getItem('savedRecipes')) || [];
    savedRecipes = savedRecipes.filter(recipe => recipe !== recipeName);
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
