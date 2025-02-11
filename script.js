let currentUser = null;

// Helper functions for login state
function isLoggedIn() {
    return localStorage.getItem('loggedIn') === 'true';
}

function getLoggedInUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Render dynamic content
function render(content) {
    document.getElementById('content').innerHTML = content;
}

function showSignIn() {
    render(`
        <h1>Sign In</h1>
        <form id="signInForm">
            <label for="email">Email:</label>
            <input type="email" id="email" required>
            <label for="password">Password:</label>
            <input type="password" id="password" required>
            <button type="submit">Sign In</button>
        </form>
        <p>Don't have an account? <a href="#" onclick="showSignUp()">Sign Up</a></p>
    `);
    
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

function showSignUp() {
    render(`
        <h1>Sign Up</h1>
        <form id="signUpForm">
            <label for="newEmail">Email:</label>
            <input type="email" id="newEmail" required>
            <label for="newPassword">Password:</label>
            <input type="password" id="newPassword" required>
            <button type="submit">Sign Up</button>
        </form>
        <p>Already have an account? <a href="#" onclick="showSignIn()">Sign In</a></p>
    `);
    
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
            localStorage.setItem('currentUser', JSON.stringify({ email: newEmail }));
            showSignIn();
        }
    });
}

function showDashboard() {
    if (!isLoggedIn()) {
        showSignIn();
        return;
    }

    currentUser = getLoggedInUser();
    render(`
        <h1>Recipe Finder</h1>
        <button onclick="logout()">Sign Out</button>
        <form id="recipeSearchForm">
            <label for="ingredients">Enter ingredients:</label>
            <input type="text" id="ingredients" required>
            <button type="submit">Search</button>
        </form>
        <h2>Recipes</h2>
        <ul id="recipeList"></ul>
        <h2>Saved Recipes</h2>
        <ul id="savedRecipesList"></ul>
    `);

    document.getElementById('recipeSearchForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const ingredients = document.getElementById('ingredients').value;
        fetchRecipes(ingredients);
    });

    loadSavedRecipes();
}

function fetchRecipes(ingredients) {
    const userAgent = 'RecipeFinderApp - Version 1.0 - https://drkimogad.github.io/RecipeFinderApp; // Replace with your app details
    const url = `https://world.openfoodfacts.org/cgi/search.pl?action=process&tagtype_0=ingredients&tag_contains_0=contains&tag_0=${ingredients}&json=true`;
    fetch(url)
    .then(response => response.json())
    .then(data => {
        displayRecipes(data);
    })
    .catch(() => {
        alert('Error fetching recipes');
    });
}

function displayRecipes(recipes) {
    const recipeList = document.getElementById('recipeList');
    recipeList.innerHTML = '';

    if (recipes.length === 0) {
        recipeList.innerHTML = '<li>No recipes found.</li>';
        return;
    }

    recipes.forEach(recipe => {
        const li = document.createElement('li');
        li.innerHTML = `
            <h3>${recipe.title}</h3>
            <button onclick='saveRecipe(${JSON.stringify(recipe)})'>Save</button>
        `;
        recipeList.appendChild(li);
    });
}

function saveRecipe(recipe) {
    let savedRecipes = JSON.parse(localStorage.getItem('savedRecipes')) || [];
    if (!savedRecipes.some(r => r.id === recipe.id)) {
        savedRecipes.push(recipe);
        localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
        alert('Recipe saved!');
        loadSavedRecipes();
    } else {
        alert('Recipe already saved.');
    }
}

function loadSavedRecipes() {
    const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes')) || [];
    const savedRecipesList = document.getElementById('savedRecipesList');
    savedRecipesList.innerHTML = '';

    if (savedRecipes.length === 0) {
        savedRecipesList.innerHTML = '<li>No saved recipes.</li>';
        return;
    }

    savedRecipes.forEach(recipe => {
        const li = document.createElement('li');
        li.innerHTML = `
            <h3>${recipe.title}</h3>
            <button onclick='removeRecipe(${recipe.id})'>Remove</button>
        `;
        savedRecipesList.appendChild(li);
    });
}

function removeRecipe(recipeId) {
    let savedRecipes = JSON.parse(localStorage.getItem('savedRecipes')) || [];
    savedRecipes = savedRecipes.filter(recipe => recipe.id !== recipeId);
    localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
    loadSavedRecipes();
}

function logout() {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('currentUser');
    showSignIn();
}

if (isLoggedIn()) {
    showDashboard();
} else {
    showSignIn();
}
