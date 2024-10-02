"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import RecipeCard from "@/components/Cards/RecipeCard";
import { useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "@auth0/nextjs-auth0/client";
import Loader from "@/components/common/Loader";

interface Ingredient {
  name: string;
  amount: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

interface Recipe {
  email: string;
  name: string;
  ingredients: Ingredient[];
  instructions: string;
  image: string;
  cookingTime: number;
}

const CommunityRecipes = () => {
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

  // Load community recipes
  const [communityRecipes, setCommunityRecipes] = useState<[Recipe]>();
  const [communityRecipesLoaded, setCommunityRecipesLoaded] = useState(false);

  function loadCommunityRecipes() {
    //api call to load meals
    fetch("http://localhost:5000/api/getCommunityRecipes", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load meals");
        }
        return response.json();
      })
      .then((data) => {
        setCommunityRecipes(data);
        setCommunityRecipesLoaded(true);
      })
      .catch((error) => {
        console.error("Loading meals failed:", error);
      });
  }

  if (!communityRecipesLoaded) {
    loadCommunityRecipes();
  }

  return(
    <DefaultLayout>
    <Breadcrumb pageName="Community Recipes" subPage="Recipes" />
    {/* Search bar */}
    <div className="flex justify-end">
      <input
        type="text"
        placeholder="Search for recipes"
        className="w-96 h-12 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-primary"
      />
    </div>
    {/* Recipes */}
{/* Recipes */}
<div className="flex flex-wrap gap-10 justify-center mt-10">
{(communityRecipes && (communityRecipes?.length > 0)) && communityRecipes.map((recipe, index) => (
    <RecipeCard
      key={index}
      recipeName={recipe.name}
      image={recipe.image}
      calories={recipe.ingredients.reduce((total, ingredient) => total + ingredient.calories, 0)}
      carbs={recipe.ingredients.reduce((total, ingredient) => total + ingredient.carbs, 0)}
      protein={recipe.ingredients.reduce((total, ingredient) => total + ingredient.protein, 0)}
      fat={recipe.ingredients.reduce((total, ingredient) => total + ingredient.fat, 0)}
      cookingTime={30}
      instructions={recipe.instructions}
    />
  ))}
</div>
    
    </DefaultLayout>
  );
}

export default CommunityRecipes;