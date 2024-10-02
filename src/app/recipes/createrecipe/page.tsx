"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import RecipeCard from "@/components/Cards/RecipeCard";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import Loader from "@/components/common/Loader";
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
  email: string;
  name: string;
  ingredients: Ingredient[];
  instructions: string;
  image: string;
  cookingTime: number;
}

const CreateRecipe = () => {
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

  let initialRecipeData: Recipe = {
    email: user?.email || "",
    name: "",
    ingredients: [
      {
        name: "",
        amount: "",
        calories: 0,
        carbs: 0,
        protein: 0,
        fat: 0,
      },
    ],
    instructions: "",
    image: "",
    cookingTime: 0,
  };

  const [recipeData, setRecipeData] = useState<Recipe>(initialRecipeData);

  const [ingredientsLength, setIngredientsLength] = useState(1);
  const [communityRecipe, setCommunityRecipe] = useState(false);

  const handleSwitch = () => {
    setCommunityRecipe(!communityRecipe);
    console.log(communityRecipe);
  };

  const handleIngredientChange =
    (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setRecipeData((prevData) => {
        const ingredients = prevData.ingredients;
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
        return {
          ...prevData,
          ingredients,
        };
      });
    };

  const handleIngredientMacroChange =
    (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setRecipeData((prevData) => {
        const ingredients = prevData.ingredients || [];
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
          [name]: Number(value),
        };
        return {
          ...prevData,
          ingredients,
        };
      });
    };

  const ingredientsInputRow = (index: number) => (
    <tr key={index} className="text-xs">
      <td className="border-b border-[#eee] py-5 px-5 dark:border-strokedark">
        <input
          name="name"
          type="text"
          placeholder="Apple"
          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          onChange={handleIngredientChange(index)}
        />
      </td>
      <td className="border-b border-[#eee] py-5 px-5 dark:border-strokedark">
        <input
          name="amount"
          type="text"
          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          onChange={handleIngredientChange(index)}
        />
      </td>
      <td className="border-b border-[#eee] py-5 px-5 dark:border-strokedark">
        <input
          name="calories"
          type="number"
          min={0}
          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          onChange={handleIngredientMacroChange(index)}
        />
      </td>
      <td className="border-b border-[#eee] py-5 px-5 dark:border-strokedark">
        <input
          name="carbs"
          type="number"
          min={0}
          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          onChange={handleIngredientMacroChange(index)}
        />
      </td>
      <td className="border-b border-[#eee] py-5 px-5 dark:border-strokedark">
        <input
          name="protein"
          type="number"
          min={0}
          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          onChange={handleIngredientMacroChange(index)}
        />
      </td>
      <td className="border-b border-[#eee] py-5 px-5 dark:border-strokedark">
        <input
          name="fat"
          type="number"
          min={0}
          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          onChange={handleIngredientMacroChange(index)}
        />
      </td>
    </tr>
  );

  const ingredientsInput = (
    <div className="w-[100%]">
      <table className="table-auto w-full">
        <thead>
          <tr className="bg-gray-2 text-left dark:bg-meta-4">
            <th className="w-[16.66%] px-4 py-4 text-xs font-medium text-black dark:text-white">
              Ingredient
            </th>
            <th className="w-[16.66%] px-4 py-4 text-xs font-medium text-black dark:text-white">
              Amount
            </th>
            <th className="w-[16.66%] px-4 py-4 text-xs font-medium text-black dark:text-white">
              Cals
            </th>
            <th className="w-[16.66%] px-4 py-4 text-xs font-medium text-black dark:text-white">
              Carbs
            </th>
            <th className="w-[16.66%] px-4 py-4 text-xs font-medium text-black dark:text-white">
              Protein
            </th>
            <th className="w-[16.66%] px-4 py-4 text-xs font-medium text-black dark:text-white">
              Fat
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: ingredientsLength }, (_, i) =>
            ingredientsInputRow(i),
          )}
        </tbody>
      </table>
      <div className="flex justify-center gap-5 mt-5">
        {ingredientsLength > 1 && (
          <button
            type="button"
            className="rounded bg-danger p-3 text-gray font-medium hover:bg-opacity-90"
            onClick={() => setIngredientsLength(ingredientsLength - 1)}
          >
            Remove Ingredient
          </button>
        )}
        <button
          type="button"
          className="rounded bg-primary p-3 text-gray font-medium hover:bg-opacity-90"
          onClick={() => setIngredientsLength(ingredientsLength + 1)}
        >
          Add Ingredient
        </button>
      </div>
    </div>
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRecipeData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAreaInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRecipeData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }

  const router = useRouter();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeData.name || !recipeData.ingredients[0].name || !recipeData.instructions || !recipeData.image || recipeData.ingredients[0].calories === 0 || recipeData.ingredients[0].carbs === 0 || recipeData.ingredients[0].protein === 0 || recipeData.ingredients[0].fat === 0 || recipeData.cookingTime === 0) {
      alert("Please fill out all fields");
      return;
    }
    SaveRecipe();
    //router.push("/recipes/myrecipes");
    console.log(recipeData);
  };

  function SaveRecipe() {
    let input = {
      email: user?.email,
      name: recipeData.name,
      ingredients: recipeData.ingredients,
      instructions: recipeData.instructions,
      image: recipeData.image,
      community: communityRecipe,
    };
    //api call to save recipe
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
      .then(() => {        
        router.push("/recipes/myrecipes");
      })
      .catch((error) => {
        console.error("Saving recipe failed:", error);
      });
  }

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Create Recipe" subPage="Recipes" />
      {/* Create Recipe form */}
      <div className="flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark w-[80%]"
      >
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Create Recipe
          </h3>
        </div>
        <div className="flex flex-col gap-5.5 p-6.5">
          {/* Name */}
          <label className="mb-3 text-sm font-medium text-black dark:text-white">
            Name:
            <input
              type="text"
              name="name"
              onChange={handleInputChange}
              className="mb-3 w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </label>
          <label className="mb-3 text-sm font-medium text-black dark:text-white">
            Image Upload:
          </label>
          {/* File upload input */}
          <div
            id="FileUpload"
            className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded border border-dashed border-primary bg-gray px-4 py-4 dark:bg-meta-4 sm:py-7.5"
          >
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
            />
            <div className="flex flex-col items-center justify-center space-y-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M1.99967 9.33337C2.36786 9.33337 2.66634 9.63185 2.66634 10V12.6667C2.66634 12.8435 2.73658 13.0131 2.8616 13.1381C2.98663 13.2631 3.1562 13.3334 3.33301 13.3334H12.6663C12.8431 13.3334 13.0127 13.2631 13.1377 13.1381C13.2628 13.0131 13.333 12.8435 13.333 12.6667V10C13.333 9.63185 13.6315 9.33337 13.9997 9.33337C14.3679 9.33337 14.6663 9.63185 14.6663 10V12.6667C14.6663 13.1971 14.4556 13.7058 14.0806 14.0809C13.7055 14.456 13.1968 14.6667 12.6663 14.6667H3.33301C2.80257 14.6667 2.29387 14.456 1.91879 14.0809C1.54372 13.7058 1.33301 13.1971 1.33301 12.6667V10C1.33301 9.63185 1.63148 9.33337 1.99967 9.33337Z"
                    fill="#3C50E0"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M7.5286 1.52864C7.78894 1.26829 8.21106 1.26829 8.4714 1.52864L11.8047 4.86197C12.0651 5.12232 12.0651 5.54443 11.8047 5.80478C11.5444 6.06513 11.1223 6.06513 10.8619 5.80478L8 2.94285L5.13807 5.80478C4.87772 6.06513 4.45561 6.06513 4.19526 5.80478C3.93491 5.54443 3.93491 5.12232 4.19526 4.86197L7.5286 1.52864Z"
                    fill="#3C50E0"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M7.99967 1.33337C8.36786 1.33337 8.66634 1.63185 8.66634 2.00004V10C8.66634 10.3682 8.36786 10.6667 7.99967 10.6667C7.63148 10.6667 7.33301 10.3682 7.33301 10V2.00004C7.33301 1.63185 7.63148 1.33337 7.99967 1.33337Z"
                    fill="#3C50E0"
                  />
                </svg>
              </span>
              <p>
                <span className="text-primary">Click to upload</span> or drag
                and drop
              </p>
              <p className="mt-1.5">SVG, PNG, JPG or GIF</p>
              <p>(max, 800 X 800px)</p>
            </div>
          </div>
          <label className="mb-3 text-sm font-medium text-black dark:text-white">
            Or Enter Image URL:
            <input
              type="text"
              name="image"
              onChange={handleInputChange}
              className="mb-3 w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </label>
          {/* Cooking Time */}
          <label className="mb-3 text-sm font-medium text-black dark:text-white">
            Cooking Time:
            <input
              type="number"
              name="cookingTime"
              onChange={handleInputChange}
              className="mb-3 w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </label>
          {/* Instructions */}
          <label className="mb-3 text-sm font-medium text-black dark:text-white">
            Instructions:
            <textarea
              name="instructions"              
              onChange={handleAreaInputChange}
              className="flex h-50 w-[100%] items-center justify-center border border-stroke bg-white px-5 py-3 dark:border-strokedark dark:bg-boxdark"
            />
          </label>
          {/* Ingredients */}
          <label className="mb-3 text-sm font-medium text-black dark:text-white">
            Ingredients:
            {ingredientsInput}
          </label>
          {/* Options */}
          <label className="mb-3 text-sm font-medium text-black dark:text-white">
            Options:
            <div className="flex items-center gap-5">
              Add to community recipes
              <SwitcherThree onChange={handleSwitch}/>
            </div>
          </label>
          {/* Submit button */}
          <button
            className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
            type="submit"
          >
            Submit Recipe
          </button>
        </div>
      </form>
      </div>
    </DefaultLayout>
  );
};

export default CreateRecipe;
