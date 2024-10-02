import React from "react";
import Image from "next/image";

interface RecipeCardProps {
  recipeName: string;
  image: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  cookingTime: number;
  instructions: string;
  community:  boolean;
  onView: () => void;
  onAdd: () => void;
  onDelete: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipeName,
  image,
  calories,
  carbs,
  protein,
  fat,
  cookingTime,
  instructions,
  community = true,
  onView,
  onAdd,
  onDelete,
}) => {
  return (
    <>
      <div className="flex h-[150px] w-[47.5%] min-w-[620px] bg-white shadow-default dark:bg-black">
        <Image
          src={image}
          alt={recipeName}
          width={200}
          height={150}
          unoptimized
          className="h-[150px] w-[200px] p-2"
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/200x150";
          }}
        />
        <div className="flex w-full flex-col gap-1 px-4 pt-3">
          <h2 className="text-3xl font-semibold text-black dark:text-white">
            {recipeName}
          </h2>
          <div className="recipe-card__details flex gap-4">
            <p>Calories: {calories}</p>
            <p>Carbs: {carbs}g</p>
            <p>Protein: {protein}g</p>
            <p>Fat: {fat}g</p>
          </div>
          <div>
            <p>Cooking Time: {(cookingTime === undefined) ? "0" : cookingTime} mins</p>
          </div>

          <div className="flex gap-3">
            <button
              className="rounded bg-primary px-2 py-1 text-white"
              onClick={onView}
            >
              View Recipe
            </button>
            <button
              className="rounded bg-success px-2 py-1 text-white"
              onClick={onAdd}
            >
              Add to Meal Planner
            </button>
            {!community && (
            <button
              className="rounded bg-danger px-2 py-1 text-white"
              onClick={onDelete}
            >
              Delete Recipe
            </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default RecipeCard;
