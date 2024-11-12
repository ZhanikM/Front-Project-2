// API ключ
const apiKey = '7956fd3d7327430cb0598b76ee5d31ed';

// Функция для получения списка рецептов по запросу
async function fetchRecipes(query) {
    const url = `https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.results;
}

// Функция для получения подробной информации о рецепте по ID
async function getRecipeDetails(recipeId) {
    const url = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

async function displayRecipes(recipes) {
    const resultsContainer = document.getElementById("results-container");
    resultsContainer.innerHTML = ""; 

    for (const recipe of recipes) {
        const recipeDetails = await getRecipeDetails(recipe.id);

        const recipeCard = document.createElement("div");
        recipeCard.classList.add("recipe-card");

        const recipeImage = document.createElement("img");
        recipeImage.src = recipe.image;
        recipeImage.alt = recipe.title;

        const recipeInfo = document.createElement("div");
        recipeInfo.classList.add("recipe-details");

        const title = document.createElement("h3");
        title.textContent = recipe.title;

        const prepTime = document.createElement("p");
        prepTime.textContent = `Preparation time: ${recipeDetails.readyInMinutes || "N/A"} mins`;

        const servings = document.createElement("p");
        servings.textContent = `Servings: ${recipeDetails.servings || "N/A"}`;

        recipeInfo.appendChild(title);
        recipeInfo.appendChild(prepTime);
        recipeInfo.appendChild(servings);

        recipeCard.appendChild(recipeImage);
        recipeCard.appendChild(recipeInfo);

        recipeCard.addEventListener("click", () => openModal(recipeDetails));

        resultsContainer.appendChild(recipeCard);
    }
}

function openModal(recipe) {
    document.getElementById("modal-title").textContent = recipe.title;
    document.getElementById("modal-image").src = recipe.image;
    document.getElementById("modal-prep-time").textContent = `Preparation time: ${recipe.readyInMinutes || "N/A"} mins`;
    document.getElementById("modal-servings").textContent = `Servings: ${recipe.servings || "N/A"}`;

    const ingredientsList = document.getElementById("modal-ingredients");
    ingredientsList.innerHTML = "";
    recipe.extendedIngredients.forEach(ingredient => {
        const li = document.createElement("li");
        li.textContent = `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`;
        ingredientsList.appendChild(li);
    });

    const instructionsList = document.getElementById("modal-instructions");
    instructionsList.innerHTML = "";
    recipe.instructions.split("\n").forEach(step => {
        const li = document.createElement("li");
        li.textContent = step;
        instructionsList.appendChild(li);
    });

    const nutritionalInfo = document.getElementById("modal-nutritional-info");
    if (recipe.nutrition && recipe.nutrition.nutrients && recipe.nutrition.nutrients.length > 0) {
        const calories = recipe.nutrition.nutrients.find(nutrient => nutrient.title === 'Calories');
        const protein = recipe.nutrition.nutrients.find(nutrient => nutrient.title === 'Protein');
        const fat = recipe.nutrition.nutrients.find(nutrient => nutrient.title === 'Fat');

        nutritionalInfo.textContent = `Calories: ${calories ? calories.amount : 'N/A'} kcal, Protein: ${protein ? protein.amount : 'N/A'} g, Fat: ${fat ? fat.amount : 'N/A'} g`;
    } else {
        nutritionalInfo.textContent = 'Nutritional information not available.';
    }

    document.getElementById("modal-rating").textContent = `Average rating: ${recipe.spoonacularScore || 'N/A'}`;

    document.getElementById("recipe-modal").style.display = "block";
}

document.addEventListener("DOMContentLoaded", () => {
    const closeButton = document.querySelector(".close");
    if (closeButton) {
        closeButton.addEventListener("click", () => {
            document.getElementById("recipe-modal").style.display = "none";
        });
    }

    window.onclick = function(event) {
        const modal = document.getElementById("recipe-modal");
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };

    document.getElementById("search-button").addEventListener("click", async () => {
        const query = document.getElementById("search-input").value;
        if (query) {
            const recipes = await fetchRecipes(query);
            displayRecipes(recipes);
        }
    });

    document.getElementById("search-input").addEventListener("input", (e) => {
        const query = e.target.value.trim();
        if (query.length > 2) {
            fetchRecipes(query).then(updateRecipeSuggestions);
        } else {
            document.querySelector(".suggestions").style.display = "none";
        }
    });
});

function updateRecipeSuggestions(recipes) {
    const suggestionsBox = document.querySelector(".suggestions");
    suggestionsBox.innerHTML = "";

    recipes.forEach(recipe => {
        const suggestion = document.createElement("div");
        suggestion.classList.add("suggestion-item");
        suggestion.textContent = recipe.title;

        suggestion.addEventListener("click", () => {
            document.getElementById("search-input").value = recipe.title;
            displayRecipes([recipe]); 
            suggestionsBox.style.display = "none"; 
        });

        suggestionsBox.appendChild(suggestion);
    });

    suggestionsBox.style.display = "block"; 
}

document.addEventListener("click", (event) => {
    const suggestionsBox = document.querySelector(".suggestions");
    const searchInput = document.getElementById("search-input");

    if (!suggestionsBox.contains(event.target) && event.target !== searchInput) {
        suggestionsBox.style.display = "none";
    }
});
