"use client";
import React, { use, useCallback, useEffect } from "react";
import MainChart from "../Charts/MainChart";
import CalorieChart from "../Charts/CalorieChart";
import MacroChart from "../Charts/MacroChart";
import ChartOne from "../Charts/ChartOne";
import ChartThree from "../Charts/ChartThree";
import ChartTwo from "../Charts/ChartTwo";
import ChatCard from "../Chat/ChatCard";
import FitnessCard from "../Fitness/FitnessCard";
import TableOne from "../Tables/TableOne";
import CardDataStats from "../CardDataStats";
import MapOne from "../Maps/MapOne";
import { useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "@auth0/nextjs-auth0/client";
import Loader from "@/components/common/Loader";
import DatePickerOne from "@/components/FormElements/DatePicker/DatePickerOne";
import { set } from "mongoose";
import { format } from "path";
import { stat } from "fs";
import Chart from "../Charts/page";

interface Stats {
  weight: number,
  calories: number,
  steps: number,
  water: number,
  exercise: number,
  date?: string,
};

interface Measurements {
  gender: string;
  age: number;
  height: number;
  weight: number;
  activity: number;
  calories: number;
}

interface ChartOneState {
  series: {
    name: string;
    data: any;
    dates: any;
  }[];
}

interface ChartTwoState {
  series: {
    name: string;
    data: number[];
    dates: any;
  }[];
}

interface ChartThreeState {
  series: number[];
}

const ECommerce: React.FC = () => {  
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

  let firstName = "User";
  if (user.name !== undefined && user.name !== null) {
    firstName = user.name.split(" ")[0];
  }

  const [selectedDate, setSelectedDate] = useState(new Date());

  function formatDate(date: Date) {
    let d = date;
    let day = d.getDate();
    let month = d.getMonth() + 1;
    let year = d.getFullYear();
    let formattedDate = day + "/" + month + "/" + year;
    return formattedDate;
  }

  function yesterdayDate(date: Date) {
    let d = date;
    let day = d.getDate() - 1;
    let month = d.getMonth() + 1;
    let year = d.getFullYear();
    let formattedDate = day + "/" + month + "/" + year;
    return formattedDate;
  }

  const handleDate = (date: string) => {
    let d = new Date(date);
    d.setHours(d.getHours() + 1);
    setSelectedDate(new Date(d));
  }

  const [stats, setStats] = useState<Stats>({
    weight: 0,
    calories: 0, //cals burned
    steps: 0,
    water: 0,
    exercise: 0,
  });

  const [yesterdayStats, setYesterdayStats] = useState<Stats>({
    weight: 0,
    calories: 0,
    steps: 0,
    water: 0,
    exercise: 0,
  });

  const [totals, setTotals] = useState({
    weight: "0",
    calories: "0",
    steps: "0",
    water: "0",
    exercise: "0",
  });


  function calculateTotal(yStat: number, stat: number) {
    if (yStat === 0 && stat === 0) {
      return "0%";
    }
    if (yStat === 0 && stat !== 0) {
      return "100%";
    }
    if (yStat !== 0 && stat === 0) {
      return "-100%";
    }
    if (yStat !== 0 && stat !== 0) {
      return ((((stat - yStat) / yStat) * 100).toFixed(0) + "%");
    }
  }

  //function to calculate the difference between today's and yesterday's stats as a percentage
  function calculateTotals() {        
    let weight = calculateTotal(yesterdayStats.weight, stats.weight);
    let calories = calculateTotal(yesterdayStats.calories, stats.calories);
    let steps = calculateTotal(yesterdayStats.steps, stats.steps);
    let water = calculateTotal(yesterdayStats.water, stats.water);
    let exercise = calculateTotal(yesterdayStats.exercise, stats.exercise);

    setTotals({
      weight: weight ?? "0%",
      calories: calories ?? "0%",
      steps: steps ?? "0%",
      water: water ?? "0%",
      exercise: exercise ?? "0%",
    })
  }

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
        if (!data.message) {
          setStats({  
            weight: data.weight,
            calories: data.calories,
            steps: data.steps,
            water: data.water,
            exercise: data.exercise
          });
        }
        if (data.message){
          setStats({
            weight: 0,
            calories: 0,
            steps: 0,
            water: 0,
            exercise: 0,
          })
        }
      })
      .catch((error) => {
        console.error("Loading stats failed:", error);
      });

    let input2 = {
      email: user?.email,
      date: yesterdayDate(selectedDate),
    };

    fetch("http://localhost:5000/api/getStats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input2),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load stats");
        }
        return response.json();
      })
      .then((data) => {
        if (!data.message){
          setYesterdayStats({
            weight: data.weight,
            calories: data.calories,
            steps: data.steps,
            water: data.water,
            exercise: data.exercise
          });                 
        }
        if (data.message){
          setYesterdayStats({
            weight: 0,
            calories: 0,
            steps: 0,
            water: 0,
            exercise: 0,
          })
        }
      })
      .catch((error) => {
        console.error("Loading stats failed:", error);
      });      
  }

  useEffect(() => {
    calculateTotals();
  }, [stats, yesterdayStats]);

  const [statsUpdated, setStatsUpdated] = useState(false);
  if (!statsUpdated) {
    LoadStats();
    setStatsUpdated(true);
  }

  const [updating, setUpdating] = useState(false);
  const handleUpdate = () => {
    setUpdating(!updating);
  }

  const handleChange = (value: any, name: string) => {
    let newStats = {
      weight: stats.weight,
      calories: stats.calories,
      steps: stats.steps,
      water: stats.water,
      exercise: stats.exercise,
    };
    newStats = { ...newStats, [name]: value };
    setStats(newStats);
  }


  const [chartOneNeedsUpdate, setChartOneNeedsUpdate] = useState(false);

  function SaveStats () {
    let currentDate = false;
    if (formatDate(selectedDate) === formatDate(new Date())){
      currentDate = true;
    }
    let input = {
      email: user?.email,
      date: formatDate(selectedDate),
      weight: stats.weight,
      calories: stats.calories,
      steps: stats.steps,
      water: stats.water,
      exercise: stats.exercise,
      currentDate: currentDate,
    };
    //api call to load meals
    fetch("http://localhost:5000/api/saveStats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to save stats");
        }
        return response.json();
      })
      .then((data) => {        
        setChartOneNeedsUpdate(true);
      })
      .catch((error) => {
        console.error("Saving stats failed:", error);
      });
  }

  const handleSave = () => {
    SaveStats();
    setUpdating(!updating);
  }

  //Charts

  const chartOneUpdate = () => {
    setChartOneNeedsUpdate(false);
  }

  //Chart Two

  //get target calories from measurements
  const [measurements, setMeasurements] = useState<Measurements>();
  
  function LoadMeasurements(){
    let input = {
      email: user?.email,
    };
    //get measurements
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
        setMeasurements(data);        
      })
  }
  if (!measurements) {
    LoadMeasurements();
  }

  //get chart two data
  const [chartTwoThisWeek, setChartTwoThisWeek] = useState<ChartTwoState>();
  const [chartTwoPrevWeek, setChartTwoPrevWeek] = useState<ChartTwoState>();
  const [chartTwoType, setChartTwoType] = useState<number>(0);

  function sortMealDates(meals: any){
    return meals.sort((a: { date: string; }, b: { date: string; }) => {
      //dd/mm/yyyy
      // get dd, mm, yyyy
      let ddA = a.date?.split("/")[0];
      let ddB = b.date?.split("/")[0];
      let mmA = a.date?.split("/")[1];
      let mmB = b.date?.split("/")[1];
      let yyyyA = a.date?.split("/")[2];
      let yyyyB = b.date?.split("/")[2];
      //compare
      if (yyyyA !== yyyyB) {
        return parseInt(yyyyA) - parseInt(yyyyB);
      }
      if (mmA !== mmB) {
        return parseInt(mmA) - parseInt(mmB);
      }
      return parseInt(ddA) - parseInt(ddB);          
    })
  }

  //Chart Three
  const [chartThreeData, setChartThreeData] = useState<ChartThreeState>();

  function LoadCalories(){
    //get dates for this week
    let datesOfWeek: string[] = []
    let curr = new Date(new Date());    
    for (let i = 1; i <= 7; i++) {      
      let first = curr.getDate() - curr.getDay() + i;  
      if (curr.getDay() === 0) first -= 7; // adjust when sunday
      let day = new Date(curr.setDate(first)).toISOString().slice(0, 10);
      datesOfWeek.push(formatDate(new Date(day)));
    }
    let input = {
      email: user?.email,
      dates: datesOfWeek,
    };
    //get meals for this week
    fetch("http://localhost:5000/api/getMealsByDate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load weekly stats");
        }
        return response.json();
      })
      .then((data) => {   
        if (!measurements) {
          return;
        }
        let mealCalories = [];
        for (let i = 0; i < data.length; i++){
          let meal = data[i].meal;
          let ingredients = meal.ingredients;
          let calories = 0;
          for (let j = 0; j < ingredients.length; j++){
            calories += ingredients[j].calories;
          }
          mealCalories.push({
            calories: calories,
            date: data[i].date,
          });
        }
        let weekMeals = mealCalories.map((meal: any) => {                    
          return {
            calories: meal.calories,
            remainingCalories: measurements.calories - meal.calories,
            date: meal.date,
          };                  
        });                 
        if (weekMeals.length < 7) {
          let missingDates = datesOfWeek.filter((date) => !weekMeals.some((stat: { date: string; }) => stat.date === date));
          missingDates.forEach((date) => {
            weekMeals.push({
              calories: 0,
              remainingCalories: measurements.calories,
              date: date,
            });
          });
        }  
        //fill undefined with 0          
        weekMeals.forEach((meal: { calories: number | undefined; remainingCalories: number | undefined}) => {
          if (meal.calories === undefined) {
            meal.calories = 0;
          }
          if (meal.remainingCalories === undefined) {
            meal.remainingCalories = 0;
          }
        });        
        weekMeals = sortMealDates(weekMeals);
        let formattedStats: ChartTwoState = {
          series: [{
              name: "Calories",
              data: weekMeals?.map((meal) => meal.calories),
              dates: weekMeals?.map((meal) => meal.date),
            },
            {
              name: "Remaining Calories",
              data: weekMeals?.map((meal) => meal.remainingCalories),
              dates: weekMeals?.map((meal) => meal.date),
            }],      
        };
        setChartTwoThisWeek(formattedStats);  
        
        //Load today's macros for chart 3
        for (let i = 0; i < data.length; i++){
          if (data[i].date == formatDate(selectedDate)){
            let meal = data[i].meal;
            let ingredients = meal.ingredients;
            let protein = 0;
            let carbs = 0;
            let fat = 0;
            for (let j = 0; j < ingredients.length; j++){
              protein += ingredients[j].protein;
              carbs += ingredients[j].carbs;
              fat += ingredients[j].fat;
            }
            let formattedStats: ChartThreeState = {
              series: [protein, carbs, fat],      
            };
            setChartThreeData(formattedStats);
          }
        }
      })              
      .catch((error) => {
        console.error("Loading weekly stats failed:", error);
      });      
  }

  //End of chart 3

  function LoadLastWeekCalories(){
        //previous week
        let datesOfLastWeek: string[] = [];
        let prevCurr = new Date(new Date().setDate(new Date().getDate() - 7));
        for (let i = 1; i <= 7; i++) {      
          let first = prevCurr.getDate() - prevCurr.getDay() + i;  
          if (prevCurr.getDay() === 0) first -= 7; // adjust when sunday
          let day = new Date(prevCurr.setDate(first)).toISOString().slice(0, 10);
          datesOfLastWeek.push(formatDate(new Date(day)));
        } 
        let input2 = {
          email: user?.email,
          dates: datesOfLastWeek,
        };
        fetch("http://localhost:5000/api/getMealsByDate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input2),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to load weekly stats");
            }
            return response.json();
          })
          .then((data) => {   
            if (!measurements) {
              return;
            }
            let mealCalories = [];
            for (let i = 0; i < data.length; i++){
              let meal = data[i].meal;
              let ingredients = meal.ingredients;
              let calories = 0;
              for (let j = 0; j < ingredients.length; j++){
                calories += ingredients[j].calories;
              }
              mealCalories.push({
                calories: calories,
                date: data[i].date,
              });
            }
            let weekMeals = mealCalories.map((meal: any) => {                    
              return {
                calories: meal.calories,
                remainingCalories: measurements.calories - meal.calories,
                date: meal.date,
              };                  
            });                 
            if (weekMeals.length < 7) {
              let missingDates = datesOfLastWeek.filter((date) => !weekMeals.some((stat: { date: string; }) => stat.date === date));
              missingDates.forEach((date) => {
                weekMeals.push({
                  calories: 0,
                  remainingCalories: measurements.calories,
                  date: date,
                });
              });
            }  
            //fill undefined with 0          
            weekMeals.forEach((meal: { calories: number | undefined; remainingCalories: number | undefined}) => {
              if (meal.calories === undefined) {
                meal.calories = 0;
              }
              if (meal.remainingCalories === undefined) {
                meal.remainingCalories = 0;
              }
            });        
            weekMeals = sortMealDates(weekMeals);
            let formattedStats: ChartTwoState = {
              series: [{
                  name: "Calories",
                  data: weekMeals?.map((meal) => meal.calories),
                  dates: weekMeals?.map((meal) => meal.date),
                },
                {
                  name: "Remaining Calories",
                  data: weekMeals?.map((meal) => meal.remainingCalories),
                  dates: weekMeals?.map((meal) => meal.date),
                }],      
            };
            setChartTwoPrevWeek(formattedStats);  
          })              
          .catch((error) => {
            console.error("Loading weekly stats failed:", error);
          });
  }

  useEffect(() => {
    LoadCalories();
    LoadLastWeekCalories();
  }, [measurements]);

  const handleChartTwoDateChange = useCallback((type: number) => {
    setChartTwoType(type);
  }, [chartTwoType]);

  //End of chart 2

  useEffect(() => {
    LoadStats();
  }, [selectedDate]);

  return (
    <>
      <div className="flex justify-between my-2">   
        <div className="bg-white dark:bg-black">
          <DatePickerOne
            selectedDate={selectedDate.toString()}
            onDateSelect={handleDate}
          />
        </div>             
        <div className="flex text-3xl text-black dark:text-white items-center justify-center">
          <h2> Welcome back, {firstName} </h2>
        </div>
        {!updating && (
        <button className="rounded bg-primary px-3 py-1 text-white hover:bg-opacity-80" onClick={handleUpdate}>
          <div className="flex gap-2 justify-center items-center">
          Enter daily stats
          <svg
              className="fill-white"
              width="10"
              height="11"
              viewBox="0 0 10 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.64284 7.69237L9.09102 4.33987L10 5.22362L5 10.0849L-8.98488e-07 5.22362L0.908973 4.33987L4.35716 7.69237L4.35716 0.0848701L5.64284 0.0848704L5.64284 7.69237Z"
                fill=""
              />
            </svg>
        </div>        
        </button>
        )}        
        {updating && (
          <button className="rounded bg-primary px-3 py-1 text-white hover:bg-opacity-80" onClick={handleSave}>
          <div className="flex gap-2 justify-center items-center">
          Save
          </div>
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-5 2xl:gap-7.5">        
        <CardDataStats 
          title="Weight" 
          total={stats.weight ? stats.weight.toString() : "0"} 
          rate={totals.weight ? totals.weight : "0%"} 
          levelUp={totals.weight && totals.weight.includes("-") ? false : true}
          unit="kg" 
          update={updating} 
          onChange={(value) => handleChange(value, "weight")}
        >
          <svg
            className="fill-primary dark:fill-white"
            width="22"
            height="22"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g transform="translate(-25.00, -25.00) scale(1.50, 1.50)">
              <path d="M59.5,20.5a3.9,3.9,0,0,0-2.5-2,4.3,4.3,0,0,0-3.3.5,11.9,11.9,0,0,0-3.2,3.5,26,26,0,0,0-2.3,4.4,76.2,76.2,0,0,0-3.3,10.8,120.4,120.4,0,0,0-2.4,14.2,11.4,11.4,0,0,1-3.8-4.2c-1.3-2.7-1.5-6.1-1.5-10.5a4,4,0,0,0-2.5-3.7,3.8,3.8,0,0,0-4.3.9,27.7,27.7,0,1,0,39.2,0,62.4,62.4,0,0,1-5.3-5.8A42.9,42.9,0,0,1,59.5,20.5ZM58.4,70.3a11.9,11.9,0,0,1-20.3-8.4s3.5,2,9.9,2c0-4,2-15.9,5-17.9a21.7,21.7,0,0,0,5.4,7.5,11.8,11.8,0,0,1,3.5,8.4A12,12,0,0,1,58.4,70.3Z"></path>
            </g>
          </svg>
        </CardDataStats>
        <CardDataStats title="Calories burned" 
        total={stats.calories ? stats.calories.toString() : "0"} 
        rate={totals.calories ? totals.calories : "0%"} 
        levelUp={totals.calories && totals.calories.includes("-") ? false : true}
        unit="" update={updating} onChange={(value) => handleChange(value, "calories")}>
          <svg
            className="fill-primary dark:fill-white"
            width="22"
            height="22"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g transform="translate(-25.00, -25.00) scale(1.50, 1.50)">
              <path d="M59.5,20.5a3.9,3.9,0,0,0-2.5-2,4.3,4.3,0,0,0-3.3.5,11.9,11.9,0,0,0-3.2,3.5,26,26,0,0,0-2.3,4.4,76.2,76.2,0,0,0-3.3,10.8,120.4,120.4,0,0,0-2.4,14.2,11.4,11.4,0,0,1-3.8-4.2c-1.3-2.7-1.5-6.1-1.5-10.5a4,4,0,0,0-2.5-3.7,3.8,3.8,0,0,0-4.3.9,27.7,27.7,0,1,0,39.2,0,62.4,62.4,0,0,1-5.3-5.8A42.9,42.9,0,0,1,59.5,20.5ZM58.4,70.3a11.9,11.9,0,0,1-20.3-8.4s3.5,2,9.9,2c0-4,2-15.9,5-17.9a21.7,21.7,0,0,0,5.4,7.5,11.8,11.8,0,0,1,3.5,8.4A12,12,0,0,1,58.4,70.3Z"></path>
            </g>
          </svg>
        </CardDataStats>
        <CardDataStats title="Steps" 
        total={stats.steps ? stats.steps.toString() : "0"} 
        rate={totals.steps ? totals.steps : "0%"}
        levelUp={totals.steps && totals.steps.includes("-") ? false : true}
        unit="" update={updating} onChange={(value) => handleChange(value, "steps")}>
          <svg
            className="fill-primary dark:fill-white"
            width="22"
            height="22"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
          <path transform="translate(-5, 10) scale(0.17, 0.17)"
           d="M416 0C352.3 0 256 32 256 32V160c48 0 76 16 104 32s56 32 104 32c56.4 0 176-16 176-96S512 0 416 0zM128 96c0 35.3 28.7 64 64 64h32V32H192c-35.3 0-64 28.7-64 64zM288 512c96 0 224-48 224-128s-119.6-96-176-96c-48 0-76 16-104 32s-56 32-104 32V480s96.3 32 160 32zM0 416c0 35.3 28.7 64 64 64H96V352H64c-35.3 0-64 28.7-64 64z"/>
          </svg>
        </CardDataStats>
        <CardDataStats 
          title="Exercise" 
          total={stats.exercise ? stats.exercise.toString() : "0"} 
          rate={totals.exercise ? totals.exercise : "0%"} 
          levelUp={totals.exercise && totals.exercise.includes("-") ? false : true}
          unit="m" update={updating} onChange={(value) => handleChange(value, "exercise")}>
          <svg
            className="fill-primary dark:fill-white"
            width="22"
            height="18"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g transform="translate(-5, 0) scale(0.22, 0.22)">
              <path d="M181.365,439.108l-2.159-10.138c-3.985-18.722-14.771-66.099-28.774-101.521 c-6.81-17.229-19.891-19.294-39.049-20.48c-10.095-0.623-20.463-1.263-29.218-6.161l-8.141-4.548 c-44.271-24.713-58.402-33.084-61.056-44.749l-0.265-1.186l-0.043-1.22c-0.631-18.466,40.9-113.613,55.646-131.772 c12.749-15.701,33.203-26.479,60.791-32c1.263-0.256,2.611-0.401,3.942-0.401c11.725,0,18.594,9.839,20.907,18.27 c3.456,12.493-0.375,28.604-16.964,34.398c-1.792,0.631-3.755,0.956-5.811,0.956c-5.402,0-10.735-2.313-15.019-4.173 c-3.268-1.417-6.511-2.825-8.926-2.825c-0.691,0-1.271,0.128-1.886,0.393c-1.306,0.555-2.236,1.698-2.884,3.507 c-2.091,5.726-5.018,18.739-8.115,32.538c-3.447,15.292-6.827,30.251-9.643,38.741c-1.382,4.147-1.51,6.682-0.393,7.706 c0.649,0.597,0.905,0.649,1.553,0.649c2.799,0,7.774-2.099,12.16-3.951c10.513-4.412,21.683-8.704,32.751-8.704 c8.585,0,16.282,2.586,22.869,7.671c2.918,2.27,5.444,4.395,7.765,6.349c10.607,8.96,15.974,12.646,25.574,12.646 c4.89,0,10.735-0.973,17.869-2.987c6.639-1.869,13.158-4.608,21.12-8.875l6.118-3.277l6.084,3.345 c6.784,3.721,12.791,5.606,17.835,5.606c5.043,0,11.042-1.894,17.835-5.606l6.084-3.345l6.118,3.277 c7.962,4.267,14.473,7.006,21.12,8.883c7.134,1.997,12.988,2.978,17.886,2.978c9.6,0,14.959-3.695,24.917-12.109 c2.944-2.483,5.495-4.625,8.414-6.886c6.562-5.094,14.259-7.68,22.869-7.68c11.059,0,22.221,4.292,32.708,8.695 c4.412,1.869,9.378,3.959,12.186,3.959c0.649,0,0.913-0.051,1.553-0.64c1.126-1.041,1.007-3.558-0.375-7.697 c-2.867-8.661-6.451-24.593-9.617-38.647c-3.149-13.969-6.067-26.948-8.141-32.649c-0.87-2.381-2.057-3.14-2.876-3.49 c-0.58-0.247-1.178-0.375-1.894-0.375c-2.492,0-5.922,1.493-8.943,2.799c-4.523,1.963-9.609,4.173-14.985,4.173 c-2.057,0-4.019-0.324-5.845-0.964c-16.495-5.76-20.369-21.845-16.981-34.347c3.106-11.298,11.11-18.304,20.907-18.304 c1.22,0,2.492,0.111,3.831,0.367c27.674,5.521,48.137,16.29,60.919,32.009c14.686,18.108,56.277,112.683,55.765,130.978 l-0.034,1.212l-0.265,1.186c-2.722,12.373-17.86,21.376-61.227,45.585l-8.115,4.54c-8.747,4.89-19.115,5.53-29.15,6.161 c-19.217,1.195-32.299,3.26-39.108,20.489c-14.029,35.473-24.798,82.807-28.783,101.513l-2.159,10.138H181.365V439.108z" />
              <path d="M255.997,222.934c-25.267,0-64-42.906-64-80c0-38.818,28.706-70.4,64-70.4s64,31.582,64,70.4 C319.997,180.028,281.264,222.934,255.997,222.934z" />
              <path d="M453.612,109.252c-14.703-18.091-37.649-30.362-68.224-36.471 c-18.014-3.575-34.364,7.526-39.697,27.059c-5.086,18.628,1.903,41.728,25.114,49.852c11.401,3.934,21.598,0.085,28.74-2.961 c1.647,6.391,3.678,15.386,5.666,24.175c1.929,8.55,3.891,17.263,5.871,25.242c-16.034-6.178-39.689-12.322-60.561,3.874 c-3.328,2.577-6.204,5.001-8.823,7.211c-11.273,9.498-13.628,11.486-31.078,6.579c-2.884-0.811-5.453-2.091-8.175-3.183 c17.391-18.466,30.353-44.134,30.353-67.695c0-45.875-34.449-83.2-76.8-83.2s-76.8,37.325-76.8,83.2 c0,23.561,12.962,49.229,30.353,67.686c-2.722,1.092-5.291,2.372-8.183,3.191c-17.425,4.949-19.797,2.935-31.061-6.579 c-2.628-2.21-5.504-4.634-8.823-7.228c-20.898-16.162-44.51-10.035-60.553-3.866c1.911-7.689,3.9-16.512,5.854-25.165 c1.971-8.815,4.011-17.835,5.675-24.252c7.134,3.046,17.365,6.878,28.74,2.961c23.211-8.115,30.199-31.215,25.114-49.852 c-5.316-19.516-21.615-30.601-39.714-27.059c-30.575,6.11-53.521,18.389-68.224,36.489c-12.86,15.838-63.01,121.412-58.027,144.137 c4.087,18.637,22.622,28.996,67.447,54.025l8.141,4.548c11.315,6.323,23.697,7.091,34.637,7.765 c17.502,1.075,23.987,2.347,27.972,12.425c17.459,44.203,30.14,109.09,30.259,109.739c1.178,6.118,6.537,10.368,12.553,10.368 h146.825v-0.239c0.819,0.162,1.647,0.239,2.449,0.239c6.016,0,11.375-4.25,12.553-10.359c0.128-0.649,12.8-65.536,30.276-109.722 c3.985-10.086,10.479-11.358,27.972-12.433c10.923-0.674,23.322-1.434,34.637-7.765l8.098-4.523 c44.851-25.037,63.403-35.396,67.49-54.05C516.622,230.665,466.48,125.09,453.612,109.252z M204.797,142.934 c0-31.812,22.921-57.6,51.2-57.6s51.2,25.788,51.2,57.6s-34.133,67.2-51.2,67.2S204.797,174.746,204.797,142.934z M431.69,285.09 l-8.124,4.54c-6.212,3.473-14.711,4.002-23.714,4.565c-16.828,1.041-39.876,2.449-50.202,28.561 c-14.182,35.874-24.969,82.765-29.397,103.561H191.732c-4.429-20.796-15.206-67.686-29.389-103.561 c-10.325-26.112-33.374-27.529-50.202-28.561c-9.003-0.563-17.51-1.084-23.723-4.565l-8.149-4.548 c-30.95-17.271-53.299-29.764-54.81-36.412c-0.495-14.106,38.972-106.266,52.787-123.264c10.837-13.346,28.8-22.596,53.376-27.529 c6.622-1.365,9.523,7.023,9.984,8.713c0.41,1.485,3.584,14.575-8.849,18.927c-2.671,0.939-7.364-1.075-11.511-2.876 c-5.939-2.577-13.278-5.811-21.026-2.423c-3.166,1.365-7.441,4.361-9.796,10.871c-2.372,6.502-5.265,19.362-8.61,34.278 c-3.098,13.739-6.596,29.312-9.259,37.325c-1.152,3.465-4.651,14.012,3.063,21.154c7.885,7.296,17.365,3.328,27.383-0.913 c16.435-6.886,30.95-11.861,42.812-2.688c3.012,2.338,5.598,4.54,7.979,6.537c14.891,12.578,25.472,19.84,54.528,11.674 c8.755-2.458,16.512-6.059,23.697-9.916c7.97,4.378,16.128,7.194,23.996,7.194s16.026-2.816,23.996-7.194 c7.185,3.857,14.942,7.458,23.689,9.916c29.099,8.166,39.663,0.896,54.537-11.674c2.372-1.997,4.966-4.198,7.979-6.528 c11.853-9.199,26.377-4.215,42.803,2.671c10.01,4.241,19.499,8.209,27.383,0.913c7.723-7.134,4.224-17.673,3.072-21.137 c-2.662-8.038-6.178-23.646-9.276-37.427c-3.354-14.865-6.238-27.699-8.585-34.185c-2.372-6.511-6.647-9.498-9.813-10.871 c-7.74-3.328-15.104-0.154-21.035,2.423c-4.122,1.783-8.789,3.823-11.486,2.876c-12.459-4.352-9.276-17.451-8.875-18.927 c0.461-1.69,3.046-10.027,10.001-8.713c24.559,4.915,42.522,14.174,53.376,27.511c13.798,17.015,53.274,109.175,52.898,122.539 C485.023,255.318,462.649,267.802,431.69,285.09z" />
            </g>
          </svg>
        </CardDataStats>
        <CardDataStats 
          title="Water" 
          total={stats.water ? stats.water.toString() : "0"} 
          rate={totals.water ? totals.water : "0%"} 
          levelUp={totals.water && totals.water.includes("-") ? false : true}
          unit="L" update={updating} onChange={(value) => handleChange(value, "water")}>
          <svg
            className="fill-primary dark:fill-white"
            width="20"
            height="22"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g transform="translate(-25, -25) scale (1.50, 1.50)">
              <polygon
                className="fill-primary dark:fill-white"
                points="16.9 48.4 16.9 48.5 16.8 48.4 16.9 48.4"
              ></polygon>
              <polygon
                className="fill-primary dark:fill-white"
                points="16.9 48.4 16.9 48.5 16.8 48.4 16.9 48.4"
              ></polygon>
              <path
                className="fill-primary dark:fill-white"
                d="M75.1,61.3a25.1,25.1,0,1,1-50.2,0h0c0-15.9,14.3-22,20.9-44.5a4.5,4.5,0,0,1,5.4-3,4.5,4.5,0,0,1,3,3C60.9,39.4,75.1,45.3,75.1,61.3Z"
              ></path>
            </g>
          </svg>
        </CardDataStats>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <MainChart date={selectedDate} needsUpdate={chartOneNeedsUpdate} update={chartOneUpdate} />         
        <CalorieChart />
        <MacroChart date={selectedDate} />
        {/*                     
        {chartTwoThisWeek && (chartTwoType === 0) && (<ChartTwo chartState={chartTwoThisWeek} onDateChange={handleChartTwoDateChange} chartTypeState={chartTwoType}/>)}
        {chartTwoPrevWeek && (chartTwoType === 1) && (<ChartTwo chartState={chartTwoPrevWeek} onDateChange={handleChartTwoDateChange} chartTypeState={chartTwoType}/>)}
        {/*{chartTwoSeries ? (<ChartTwo chartState={chartTwoSeries} onDateChange={handleChartTwoDateChange}/>) : (<div></div>)}*/}
        {/*chartThreeData && (<ChartThree chartState={chartThreeData}/>)*/}
        {/*<MapOne />
        <div className="col-span-12 xl:col-span-8">
          <TableOne />
        </div>
        */}
        <FitnessCard />
        {/* <ChatCard /> */}
      </div>
    </>
  );
};

export default ECommerce;
