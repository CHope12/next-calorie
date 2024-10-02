"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import DatePickerOne from "@/components/FormElements/DatePicker/DatePickerOne";
import {
  useEffect,
  useState,
} from "react";
import MealCard from "@/components/Cards/MealCard";
import MealForm from "@/components/Forms/MealForm";
import { CircularProgress } from "@nextui-org/react";
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

interface MealData {
  id: number;
  meal: string;
  image?: string;
  name?: string;
  ingredients?: Ingredient[];
}

const MealPlanner = () => {
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

  //Load target cals from measurements
  const [targCals, setTargCals] = useState(0);
  const [justTargCals, setJustTargCals] = useState(0);
  function LoadMeasurements() {
    let input = {
      email: user?.email,
    };

    //api call to load measurements
    fetch("http://localhost:5000/api/getMeasurements", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load measurements");
        }
        return response.json();
      })
      .then((data) => {
        setJustTargCals(data.calories);
        setTargCals(data.calories);
      })
      .catch((error) => {
        console.error("Loading measurements failed:", error);
      });
  }
  if (targCals === 0) {
    LoadMeasurements();
  }

  //Load cals burned from stats
  const [calsBurned, setCalsBurned] = useState(0);
  function LoadStats() {
    let input = {
      email: user?.email,
      date: formatDate(selectedDate),
    };

    //api call to load stats
    fetch("http://localhost:5000/api/getStats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load stats");
        }
        return response.json();
      })
      .then((data) => {
        setCalsBurned(data.calories);
      })
      .catch((error) => {
        console.error("Loading stats failed:", error);
      });
  }

  useEffect(() =>{
    if (calsBurned > 0){
      setTargCals(justTargCals + calsBurned);
    }
  }, [calsBurned]);
  
  // Nutrition targets
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalCarbs, setTotalCarbs] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [totalFat, setTotalFat] = useState(0);

  const [targetCalories, setTargetCalories] = useState(targCals);
  const [targetCarbs, setTargetCarbs] = useState((targCals * 0.5) / 4);
  const [targetProtein, setTargetProtein] = useState((targCals * 0.25) / 4);
  const [targetFat, setTargetFat] = useState((targCals * 0.25) / 9);

  useEffect(() => {
    setTargetCalories(targCals);
    setTargetCarbs((targCals * 0.5) / 4);
    setTargetProtein((targCals * 0.25) / 4);
    setTargetFat((targCals * 0.25) / 9);
  }, [targCals]);  

  //Date selection
  function formatDate(date: Date) {
    let d = date;
    let day = d.getDate();
    let month = d.getMonth() + 1;
    let year = d.getFullYear();
    let formattedDate = day + "/" + month + "/" + year;
    return formattedDate;
  }

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  function getDates(date: Date) {
    var datesOfWeek = [];
    var curr = date;
    for (let i = 0; i < 7; i++) {      
      let first = curr.getDate() - curr.getDay() + i;  
      let day = new Date(curr.setDate(first)).toISOString().slice(0, 10);
      datesOfWeek.push(new Date(day));
    }
    return datesOfWeek;
  }

  const [dates, setDates] = useState<Date[]>(getDates(new Date()));

  const handleDateSelect = (date: string | Date) => {        
    let d = new Date(date);
    d.setHours(d.getHours() + 1); //calender sets hours to midnight which changes days
    console.log(d);
    setDates(getDates(new Date(d)));
    setSelectedDate(new Date(date));
    console.log(dates);
  };

  //Meal data
  const [mealData, setMealData] = useState<MealData[]>([]);

  useEffect(() => {
    let calories = 0;
    let carbs = 0;
    let protein = 0;
    let fat = 0;
    if(mealData == undefined){
      setTotalCalories(0);
      setTotalCarbs(0);
      setTotalProtein(0);
      setTotalFat(0);
      return;
    }
    mealData.forEach((meal) => {
      meal.ingredients?.forEach((ingredient) => {
        calories += ingredient.calories;
        carbs += ingredient.carbs;
        protein += ingredient.protein;
        fat += ingredient.fat;
      });
    });
    setTotalCalories(calories);
    setTotalCarbs(carbs);
    setTotalProtein(protein);
    setTotalFat(fat);
  }, [mealData]);

  const [mealFormActive, setMealFormActive] = useState(false);

  const toggleMealForm = () => {
    setMealFormActive(!mealFormActive);
  };

  const handleMealFormSubmit = (data: MealData) => {
    let newMealData = data;
    console.log(newMealData);
    newMealData.id = mealData.length + 1;
    setMealData([...mealData, newMealData]);
    toggleMealForm();

    let input = {
      email: user.email,
      date: formatDate(selectedDate),
      meal: newMealData,
    };
    SaveMeal(input);
  };

  const handleMealCardDelete = (id: number) => {
    let input = {
      email: user.email,
      date: formatDate(selectedDate),
      meal: mealData.find((meal) => meal.id === id),
    };
    //api call to delete meal
    fetch("http://localhost:5000/api/deleteMeal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete meal");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data.message); // Log success message
        mealData.splice(
          mealData.findIndex((meal) => meal.id === id),
          1,
        );
      })
      .then(() => {
        LoadMeals();
      })
      .catch((error) => {
        console.error("Deleting meal failed:", error);
      });
  };

  const handleMealCardAddIngredient = (id: number) => {
    //
  };

  const handleMealCardSave = (id: number) => {
    var input = {
      email: user.email,
      date: formatDate(selectedDate),
      meal: mealData.find((meal) => meal.id === id),
    };

    SaveMeal(input);
  };

  const mealForm = () => {
    return (
      <div
        className={
          "align-center fixed left-0 top-7 flex h-full w-full items-center justify-center " +
          (mealFormActive
            ? "bg-boxdark bg-opacity-[0.5]"
            : "pointer-events-none")
        }
      >
        <MealForm onSubmit={handleMealFormSubmit} onClose={toggleMealForm} />
      </div>
    );
  };

  function LoadMeals() {
    let input = {
      email: user?.email,
      date: formatDate(selectedDate),
    };
    //api call to load meals
    fetch("http://localhost:5000/api/getMeals", {
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
        if (data.length === 0) {
          setMealData([]);
          return;
        }
        let meals = [];
        for (let i = 0; i < data.length; i++) {
          let meal = data[i].meal;
          meals.push(meal);
        }
        //order meals by id
        meals.sort((a, b) => a.id - b.id);
        setMealData(meals);
      })
      .catch((error) => {
        console.error("Loading meals failed:", error);
      });
  }

  useEffect(() => {
    LoadMeals();
    LoadStats(); 
  }, [selectedDate]);

  function SaveMeal(input: any) {
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

  return (
    <>
      <DefaultLayout>
        <div className="mx-auto">
          <Breadcrumb pageName="Meal Planner" />
          {/* Total nutrition */}
          <div className="flex justify-around bg-white px-2 py-5 text-black shadow-default dark:bg-boxdark">
            <div className="flex flex-col items-center justify-center dark:text-white gap-1 mt-7">
              <span className="text-3xl font-bold">Daily Breakdown:</span>              
              <span className="text-sm">Target cals = {justTargCals} + {calsBurned ? calsBurned : "0"} cals burned</span>
              {/* Week selection */}
              <div className="bg-white dark:bg-boxdark px-6 flex mt-9">
                <div className="w-[355px]">
                  <DatePickerOne
                    onDateSelect={handleDateSelect}
                    selectedDate={selectedDate.toString()}
                  />
                </div>
              </div>
            </div>
            <div>
              <CircularProgress
                classNames={{
                  svg: "h-30 w-30",
                  value: "text-xl font-semibold dark:text-white",
                  label: "text-xl font-semibold dark:text-white",
                }}
                label="Calories"
                size="lg"
                value={(totalCalories / targetCalories) * 100}
                color="primary"
                showValueLabel={true}
              />            
              <div className="flex justify-center">
                {totalCalories} / {targetCalories}kcal
              </div>
            </div>
            <div>
              <CircularProgress
                classNames={{
                  svg: "h-30 w-30",
                  value: "text-xl font-semibold dark:text-white",
                  label: "text-xl font-semibold dark:text-white",
                }}
                label="Carbs"
                size="lg"
                value={(totalCarbs / targetCarbs) * 100}
                color="warning"
                showValueLabel={true}
              />              
              <div className="flex justify-center">
                {(totalCarbs % 1 === 0) ? totalCarbs : totalCarbs.toFixed(2)} / {(targetCarbs % 1 === 0) ? targetCarbs : targetCarbs.toFixed(2)}g
              </div>
            </div>
            <div>
              <CircularProgress
                classNames={{
                  svg: "h-30 w-30",
                  value: "text-xl font-semibold dark:text-white",
                  label: "text-xl font-semibold dark:text-white",
                }}
                label="Protein"
                size="lg"
                value={(totalProtein / targetProtein) * 100}
                color="danger"
                showValueLabel={true}
              />
              <div className="flex justify-center">
              {(totalProtein % 1 === 0) ? totalProtein : totalProtein.toFixed(2)} / {(targetProtein % 1 === 0) ? targetProtein : targetProtein.toFixed(2)}g
              </div>
            </div>
            <div>
              <CircularProgress
                classNames={{
                  svg: "h-30 w-30",
                  value: "text-xl font-semibold dark:text-white",
                  label: "text-xl font-semibold dark:text-white",
                }}
                label="Fat"
                size="lg"
                value={(totalFat / targetFat) * 100}
                color="success"
                showValueLabel={true}
              />
              <div className="flex justify-center">
              {(totalFat % 1 === 0) ? totalFat : totalFat.toFixed(2)} / {(targetFat % 1 === 0) ? targetFat : targetFat.toFixed(2)}g
              </div>
            </div>
          </div>

          {/* Day selection */}
          <div className="justify-even mb-6 flex items-center bg-white px-2 py-2 text-lg text-black shadow-default dark:bg-boxdark dark:text-white">
            <div
              className={
                "flex w-[14.28%] cursor-pointer flex-col text-center" +
                (selectedDate.getDate() === dates[0].getDate() ? " font-bold text-primary" : "")
              }
              onClick={() => handleDateSelect(dates[0])}
            >
              <span>{dates[0].getDate().toString()}</span>
              Sunday
            </div>
            <div
              className={
                "flex w-[14.28%] cursor-pointer flex-col text-center" +
                (selectedDate.getDate() === dates[1].getDate() ? " font-bold text-primary" : "")
              }
              onClick={() => handleDateSelect(dates[1])}
            >
              <span>{dates[1].getDate().toString()}</span>
              Monday
            </div>
            <div
              className={
                "flex w-[14.28%] cursor-pointer flex-col text-center" +
                (selectedDate.getDate() === dates[2].getDate() ? " font-bold text-primary" : "")
              }
              onClick={() => handleDateSelect(dates[2])}
            >
              <span>{dates[2].getDate().toString()}</span>
              Tuesday
            </div>
            <div
              className={
                "flex w-[14.28%] cursor-pointer flex-col text-center" +
                (selectedDate.getDate() === dates[3].getDate() ? " font-bold text-primary" : "")
              }
              onClick={() => handleDateSelect(dates[3])}
            >
              <span>{dates[3].getDate().toString()}</span>
              Wednesday
            </div>
            <div
              className={
                "flex w-[14.28%] cursor-pointer flex-col text-center" +
                (selectedDate.getDate() === dates[4].getDate() ? " font-bold text-primary" : "")
              }
              onClick={() => handleDateSelect(dates[4])}
            >
              <span>{dates[4].getDate().toString()}</span>
              Thursday
            </div>
            <div
              className={
                "flex w-[14.28%] cursor-pointer flex-col text-center" +
                (selectedDate.getDate() === dates[5].getDate() ? " font-bold text-primary" : "")
              }
              onClick={() => handleDateSelect(dates[5])}
            >
              <span>{dates[5].getDate().toString()}</span>
              Friday
            </div>
            <div
              className={
                "flex w-[14.28%] cursor-pointer flex-col text-center" +
                (selectedDate.getDate() === dates[6].getDate() ? " font-bold text-primary" : "")
              }
              onClick={() => handleDateSelect(dates[6])}
            >
              <span>{dates[6].getDate().toString()}</span>
              Saturday
            </div>
          </div>
          {/* Meal Cards */}
          <div className="mx-32 flex w-full flex-wrap gap-5">
            {mealData?.map((meal) => (
              <MealCard
                key={meal.id}
                {...meal}
                onDelete={handleMealCardDelete}
                onEdit={handleMealCardAddIngredient}
                onSave={handleMealCardSave}
              />
            ))}
            {/* Add meal button */}
            <div
              className={`${mealData == undefined ? "min-h-[300px]" : ""} flex w-[400px] flex-col items-center justify-center gap-2 bg-white shadow-default dark:bg-boxdark`}
              onClick={toggleMealForm}
            >
              <a className="flex h-15 w-15 cursor-pointer items-center justify-center rounded-[50%] bg-primary text-white">
                <svg
                  className="fill-white"
                  width="30"
                  height="30"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                >
                  <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z" />
                </svg>
              </a>
              <a className="text-lg font-semibold text-primary">Add meal</a>
            </div>
          </div>
        </div>
      </DefaultLayout>
      {mealFormActive && mealForm()}
    </>
  );
};

export default MealPlanner;
