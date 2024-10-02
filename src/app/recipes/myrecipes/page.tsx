"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import RecipeCard from "@/components/Cards/RecipeCard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import Loader from "@/components/common/Loader";
import { use, useState } from "react";
import DatePickerOne from "@/components/FormElements/DatePicker/DatePickerOne";
import { set } from "mongoose";
import SwitcherThree from "@/components/Switchers/SwitcherThree";

interface Ingredient {
  name: string;
  amount: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

interface Recipe {
  _id?: string;
  email: string;
  name: string;
  ingredients: Ingredient[];
  instructions: string;
  image: string;
  cookingTime: number;
}

interface MealData {
  id: number;
  meal: string;
  image?: string;
  name?: string;
  ingredients?: Ingredient[];
}

const MyRecipes = () => {
  // Get the user
  const { user, error, isLoading } = useUser();

  if (isLoading) return <Loader />;
  if (error) return <div>{error.message}</div>;

  //redirect to /api/auth/login if user is not authenticated
  if (!user) {
    const router = useRouter();
    router.push("/api/auth/login");
    return <Loader />;
  }

  // Load user's recipes
  const [userRecipes, setUserRecipes] = useState<[Recipe]>();
  const [userRecipesLoaded, setUserRecipesLoaded] = useState(false);

  function loadUserRecipes() {
    let input = {
      email: user?.email,
    };
    //api call to load meals
    fetch("http://localhost:5000/api/getUserRecipes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load meals");
        }
        return response.json();
      })
      .then((data) => {
        setUserRecipes(data);
        setUserRecipesLoaded(true);
      })
      .catch((error) => {
        console.error("Loading meals failed:", error);
      });
  }

  if (!userRecipesLoaded) {
    loadUserRecipes();
  }

  const [mealType, setMealType] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const handleDateSelect = (date: string) => {
    setSelectedDate(new Date(date));
  };

  const [showPopup, setShowPopup] = useState(false);
  const [selectedRecipe, setselectedRecipe] = useState<Recipe>();
  const [tempRecipe, setTempRecipe] = useState<Recipe>({
    email: "",
    name: "",
    ingredients: [],
    instructions: "",
    image: "",
    cookingTime: 0,
  });

  const handleAdd = (index: number) => {
    return () => {
      console.log("Add recipe", index);
      if (!userRecipes) return;
      setselectedRecipe(userRecipes[index]);
      setShowPopup(true);
    };
  };

  const handleMealPlannerAdd = () => {
    console.log("Add to meal planner", selectedRecipe);
    setShowPopup(false);
    SaveMeal();
  };

  function formatDate(date: Date) {
    let d = date;
    let day = d.getDate();
    let month = d.getMonth() + 1;
    let year = d.getFullYear();
    let formattedDate = day + "/" + month + "/" + year;
    return formattedDate;
  }

  function SaveMeal() {
    if (!user) return;
    if (!selectedRecipe) return;
    let mealData: MealData = {
      id: 0,
      name: selectedRecipe.name,
      meal: mealType,
      image: selectedRecipe.image,
      ingredients: selectedRecipe.ingredients,
    };

    let input = {
      email: user.email,
      date: formatDate(selectedDate),
      meal: mealData,
    };
    //api call to save meal
    fetch("http://localhost:5000/api/addMeal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to save meal");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data.message); // Log success message
      })
      .catch((error) => {
        console.error("Saving meal failed:", error);
      });
  }

  const [listView, setListView] = useState(true);
  const [editView, setEditView] = useState(false);

  const handleView = (index: number) => {
    return () => {
      if (!userRecipes) return;
      setselectedRecipe(userRecipes[index]);
      setListView(false);
    };
  };

  const handleDelete = (index: number) => {
    return () => {
      console.log("Delete recipe", index);
      if (!userRecipes) return;
      //email, name, ingredients, instructions, image, cookingTime
      let input = {
        email: user?.email,
        name: userRecipes[index].name,
        ingredients: userRecipes[index].ingredients,
        instructions: userRecipes[index].instructions,
        image: userRecipes[index].image,
        cookingTime: userRecipes[index].cookingTime,        
      };
      //api call to delete meal
      fetch("http://localhost:5000/api/deleteUserRecipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to delete recipe");
          }
          return response.json();
        })
        .then((data) => {
          console.log(data.message); // Log success message
          loadUserRecipes();
        })
        .catch((error) => {
          console.error("Deleting recipe failed:", error);
        });
    };
  }

  const handleBack = () => {
    setListView(true);
    setEditView(false);    
  };

  const handleEdit = () => {
    if(!selectedRecipe) return;
    setTempRecipe(selectedRecipe);
    setEditView(!editView);
  }

  const handleSave = () => {
    SaveNewRecipe();
    setEditView(false);
  }

  const handleRecipeChanges = (name : string, value : any) => {
    setTempRecipe({
      ...tempRecipe,
      [name]: value,
    });
    console.log(tempRecipe);
  }

  const handleRecipeMacroChanges = (name: any, value: any) => {
    const ingredients = tempRecipe.ingredients || [];
    if (!ingredients[0]) {
      ingredients[0] = {
        name: "",
        amount: "",
        calories: 0,
        carbs: 0,
        protein: 0,
        fat: 0,
      };
    }
    ingredients[0] = {
      ...ingredients[0],
      [name]: Number(value),
    };
    setTempRecipe({
      ...tempRecipe,
      ingredients: ingredients,
    });
    console.log(tempRecipe);
  }

  const handleRecipeIngredientChanges = (index: number, name: string, value: any) => {
    const ingredients = tempRecipe.ingredients || [];
    if (!ingredients[index]) {
      ingredients[index] = {
        name: "",
        amount: "",
        calories: 0,
        carbs: 0,
        protein: 0,
        fat: 0,
      };
    }
    ingredients[index] = {
      ...ingredients[index],
      [name]: value,
    };
    setTempRecipe({
      ...tempRecipe,
      ingredients: ingredients,
    });
    console.log(tempRecipe);
  }

  const [community, setCommunity] = useState(true); //switcher is opposite for some reason
  const handleSwitch = () => {
    console.log("start switch " + community);
    setCommunity(!community);
    console.log("end switch " + community);
  }

  function SaveNewRecipe() {
    if (!user) return;
    let input = {
      _id: tempRecipe._id,
      email: user?.email,
      name: tempRecipe.name,
      ingredients: tempRecipe.ingredients,
      instructions: tempRecipe.instructions,
      image: tempRecipe.image,
      cookingTime: tempRecipe.cookingTime,
      community: community,
    };
    console.log(input);
    //api call to save meal
    fetch("http://localhost:5000/api/saveUserRecipe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to save recipe");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data.message); // Log success message
      })
      .catch((error) => {
        console.error("Saving recipe failed:", error);
      });      
  }

  return (
    <DefaultLayout>
      <Breadcrumb pageName="My Recipes" subPage="Recipes" />
      {/* Search bar */}
      <div className="flex w-[100%] justify-between items-center">
        <div className="flex items-center gap-2 mr-2">
          {!listView && (
            <button
              className="rounded bg-danger px-4 py-2 text-white"
              onClick={handleBack}
            >
              Back
            </button>
          )}
          {!listView && !editView && (
            <button
              className="rounded bg-primary px-4 py-2 text-white"
              onClick={handleEdit}
            >
              Edit
            </button>
          )}       
          {!editView && (
          <Link href="/recipes/createrecipe">
            <button className="rounded bg-success px-4 py-2 text-white">
              New
            </button>
          </Link>        
          )}     
          {!listView && editView && (
            <button
              className="rounded bg-primary px-4 py-2 text-white"
              onClick={handleEdit}
            >
              Cancel
            </button>
          )}
          {!listView && editView && (
            <button
              className="rounded bg-success px-4 py-2 text-white"
              onClick={handleSave}
            >
              Save
            </button>
          )}
        </div>
        <input
          type="text"
          placeholder="Search for recipes"
          className="border-gray-300 h-12 w-96 rounded-md border px-4 focus:border-primary focus:outline-none focus:ring"
        />
      </div>
      {/* Recipes */}
      <div className="mt-10 flex flex-wrap gap-10 justify-center">
        {listView &&
          userRecipes &&
          userRecipes?.length > 0 &&
          userRecipes.map((recipe, index) => (
            <RecipeCard
              key={index}
              recipeName={recipe.name}
              image={recipe.image}
              calories={recipe.ingredients.reduce(
                (total, ingredient) => total + ingredient.calories,
                0,
              )}
              carbs={recipe.ingredients.reduce(
                (total, ingredient) => total + ingredient.carbs,
                0,
              )}
              protein={recipe.ingredients.reduce(
                (total, ingredient) => total + ingredient.protein,
                0,
              )}
              fat={recipe.ingredients.reduce(
                (total, ingredient) => total + ingredient.fat,
                0,
              )}
              cookingTime={recipe.cookingTime ? recipe.cookingTime : 0}
              instructions={recipe.instructions}
              community={false}
              onView={handleView(index)}
              onAdd={handleAdd(index)}
              onDelete={handleDelete(index)}
            />
          ))}
        {!listView && selectedRecipe && !editView && (
          <div className="flex flex-col gap-2 bg-white shadow-default p-6 w-[80%] dark:bg-black">
            <h2 className="text-3xl font-semibold text-black dark:text-white">
              {selectedRecipe.name}
            </h2>
            <div className="flex gap-4">
              <p className="bg-gray rounded-full px-2 dark:bg-slate-600">
                Calories:{" "}
                {selectedRecipe.ingredients.reduce(
                  (total, ingredient) => total + ingredient.calories,
                  0,
                )}
              </p>
              <p className="bg-gray rounded-full px-2 dark:bg-slate-600">
                Carbs:{" "}
                {selectedRecipe.ingredients.reduce(
                  (total, ingredient) => total + ingredient.carbs,
                  0,
                )}
                g
              </p>
              <p className="bg-gray rounded-full px-2 dark:bg-slate-600">
                Protein:{" "}
                {selectedRecipe.ingredients.reduce(
                  (total, ingredient) => total + ingredient.protein,
                  0,
                )}
                g
              </p>
              <p className="bg-gray rounded-full px-2 dark:bg-slate-600">
                Fat:{" "}
                {selectedRecipe.ingredients.reduce(
                  (total, ingredient) => total + ingredient.fat,
                  0,
                )}
                g
              </p>
            </div>
            <div>
              <p>Cooking Time: {selectedRecipe.cookingTime ? selectedRecipe.cookingTime : "0"} minutes</p>
            </div>
            <div>
              <h3>Ingredients</h3>
              <ul>
                {selectedRecipe.ingredients.map((ingredient, index) => (
                  <li key={index}>
                    {ingredient.name} - {ingredient.amount}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Instructions</h3>
              <textarea
              className="w-full h-[300px]" 
              disabled
              defaultValue={selectedRecipe.instructions}
              />
            </div>
          </div>
        )}
        {!listView && selectedRecipe && editView && (
          <div className="flex flex-col gap-2 bg-white dark:bg-black shadow-default p-6 w-[80%] items-center">            
            <input
              type="text"
              className="text-3xl font-semibold text-black dark:text-white border border-slate rounded-md px-2"
              defaultValue={selectedRecipe.name}
              onChange={(e) => handleRecipeChanges("name", e.target.value)}
            />
            <div className="flex gap-4">
              <label className="bg-gray dark:bg-slate-700 rounded-md px-2 py-1 flex gap-2">
                Calories:
              <input
                type="text"                
                className="rounded-md px-2 border w-[55px]"
                defaultValue={selectedRecipe.ingredients.reduce(
                  (total, ingredient) => total + ingredient.calories,
                  0,                  
                )}
                onChange={(e) => handleRecipeMacroChanges("calories", e.target.value)}
              />
              </label>
              <label className="bg-gray dark:bg-slate-700 rounded-md px-2 py-1 flex gap-2">
                Carbs:              
              <input
                type="text"
                className="rounded-md px-2 border w-[55px]"
                defaultValue={selectedRecipe.ingredients.reduce(
                  (total, ingredient) => total + ingredient.carbs,
                  0,
                )}
                onChange={(e) => handleRecipeMacroChanges("carbs", e.target.value)}
              />
              </label>
              <label className="bg-gray dark:bg-slate-700 rounded-md px-2 py-1 flex gap-2">
                Protein:              
              <input
                type="text"
                className="rounded-md px-2 border w-[55px]"
                defaultValue={selectedRecipe.ingredients.reduce(
                  (total, ingredient) => total + ingredient.protein,
                  0,
                )}
                onChange={(e) => handleRecipeMacroChanges("protein", e.target.value)}
              />
              </label>
              <label className="bg-gray dark:bg-slate-700 rounded-md px-2 py-1 flex gap-2">
                Fat:              
              <input
                type="text"
                className="rounded-md px-2 border w-[55px]"
                defaultValue={selectedRecipe.ingredients.reduce(
                  (total, ingredient) => total + ingredient.fat,
                  0,
                )}
                onChange={(e) => handleRecipeMacroChanges("fat", e.target.value)}
              />
              </label>
            </div>
            <div>
              <label className="flex gap-2">
                Cooking Time: 
              <input
                type="text"
                className="rounded-md px-2 border w-[55px]"
                defaultValue={selectedRecipe.cookingTime ? selectedRecipe.cookingTime : ""}
                onChange={(e) => handleRecipeChanges("cookingTime", e.target.value)}
              />
              mins
              </label>
            </div>
            <div className="flex flex-col justify-center w-[100%] gap-2 items-center">
              <h3>Ingredients:</h3>
              <ul>
                {selectedRecipe.ingredients.map((ingredient, index) => (
                  <li key={index}>
                    <input
                      type="text"
                      className="border border-slate rounded-md px-2"
                      placeholder="Ingredient Name"
                      defaultValue={ingredient.name}
                      onChange={(e) => handleRecipeIngredientChanges(index, "name", e.target.value)}
                    />
                    -
                    <input
                      type="text"
                      placeholder="Ingredient Amount"
                      className="border border-slate rounded-md px-2"
                      defaultValue={ingredient.amount}
                      onChange={(e) => handleRecipeIngredientChanges(index, "amount", e.target.value)}
                    />
                  </li>                                    
                ))}
              </ul>   
              <div className="w-inherit">           
              <button 
                className="rounded bg-primary px-4 py-2 text-white" 
                onClick={() => handleRecipeChanges("ingredients", [...selectedRecipe.ingredients, {name: "", amount: "", calories: 0, carbs: 0, protein: 0, fat: 0}])}>
                  Add Ingredient
              </button>
              </div>
            </div>
            <div className="w-full flex flex-col items-center justify-center">
              <h3>Instructions:</h3>
              <textarea 
                className="border border-slate rounded-md px-2 w-[100%] h-[300px]"
                defaultValue={selectedRecipe.instructions}
                onChange={(e) => handleRecipeChanges("instructions", e.target.value)}
              />
            </div>
            <label className="mb-3 text-sm font-medium text-black dark:text-white">
            Options:
            <div className="flex items-center gap-5">
              Add to community recipes
              <SwitcherThree onChange={handleSwitch}/>
            </div>
          </label>
          <button className="rounded bg-primary px-4 py-2 text-white w-full" onClick={handleSave}>
            Save Changes
          </button>
          </div>          
        )}
      </div>
      {showPopup && (
        <div className="fixed left-0 top-0 flex h-screen w-screen items-center justify-center bg-black bg-opacity-20">
          <div className="flex flex-col gap-2 rounded bg-white p-4 shadow-default dark:bg-black">
            {/* Popup title */}
            <div>
              <h2 className="mb-4 text-xl font-bold">
                Add {selectedRecipe?.name} to meal planner
              </h2>
            </div>
            <div>
              {/* Popup date select */}
              <label className="text-gray-700 block text-sm font-medium">
                Select date
                <DatePickerOne
                  onDateSelect={handleDateSelect}
                  selectedDate={selectedDate}
                />
              </label>
            </div>
            {/* Popup meal name input */}
            <div>
              <label className="text-gray-700 block text-sm font-medium">
                Meal type
                <input
                  type="text"
                  placeholder="Snack"
                  className="border-gray-300 h-12 w-full rounded-md border px-4 focus:border-primary focus:outline-none focus:ring"
                  onChange={(e) => setMealType(e.target.value)}
                />
              </label>
            </div>
            <div className="flex justify-between">
              <button
                className="mt-4 rounded bg-primary px-4 py-2 text-white"
                onClick={() => setShowPopup(false)}
              >
                Close
              </button>
              <button
                className="mt-4 rounded bg-success px-4 py-2 text-white"
                onClick={handleMealPlannerAdd}
              >
                Add to Meal Planner
              </button>
            </div>
          </div>
        </div>
      )}
    </DefaultLayout>
  );
};

export default MyRecipes;
