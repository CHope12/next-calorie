import Image from "next/image";

interface Ingredient {
  name: string;
  amount: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

interface MealCardProps {
  id: number;
  meal: string;
  image?: string;
  name?: string;
  ingredients?: Ingredient[];
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
  onSave: (id: number) => void;
}

const MealCard = (props: MealCardProps) => {
  const meal = props.meal;
  let imgSrc = "https://source.unsplash.com/random/?Food&2";
  if (props.image) {
    imgSrc = props.image;
  }

  const calories = props.ingredients?.reduce(
    (acc, ingredient) => acc + ingredient.calories,
    0,
  );

  const carbs = props.ingredients?.reduce(
    (acc, ingredient) => acc + ingredient.carbs,
    0,
  );

  const protein = props.ingredients?.reduce(
    (acc, ingredient) => acc + ingredient.protein,
    0,
  );

  const fat = props.ingredients?.reduce(
    (acc, ingredient) => acc + ingredient.fat,
    0,
  );

  const deleteMeal = () => {
    props.onDelete(props.id);
  };

  const saveMeal = () => {
    props.onSave(props.id);
  };

  const editMeal = () => {
    props.onEdit(props.id);
  };

  return (
    <>
      {/* Card */}
      <div className="relative max-w-[400px] h-[450px] overflow-hidden">
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="max-h-[250px] max-w-[400px] overflow-hidden">
            <Image
              src={imgSrc}
              alt="Cards"
              width={400}
              height={200}
              content="contain"
              unoptimized
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/400x300";
              }}
            />
          </div>

          {/* Title */}
          <div className="absolute left-[25px] top-[160px]">
            <h4 className="text-l mb-0 font-semibold text-white dark:text-black">
              {meal}
            </h4>
            <h4 className="mb-1 text-xl font-semibold text-white dark:text-black">
              {/* Name */}
              {props.name ? props.name : "No name"}
            </h4>
            {/* Info */}
            <div className="flex space-x-2">
              <div className="rounded bg-white px-1 py-1 text-sm font-medium text-black shadow-default dark:border-strokedark dark:bg-boxdark dark:text-white">
                Cals: {calories}
              </div>
              <div className="rounded bg-white px-1 py-1 text-sm font-medium text-black shadow-default dark:border-strokedark dark:bg-boxdark dark:text-white">
                Carbs: {carbs + "g"}
              </div>
              <div className="rounded bg-white px-1 py-1 text-sm font-medium text-black shadow-default dark:border-strokedark dark:bg-boxdark dark:text-white">
                Protein: {protein + "g"}
              </div>
              <div className="rounded bg-white px-1 py-1 text-sm font-medium text-black shadow-default dark:border-strokedark dark:bg-boxdark dark:text-white">
                Fat: {fat + "g"}
              </div>
            </div>
          </div>
          {/* Ingredients */}
          {props.ingredients && props.ingredients[0]?.name !== "" && (
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
                  {props.ingredients?.map((ingredient, index) => {
                    return (
                      <tr key={index} className="text-xs">
                        <td className="max-w-[16.66%] border-b border-[#eee] py-5 pl-5 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {ingredient.name}
                          </p>
                        </td>
                        <td className="max-w-[16.66%] border-b border-[#eee] py-5 dark:border-strokedark">
                          <p className="ml-3 inline-flex rounded-full bg-success bg-opacity-10 px-3 py-1 text-xs font-medium text-success">
                            {ingredient.amount ? ingredient.amount : "0g"}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] py-5 pl-5 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {ingredient.calories ? ingredient.calories : "0"}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] py-5 pl-5 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {ingredient.carbs ? ingredient.carbs + "g" : "0g"}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] py-5 pl-5 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {ingredient.protein
                              ? ingredient.protein + "g"
                              : "0g"}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] py-5 pl-5 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {ingredient.fat ? ingredient.fat + "g" : "0g"}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {/* Meal buttons */}
          <div className="align-center flex w-auto justify-center gap-5">
            <button
              className="my-4 flex gap-2 rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white"
              onClick={deleteMeal}
            >
              Delete
              <svg
                className="fill-current"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.7535 2.47502H11.5879V1.9969C11.5879 1.15315 10.9129 0.478149 10.0691 0.478149H7.90352C7.05977 0.478149 6.38477 1.15315 6.38477 1.9969V2.47502H4.21914C3.40352 2.47502 2.72852 3.15002 2.72852 3.96565V4.8094C2.72852 5.42815 3.09414 5.9344 3.62852 6.1594L4.07852 15.4688C4.13477 16.6219 5.09102 17.5219 6.24414 17.5219H11.7004C12.8535 17.5219 13.8098 16.6219 13.866 15.4688L14.3441 6.13127C14.8785 5.90627 15.2441 5.3719 15.2441 4.78127V3.93752C15.2441 3.15002 14.5691 2.47502 13.7535 2.47502ZM7.67852 1.9969C7.67852 1.85627 7.79102 1.74377 7.93164 1.74377H10.0973C10.2379 1.74377 10.3504 1.85627 10.3504 1.9969V2.47502H7.70664V1.9969H7.67852ZM4.02227 3.96565C4.02227 3.85315 4.10664 3.74065 4.24727 3.74065H13.7535C13.866 3.74065 13.9785 3.82502 13.9785 3.96565V4.8094C13.9785 4.9219 13.8941 5.0344 13.7535 5.0344H4.24727C4.13477 5.0344 4.02227 4.95002 4.02227 4.8094V3.96565ZM11.7285 16.2563H6.27227C5.79414 16.2563 5.40039 15.8906 5.37227 15.3844L4.95039 6.2719H13.0785L12.6566 15.3844C12.6004 15.8625 12.2066 16.2563 11.7285 16.2563Z"
                  fill=""
                ></path>
              </svg>
            </button>
            <button
              className="my-4 flex gap-2 rounded-lg bg-success px-4 py-2 text-sm font-medium text-white"
              onClick={saveMeal}
            >
              Save
              <svg
                className="fill-current"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.8754 11.6719C16.5379 11.6719 16.2285 11.9531 16.2285 12.3187V14.8219C16.2285 15.075 16.0316 15.2719 15.7785 15.2719H2.22227C1.96914 15.2719 1.77227 15.075 1.77227 14.8219V12.3187C1.77227 11.9812 1.49102 11.6719 1.12539 11.6719C0.759766 11.6719 0.478516 11.9531 0.478516 12.3187V14.8219C0.478516 15.7781 1.23789 16.5375 2.19414 16.5375H15.7785C16.7348 16.5375 17.4941 15.7781 17.4941 14.8219V12.3187C17.5223 11.9531 17.2129 11.6719 16.8754 11.6719Z"
                  fill=""
                ></path>
                <path
                  d="M8.55074 12.3469C8.66324 12.4594 8.83199 12.5156 9.00074 12.5156C9.16949 12.5156 9.31012 12.4594 9.45074 12.3469L13.4726 8.43752C13.7257 8.1844 13.7257 7.79065 13.5007 7.53752C13.2476 7.2844 12.8539 7.2844 12.6007 7.5094L9.64762 10.4063V2.1094C9.64762 1.7719 9.36637 1.46252 9.00074 1.46252C8.66324 1.46252 8.35387 1.74377 8.35387 2.1094V10.4063L5.40074 7.53752C5.14762 7.2844 4.75387 7.31252 4.50074 7.53752C4.24762 7.79065 4.27574 8.1844 4.50074 8.43752L8.55074 12.3469Z"
                  fill=""
                ></path>
              </svg>
            </button>
            <button
              className="my-4 flex gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
              onClick={editMeal}
            >
              Edit
              <svg
                className="fill-white dark:fill-white"
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  transform="translate(7, 4) scale(0.03, 0.03)"
                  d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MealCard;
