/* General styles */
body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f9;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

#content {
    background-color: #fff;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
    text-align: center;
}

h1 {
    color: #333;
    margin-bottom: 1.5rem;
}

form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

label {
    font-weight: bold;
    color: #555;
    text-align: left;
}

input {
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
}

button {
    padding: 0.75rem;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

button:hover {
    background-color: #0056b3;
}

a {
    color: #007bff;
    text-decoration: none;
    cursor: pointer;
}

a:hover {
    text-decoration: underline;
}

p {
    margin-top: 1rem;
    color: #666;
}

/* Dashboard styles */
#recipeSearchForm {
    margin-bottom: 2rem;
}

#recipeList, #savedRecipesList {
    list-style-type: none;
    padding: 0;
    margin: 0;
}

#recipeList li, #savedRecipesList li {
    background-color: #f9f9f9;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

#recipeList h3, #savedRecipesList h3 {
    margin: 0;
    color: #333;
}

#recipeList button, #savedRecipesList button {
    background-color: #28a745;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
}

#recipeList button:hover, #savedRecipesList button:hover {
    background-color: #218838;
}

/* Logout button */
button[onclick="logout()"] {
    background-color: #dc3545;
    margin-bottom: 1rem;
}

button[onclick="logout()"]:hover {
    background-color: #c82333;
}

/* Responsive design */
@media (max-width: 480px) {
    #content {
        padding: 1rem;
    }

    h1 {
        font-size: 1.5rem;
    }

    input, button {
        font-size: 0.875rem;
    }
    }
