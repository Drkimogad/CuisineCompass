let currentUser = null; // For keeping track of logged-in user

// Helper functions for login state
function isLoggedIn() {
    return localStorage.getItem('loggedIn') === 'true';
}

function getLoggedInUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Render Sign-In page
function showSignIn() {
    const content = document.getElementById('content');
    content.innerHTML = 
        <h1>Sign In</h1>
        <form id="signInForm">
            <label for="email">Email:</label>
            <input type="email" id="email" required>
            <label for="password">Password:</label>
            <input type="password" id="password" required>
            <button type="submit">Sign In</button>
        </form>
        <p>Don't have an account? <a href="#" onclick="showSignUp()">Sign Up</a></p>
    ;

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

// Render Sign-Up page
function showSignUp() {
    const content = document.getElementById('content');
    content.innerHTML = 
        <h1>Sign Up</h1>
        <form id="signUpForm">
            <label for="newEmail">Email:</label>
            <input type="email" id="newEmail" required>
            <label for="newPassword">Password:</label>
            <input type="password" id="newPassword" required>
            <button type="submit">Sign Up</button>
        </form>
        <p>Already have an account? <a href="#" onclick="showSignIn()">Sign In</a></p>
    ;

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

// Render the Dashboard (Recipe Finder)
function showDashboard() {
    if (!isLoggedIn()) {
        showSignIn();
        return;
    }

    currentUser = getLoggedInUser();
    const content = document.getElementById('content');
    content.innerHTML = 
        <h1>Recipe Finder</h1>
        <form id="recipeSearchForm">
            <label for="ingredients">Enter ingredients:</label>
            <input type="text" id="ingredients" required>
            <button type="submit">Search</button>
        </form>
        <h2>Recipes</h2>
        <ul id="recipeList"></ul>
    ;

    document.getElementById('recipeSearchForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const ingredients = document.getElementById('ingredients').value;
        fetchRecipes(ingredients);
    });
}

// Fetch r3cipe function 
function fetchRecipes(ingredients) {
    const userAgent = 'RecipeFinderApp - Version 1.0 - www.yourappwebsite.com'; // Replace with your app details
    const url = https://world.openfoodfacts.org/cgi/search.pl?action=process&tagtype_0=ingredients&tag_contains_0=contains&tag_0=${ingredients}&json=true;

    fetch(url, {
        headers: {
            'User-Agent': userAgent
        }
    })
    .then(response => response.json())
    .then(data => {
        displayRecipes(data.products);
    })
    .catch(error => {
        alert('Error fetching recipes');
    });
}

function displayRecipes(products) {
    const recipeList = document.getElementById('recipeList');
    recipeList.innerHTML = '';

    if (products.length === 0) {
        recipeList.innerHTML = '<li>No recipes found for the given ingredients.</li>';
        return;
    }

    products.forEach(product => {
        const li = document.createElement('li');
        li.classList.add('recipe-item');
        li.innerHTML = 
            <h3>${product.product_name}</h3>
            <p><strong>Ingredients:</strong> ${product.ingredients_text}</p>
            <button class="save" onclick="saveRecipe(${product.code})">Save</button>
        ;
        recipeList.appendChild(li);
    });
}

// Display the fetched recipes
function displayRecipes(recipes) {
    const recipeList = document.getElementById('recipeList');
    recipeList.innerHTML = '';

    if (recipes.length === 0) {
        recipeList.innerHTML = '<li>No recipes found for the given ingredients.</li>';
        return;
    }

    recipes.forEach(recipe => {
        const li = document.createElement('li');
        li.classList.add('recipe-item');
        li.innerHTML = 
            <h3>${recipe.title}</h3>
            <p><strong>Ingredients:</strong> ${recipe.ingredients.join(', ')}</p>
            <button class="save" onclick="saveRecipe(${recipe.id})">Save</button>
        ;
        recipeList.appendChild(li);
    });
}

// Save a recipe (optional)
function saveRecipe(recipeId) {
    const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes')) || [];
    if (!savedRecipes.includes(recipeId)) {
        savedRecipes.push(recipeId);
        localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
        alert('Recipe saved!');
    } else {
        alert('Recipe already saved.');
    }
}

// Initialize the app
if (isLoggedIn()) {
    showDashboard();
} else {
    showSignIn();
}
