import React, { useEffect, useState } from "react";
import SwitcherThree from "@/components/Switchers/SwitcherThree";

interface MealCardFormProps {
  onSubmit: (mealData: MealData) => void;
  onClose: () => void;
}

interface Ingredient {
  name: string;
  amount: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

interface MealData {
  id: number;
  meal: string;
  image?: string;
  name?: string;
  ingredients?: Ingredient[];
}

const MealCardForm: React.FC<MealCardFormProps> = ({ onSubmit, onClose }) => {
  const [mealData, setMealData] = useState<MealData>({
    id: 0,
    meal: "Snack",
    image: "",
    name: "",
    ingredients: [],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMealData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleMacroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    //change 1st ingredient to macro values
    setMealData((prevData) => {
      const ingredients = prevData.ingredients || [];
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
      return {
        ...prevData,
        ingredients,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    //Validation
    if (mealData.ingredients) {
      if (mealData.ingredients.length === 0) {
        toggleAlert();
        return;
      }
      mealData.ingredients.forEach((ingredient) => {
        if (!ingredient.calories) {
          ingredient.calories =
            (ingredient.carbs + ingredient.protein) * 4 + ingredient.fat * 9;
        }
      });
    }

    onSubmit(mealData);
  };

  const handleClose = () => {
    onClose();
  };

  const [ingredientInput, setIngredientInput] = useState(false);

  const handleSwitch = () => {
    setIngredientInput(!ingredientInput);
  };

  const macroInput = (
    <div className="flex w-100 justify-center gap-5">
      <div className="flex w-20 flex-col justify-center">
        <label className="mb-3 text-sm font-medium text-black dark:text-white">
          Cals
        </label>
        <input
          name="calories"
          type="number"
          min={0}
          className="mb-3 w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-2 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          onChange={handleMacroChange}
        />
      </div>
      <div className="flex w-20 flex-col justify-center">
        <label className="mb-3 text-sm font-medium text-black dark:text-white">
          Carbs (g)
        </label>
        <input
          name="carbs"
          type="number"
          min={0}
          className="mb-3 w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-2 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          onChange={handleMacroChange}
        />
      </div>
      <div className="flex w-20 flex-col justify-center">
        <label className="mb-3 text-sm font-medium text-black dark:text-white">
          Protein (g)
        </label>
        <input
          name="protein"
          type="number"
          min={0}
          className="mb-3 w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-2 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          onChange={handleMacroChange}
        />
      </div>
      <div className="flex w-20 flex-col justify-center">
        <label className="mb-3 text-sm font-medium text-black dark:text-white">
          Fat (g)
        </label>
        <input
          name="fat"
          type="number"
          min={0}
          className="mb-3 w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-2 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          onChange={handleMacroChange}
        />
      </div>
    </div>
  );

  const [ingredientsLength, setIngredientsLength] = useState(1);

  const handleIngredientChange =
    (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setMealData((prevData) => {
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
      setMealData((prevData) => {
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
      <td className="max-w-[16.66%] border-b border-[#eee] py-5 pl-5 dark:border-strokedark">
        <input
          name="name"
          type="text"
          placeholder="Apple"
          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          onChange={handleIngredientChange(index)}
        />
      </td>
      <td className="max-w-[16.66%] border-b border-[#eee] py-5 dark:border-strokedark">
        <input
          name="amount"
          type="text"
          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          onChange={handleIngredientChange(index)}
        />
      </td>
      <td className="border-b border-[#eee] py-5 pl-5 dark:border-strokedark">
        <input
          name="calories"
          type="number"
          min={0}
          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          onChange={handleIngredientMacroChange(index)}
        />
      </td>
      <td className="border-b border-[#eee] py-5 pl-5 dark:border-strokedark">
        <input
          name="carbs"
          type="number"
          min={0}
          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          onChange={handleIngredientMacroChange(index)}
        />
      </td>
      <td className="border-b border-[#eee] py-5 pl-5 dark:border-strokedark">
        <input
          name="protein"
          type="number"
          min={0}
          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          onChange={handleIngredientMacroChange(index)}
        />
      </td>
      <td className="border-b border-[#eee] py-5 pl-5 dark:border-strokedark">
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
    <div className="w-full">
      <table className="table-auto">
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
      <div className="mb-10 flex justify-center gap-5">
        {ingredientsLength > 1 && (
          <button
            type="button"
            className="rounded bg-danger px-3 py-1 text-white"
            onClick={() => setIngredientsLength(ingredientsLength - 1)}
          >
            Remove Ingredient
          </button>
        )}
        <button
          type="button"
          className="rounded bg-primary px-3 py-1 text-white"
          onClick={() => setIngredientsLength(ingredientsLength + 1)}
        >
          Add Ingredient
        </button>
      </div>
    </div>
  );

  const [alertVisible, setAlertVisible] = useState(false);

  const alert = (
    <>
      {/* <!-- Alerts Item --> */}
      <div
        className={`pointer-events-none absolute bottom-9 flex w-[50%] border-l-6 border-[#F87171] bg-[#F87171] px-7 py-8 shadow-md transition-opacity duration-300 dark:bg-[#1B1B24] dark:bg-opacity-30 md:p-9 ${alertVisible ? "opacity-100" : "opacity-0"}`}
      >
        <div className="mr-5 flex h-9 w-full max-w-[36px] items-center justify-center rounded-lg bg-[#F87171]">
          <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.4917 7.65579L11.106 12.2645C11.2545 12.4128 11.4715 12.5 11.6738 12.5C11.8762 12.5 12.0931 12.4128 12.2416 12.2645C12.5621 11.9445 12.5623 11.4317 12.2423 11.1114C12.2422 11.1113 12.2422 11.1113 12.2422 11.1113C12.242 11.1111 12.2418 11.1109 12.2416 11.1107L7.64539 6.50351L12.2589 1.91221L12.2595 1.91158C12.5802 1.59132 12.5802 1.07805 12.2595 0.757793C11.9393 0.437994 11.4268 0.437869 11.1064 0.757418C11.1063 0.757543 11.1062 0.757668 11.106 0.757793L6.49234 5.34931L1.89459 0.740581L1.89396 0.739942C1.57364 0.420019 1.0608 0.420019 0.740487 0.739944C0.42005 1.05999 0.419837 1.57279 0.73985 1.89309L6.4917 7.65579ZM6.4917 7.65579L1.89459 12.2639L1.89395 12.2645C1.74546 12.4128 1.52854 12.5 1.32616 12.5C1.12377 12.5 0.906853 12.4128 0.758361 12.2645L1.1117 11.9108L0.758358 12.2645C0.437984 11.9445 0.437708 11.4319 0.757539 11.1116C0.757812 11.1113 0.758086 11.111 0.75836 11.1107L5.33864 6.50287L0.740487 1.89373L6.4917 7.65579Z"
              fill="#ffffff"
              stroke="#ffffff"
            ></path>
          </svg>
        </div>
        <div className="w-full">
          <h5 className="mb-3 font-semibold text-white">Error Submitting</h5>
          <ul>
            <li className="leading-relaxed text-white">
              Please fill out ingredient / macro fields.
            </li>
          </ul>
        </div>
      </div>
    </>
  );

  const toggleAlert = () => {
    setAlertVisible(true);
    setTimeout(() => {
      setAlertVisible(false);
    }, 5000);
  };

  return (
    <>
      <div className="flex justify-center bg-white p-10 shadow-default dark:bg-black">
        <form
          onSubmit={handleSubmit}
          className="flex h-auto flex-col items-center justify-center"
        >
          <h2 className="mb-2 text-2xl font-bold text-black dark:text-white">
            Add Meal
          </h2>
          <div className="flex w-100 flex-col justify-center">
            <label className="mb-3 text-sm font-medium text-black dark:text-white">
              Meal Type
            </label>
            <input
              name="meal"
              type="text"
              placeholder="Snack"
              className="mb-3 w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              onChange={handleChange}
            />
          </div>
          <div className="flex w-100 flex-col justify-center">
            <label className="mb-3 text-sm font-medium text-black dark:text-white">
              Image URL
            </label>
            <input
              name="image"
              type="text"
              placeholder="https://source.unsplash.com/random/?Snack&2"
              className="mb-3 w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              onChange={handleChange}
            />
          </div>
          <div className="flex w-100 flex-col justify-center">
            <label className="mb-3 text-sm font-medium text-black dark:text-white">
              Name
            </label>
            <input
              name="name"
              type="text"
              placeholder="Fruit Salad"
              className="mb-3 w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              onChange={handleChange}
            />
          </div>
          <div className="flex w-100 flex-col justify-center">
            <label className="mb-3 text-sm font-medium text-black dark:text-white">
              Ingredients?
            </label>
            <div className="mb-3">
              <SwitcherThree onChange={handleSwitch} />
            </div>
          </div>
          {ingredientInput ? macroInput : ingredientsInput}

          <div className="flex justify-center gap-5">
            <button
              type="button"
              className="rounded bg-danger px-3 py-1 text-white"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-primary px-3 py-1 text-white"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
      {alert}
    </>
  );
};

export default MealCardForm;
