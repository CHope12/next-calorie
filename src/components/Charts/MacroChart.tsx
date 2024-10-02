import { ApexOptions } from "apexcharts";
import React, { use, useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/router";
import Loader from "@/components/common/Loader";

interface ChartThreeState {
  series: number[];
}

interface ChartThreeProps {
  date: Date;
}

interface Measurements {
  gender: string;
  age: number;
  height: number;
  weight: number;
  activity: number;
  calories: number;
}

const options: ApexOptions = {
  chart: {
    fontFamily: "Satoshi, sans-serif",
    type: "donut",
  },
  colors: ["#3C50E0", "#0FADCF", "#8FD0EF", "#555555"],
  labels: ["Carbs", "Protein", "Fat", "Remaining"],
  legend: {
    show: false,
    position: "bottom",
  },

  plotOptions: {
    pie: {
      donut: {
        size: "65%",
        background: "transparent",
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  responsive: [
    {
      breakpoint: 2600,
      options: {
        chart: {
          width: 380,
        },
      },
    },
    {
      breakpoint: 640,
      options: {
        chart: {
          width: 200,
        },
      },
    },
  ],
};

const ChartThree: React.FC<ChartThreeProps> = ({ date }) => {

  const { user, error, isLoading } = useUser();

  if (isLoading) return <Loader />;
  if (error) return <div>{error.message}</div>;

  //redirect to /api/auth/login if user is not authenticated
  if (!user) {
    const router = useRouter();
    router.push("/api/auth/login");
    return <Loader />;
  }

  const [state, setState] = useState<ChartThreeState>({ series: [0, 0, 0, 100] });

  function formatDate(date: Date) {
    let d = date;
    let day = d.getDate();
    let month = d.getMonth() + 1;
    let year = d.getFullYear();
    let formattedDate = day + "/" + month + "/" + year;
    return formattedDate;
  }
  
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

  const [macros, setMacros] = useState([0, 0, 0]);
  const [percentages, setPercentages] = useState([0, 0, 0]);

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

  function LoadCalories(){
    //get calories for selecteddate
    let input = {
      email: user?.email,
      dates: formatDate(date),
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
        if(data[0] !== undefined){ 
        let meal = data[0].meal;
        let ingredients = meal.ingredients;
        let protein = 0;
        let carbs = 0;
        let fat = 0;
        for (let j = 0; j < ingredients.length; j++){
          protein += ingredients[j].protein;
          carbs += ingredients[j].carbs;
          fat += ingredients[j].fat;
        }      
        setMacros([protein, carbs, fat]);
        } else {
          setMacros([0, 0, 0]);
        }
      })
      .catch((error) => {
        console.error("Loading weekly stats failed:", error);
      });      
  }

  useEffect(() => {
    if (measurements) {
      LoadCalories();
    }
  }, [measurements, date]);

  const handleReset = () => {
    setState((prevState) => ({
      ...prevState,
      series: [macros[0], macros[1], macros[2]]
    }));
  };
  handleReset;

  useEffect(() => {
    let total = macros[0] + macros[1] + macros[2];
    if (total == 0) setPercentages([0, 0, 0]);
    else setPercentages([macros[0] / total * 100, macros[1] / total * 100, macros[2] / total * 100]);
  }, [macros]);

  useEffect(() => {
    handleReset();
  }, [percentages]);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-4">
      <div className="mb-3 justify-between gap-4 sm:flex">
        <div>
          <h5 className="text-xl font-semibold text-black dark:text-white">
            Daily Macros
          </h5>
        </div>
      </div>      

      <>
      {(percentages[0] !== 0 || percentages[1] !== 0 || percentages[2] !== 0) ? (        
        <div className="flex flex-col justify-center h-[80%] items-center">
          <div className="mb-2">
            <div id="chartThree" className="mx-auto flex justify-center">
              <ReactApexChart
                options={options}
                series={state.series}
                type="donut"
              />
            </div>
          </div>        
          <div className="-mx-8 flex flex-wrap items-center justify-center gap-y-3">
            <div className="w-full px-8 sm:w-1/2">
              <div className="flex w-full items-center">
                <span className="mr-2 block h-3 w-full max-w-3 rounded-full bg-primary"></span>
                <p className="flex w-full justify-between text-sm font-medium text-black dark:text-white">
                  <span> Carbs </span>
                  <span> {Math.round(percentages[0]) + "%"} </span>
                </p>
              </div>
            </div>   
            <div className="w-full px-8 sm:w-1/2">
              <div className="flex w-full items-center">
                <span className="mr-2 block h-3 w-full max-w-3 rounded-full bg-[#0FADCF]"></span>
                <p className="flex w-full justify-between text-sm font-medium text-black dark:text-white">
                  <span> Protein </span>
                  <span> {Math.round(percentages[1]) + "%"} </span>
                </p>
              </div>
            </div>     
            <div className="w-full px-8 sm:w-1/2">
              <div className="flex w-full items-center">
                <span className="mr-2 block h-3 w-full max-w-3 rounded-full bg-[#8FD0EF]"></span>
                <p className="flex w-full justify-between text-sm font-medium text-black dark:text-white">
                  <span> Fat </span>
                  <span> {Math.round(percentages[2]) + "%"} </span>
                </p>
              </div>
            </div>
            <div className="w-full px-8 sm:w-1/2">
              <div className="flex w-full items-center">                        
              </div>
            </div>
          </div>  
        </div>      
        ) : (
        <div className="h-[80%] flex justify-center items-center text-center text-black dark:text-white">
          <p className="flex w-full justify-center text-md font-medium text-black dark:text-white"> We can't find any meals for this date! Add some in the meal planner. </p>
        </div>
        )}
      </>      

      <div className="my-2">
      <Link href="/mealplanner">
        <div className="py-2 font-md text-white bg-primary text-center">
          Go to Meal Planner
        </div>
      </Link>      
      </div>

    </div>
  );
};

export default ChartThree;
