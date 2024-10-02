express = require("express");
mongoose = require("mongoose");
cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://admin:Zo6qEY0qWfz8mgwS@cluster0.jcf9cyx.mongodb.net/db",
);
const db = mongoose.connection;
if (db) {
  console.log("Connected to MongoDB");
}
db.on("error", (error) => console.error(error));

// Enable CORS
app.use(cors());
// Enable JSON body parsing
app.use(express.json());

//User schema
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: String,
    gender: String,
    age: Number,
    height: Number,
    weight: Number,
    activity: Number,
    calories: Number,
  },
  { collection: "users" },
);
const User = mongoose.model("User", userSchema);

// Route for user registration
app.post("/api/register", async (req, res) => {
  const { email, name } = req.body;
  console.log("Registering with info: ", req.body);

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // check if user measurements are already in database
      if (
        existingUser.name &&
        existingUser.gender &&
        existingUser.age &&
        existingUser.height &&
        existingUser.weight &&
        existingUser.activity &&
        existingUser.calories
      ) {
        return res.json({ message: "User already exists" });
      } else {
        return res.json({ message: "Update measurements" });
      }
    }

    // Create a new user
    const newUser = new User({ email, name });
    await newUser.save();

    res.json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.json({ message: "Internal Server Error" });
  }
});

// Route for getting user measurements
app.post("/api/getMeasurements", async (req, res) => {
  const { email } = req.body;
  console.log("Getting measurements for: ", email);
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ message: "User not found" });
  }
  res.json(user);
});

// Route for updating user measurements
app.post("/api/updateMeasurements", async (req, res) => {
  const { email, gender, age, height, weight, activity, calories } = req.body;
  console.log("Updating measurements: ", req.body);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      //register user if not found
      const user = new User({ email });
      user.gender = gender;
      user.age = age;
      user.height = height;
      user.weight = weight;
      user.activity = activity;
      user.calories = calories;
      await user.save();
      return res.json({ message: "New user registered" });
    }
    user.gender = gender;
    user.age = age;
    user.height = height;
    user.weight = weight;
    user.activity = activity;
    user.calories = calories;
    await user.save();
    res.json({ message: "Measurements updated successfully" });
  } catch (error) {
    console.error(error);
    res.json({ message: "Internal Server Error" });
  }
});

//Ingredient schema
const ingredientSchema = new mongoose.Schema({
  name: String,
  amount: String,
  calories: Number,
  carbs: Number,
  protein: Number,
  fat: Number,
});
const Ingredient = mongoose.model("Ingredient", ingredientSchema);

//Meal schema
const mealSchema = new mongoose.Schema({
  id: Number,
  meal: String,
  image: String,
  name: String,
  ingredients: [ingredientSchema],
});
const Meal = mongoose.model("Meal", mealSchema);

//UserMeal schema
const userMealSchema = new mongoose.Schema({
  email: { type: String, required: true },
  date: { type: String, required: true },
  meal: { type: mealSchema, required: true },
});
const UserMeal = mongoose.model("UserMeal", userMealSchema);

// Route for getting user meals
app.post("/api/getMeals", async (req, res) => {
  const { email, date } = req.body;
  console.log("Getting meals for: ", email);
  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "User not found" });
    }    
    // Get meals for the user on the given date
    const meals = await UserMeal.find({ email, date });    
    if (!meals) {      
      return res.json({ message: "No meals found" });
    }
    res.json(meals);
  } catch (error) {
    console.error(error);
    res.json({ message: "Internal Server Error" });
  }
});

// Route for getting user meals by date
app.post("/api/getMealsByDate", async (req, res) => {
  const { email, dates } = req.body;
  console.log("Getting meals for: ", email);
  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "User not found" });
    }
    const meals = await UserMeal.find({ email, date: { $in: dates } });
    if (!meals) {
      return res.json({ message: "No meals found" });
    }
    res.json(meals);
  } catch (error) {
    console.error(error);
    res.json({ message: "Internal Server Error" });
  }
});

// Route for adding a meal
app.post("/api/addMeal", async (req, res) => {
  const { email, date, meal } = req.body;
  console.log("Adding meal for: ", email);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "User not found" });
    }

    const existMeal = await UserMeal.findOne({ email, date, meal });
    if (existMeal) {
      return res.json({ message: "Meal already exists" });
    }
    // Get meal id
    const meals = await UserMeal.find({ email, date });
    meal.id = meals.length + 1;
    // Create a new meal
    const newMeal = new UserMeal({ email, date, meal });
    newMeal.meal.id = meal.id;
    newMeal.save();
    res.json({ message: "Meal saved successfully" });
  } catch (error) {
    console.error(error);
    res.json({ message: "Internal Server Error" });
  }
});

// Route for deleting a meal
app.post("/api/deleteMeal", async (req, res) => {
  const { email, date, meal } = req.body;
  console.log("Deleting meal for: ", email);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "User not found" });
    }
    const existMeal = await UserMeal.findOne({ email, date, meal });
    if (!existMeal) {
      return res.json({ message: "Meal not found" });
    }
    await UserMeal.deleteOne(existMeal);
    res.json({ message: "Meal deleted successfully" });
    //update meal ids
    let deletedID = existMeal.meal.id;
    let meals = await UserMeal.find({ email, date });
    for (let i = 0; i < meals.length; i++) {
      if (meals[i].meal.id > deletedID) {
        meals[i].meal.id = meals[i].meal.id - 1;
        await meals[i].save();
      }
    }
  } catch (error) {
    console.error(error);
    res.json({ message: "Internal Server Error" });
  }
});

//UserStats schema
const userStatsSchema = new mongoose.Schema({
  email: { type: String, required: true },
  date: { type: String, required: true },
  weight: Number,
  calories: Number,
  steps: Number,
  exercise: Number,
  water: Number,
});
const UserStats = mongoose.model("UserStat", userStatsSchema);

// Route for setting / updating user stats
app.post("/api/saveStats", async (req, res) => {
  const { email, date, weight, calories, steps, water, exercise, currentDate } = req.body;
  console.log("Setting stats for: ", email);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "User not found" });
    }
    if(currentDate && (weight > 0)){
      user.weight = weight;
      await user.save();
    }
    const stats = await UserStats.findOne({ email, date });
    if (stats) {
      stats.weight = weight;
      stats.calories = calories;
      stats.steps = steps;
      stats.water = water;
      stats.exercise = exercise;
      await stats.save();      
      return res.json({ message: "Stats updated" });
    }
    const newStats = new UserStats({
      email,
      date,
      weight,
      calories,
      steps,
      water,
      exercise,
    });
    await newStats.save();
    res.json({ message: "Stats saved successfully" });
  } catch (error) {
    console.error(error);
    res.json({ message: "Internal Server Error" });
  }
});

// Route for getting user stats
app.post("/api/getStats", async (req, res) => {
  const { email, date } = req.body;
  console.log("Getting stats for: ", email);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "User not found" });
    }
    const stats = await UserStats.findOne({ email, date });
    if (!stats) {
      return res.json({ message: "Stats not found" });
    }
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.json({ message: "Internal Server Error" });
  }
});

function formatDate(date) {
  let d = date;
  let day = d.getDate();
  let month = d.getMonth() + 1;
  let year = d.getFullYear();
  let formattedDate = day + "/" + month + "/" + year;
  return formattedDate;
}

// Route for getting weekly stats for graphs
app.post("/api/getStatsByDate", async (req, res) => {
  const { email, dates } = req.body;
  console.log("Getting weekly stats for: ", email);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "User not found" });
    }    
    const stats = await UserStats.find({ email, date: { $in: dates }});
    if (!stats) {
      return res.json({ message: "Stats not found" });
    }
    res.json(stats);      
  } catch (error) {
    console.error(error);
    res.json({ message: "Internal Server Error" });
  }  
});

//UserRecipe schema
const recipeSchema = {
  email: String,
  name: String,
  ingredients: [ingredientSchema],
  instructions: String,
  image: String,
  cookingTime: Number,
};
const UserRecipe = mongoose.model("UserRecipe", recipeSchema);
const CommunityRecipe = mongoose.model("CommunityRecipe", recipeSchema);

//Get user recipe count
app.post("/api/getRecipeCounts", async (req, res) => {
  const { email } = req.body;
  console.log("Getting recipes counts for: ", email);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "User not found" });
    }
    const recipes = await UserRecipe.find({ email });
    const communityRecipes = await CommunityRecipe.countDocuments();
    console.log(
      "User recipes: ",
      recipes.length,
      "Community recipes: ",
      communityRecipes,
    );
    res.json({ user: recipes.length, community: communityRecipes });
  } catch (error) {
    console.error(error);
    res.json({ message: "Internal Server Error" });
  }
});

//Get user recipes
app.post("/api/getUserRecipes", async (req, res) => {
  const { email } = req.body;
  console.log("Getting user recipes for: ", email);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "User not found" });
    }
    const recipes = await UserRecipe.find({ email });
    res.json(recipes);
  } catch (error) {
    console.error(error);
    res.json({ message: "Internal Server Error" });
  }
});

//Set user recipe
app.post("/api/saveUserRecipe", async (req, res) => {
  const { _id, email, name, ingredients, instructions, image, cookingTime, community } = req.body;
  console.log("Saving recipe for: ", email);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "User not found" });
    }
    if (community) {
      console.log("Saving to community for: ", email);      
      const existCommunityRecipe = await CommunityRecipe.findOne({ email, name, ingredients, instructions, image, cookingTime });
      if (existCommunityRecipe) {
        console.log("Recipe already exists in community");
      }      
      else {
        const newCommunityRecipe = new CommunityRecipe({
          email,
          name,
          ingredients,
          instructions,
          image,
          cookingTime,
        });
        await newCommunityRecipe.save();
        //delete old recipe if _id is present
        if (_id) {
          const recipe = await CommunityRecipe.findOne({ _id });
          if(recipe){
            console.log("Deleting old community recipe: ", recipe);
            await CommunityRecipe.deleteOne(recipe);
          }        
        }      
        console.log("Community recipe saved successfully");
      }
    }
    const recipe = await UserRecipe.findOne({
      email,
      name,
      ingredients,
      instructions,
      image,
      cookingTime,
    });
    if (recipe) {
      return res.json({ message: "Recipe already exists" });
    }
    const newRecipe = new UserRecipe({
      email,
      name,
      ingredients,
      instructions,
      image,
      cookingTime,
    });
    await newRecipe.save();
    //delete old recipe if _id is present
    if (_id) {
      const recipe = await UserRecipe.findOne({ _id });
      await UserRecipe.deleteOne(recipe);
    }
    res.json({ message: "Recipe saved successfully" });
  } catch (error) {
    console.error(error);
    res.json({ message: "Internal Server Error" });
  }
});

//Delete user recipe
app.post("/api/deleteUserRecipe", async (req, res) => {
  const { email, name, ingredients, instructions, image, cookingTime } = req.body;
  console.log("Deleting recipe for: ", email);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "User not found" });
    }
    const recipe = await UserRecipe.findOne({
      email,
      name,
      ingredients,
      instructions,
      image,
      cookingTime,
    });
    const communityRecipe = await CommunityRecipe.findOne({
      email,
      name,
      ingredients,
      instructions,
      image,
      cookingTime,
    });
    if (!recipe) {
      return res.json({ message: "Recipe not found" });
    }    
    await UserRecipe.deleteOne(recipe);
    if (communityRecipe) {
      await CommunityRecipe.deleteOne(communityRecipe);
    }
    res.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error(error);
    res.json({ message: "Internal Server Error" });
  }
});

//get community recipes
app.get("/api/getCommunityRecipes", async (req, res) => {
  console.log("Getting community recipes");
  try {
    const recipes = await CommunityRecipe.find();
    res.json(recipes);
  } catch (error) {
    console.error(error);
    res.json({ message: "Internal Server Error" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
