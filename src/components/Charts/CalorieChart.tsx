import { ApexOptions } from "apexcharts";
import { set } from "mongoose";
import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/router";
import Loader from "@/components/common/Loader";

const options: ApexOptions = {
  colors: ["#3C50E0", "#80CAEE"],
  chart: {
    fontFamily: "Satoshi, sans-serif",
    type: "bar",
    height: 335,
    stacked: false,
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
  },

  responsive: [
    {
      breakpoint: 1536,
      options: {
        plotOptions: {
          bar: {
            borderRadius: 0,
            columnWidth: "25%",
          },
        },
      },
    },
  ],
  plotOptions: {
    bar: {
      horizontal: false,
      borderRadius: 0,
      columnWidth: "66%",
      borderRadiusApplication: "end",
      borderRadiusWhenStacked: "last",
    },
  },
  dataLabels: {
    enabled: false,
  },

  xaxis: {
    categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  legend: {
    position: "top",
    horizontalAlign: "left",
    fontFamily: "Satoshi",
    fontWeight: 500,
    fontSize: "14px",

    markers: {
      radius: 99,
    },
  },
  fill: {
    opacity: 1,
  },
};

interface ChartTwoState {
  series: {
    name: string;
    data: number[];
  }[];
}

interface Measurements {
  gender: string;
  age: number;
  height: number;
  weight: number;
  activity: number;
  calories: number;
}

const ChartTwo = () => {

  const { user, error, isLoading } = useUser();

  if (isLoading) return <Loader />;
  if (error) return <div>{error.message}</div>;

  //redirect to /api/auth/login if user is not authenticated
  if (!user) {
    const router = useRouter();
    router.push("/api/auth/login");
    return <Loader />;
  }

  const [chartDateType, setChartDateType] = useState(0);

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "This Week") {      
      setChartDateType(0);      
    }
    if (e.target.value === "Last Week") {      
      setChartDateType(1);
    }    
  };

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

  const [graphState, setGraphState] = useState<ChartTwoState>({
    series: [
      {
        name: "Intake",
        data: [0, 0, 0, 0, 0, 0, 0],
      },
      {
        name: "Remaining",
        data: [0, 0, 0, 0, 0, 0, 0],
      },
    ],
  });

  const [state, setState] = useState<ChartTwoState>({
    series: [
      {
        name: "Intake",
        data: [0, 0, 0, 0, 0, 0, 0],
      },
      {
        name: "Remaining",
        data: [0, 0, 0, 0, 0, 0, 0],
      },
    ],
  });

  const [lastWeekState, setLastWeekState] = useState<ChartTwoState>({
    series: [
      {
        name: "Intake",
        data: [0, 0, 0, 0, 0, 0, 0],
      },
      {
        name: "Remaining",
        data: [0, 0, 0, 0, 0, 0, 0],
      },
    ],
  });

  const [dates, setDates] = useState<string[]>([]);
  const [prevDates, setPrevDates] = useState<string[]>([]);

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
        if (data.length === 0) {
          return null;
        }
        let mealCalories = [];
        for (let i = 0; i < data.length; i++){
          let meal = data[i].meal;
          let ingredients = meal.ingredients;
          let calories = 0;
          for (let j = 0; j < ingredients.length; j++){
            calories += ingredients[j].calories;
          }
          if (mealCalories.length > 0) {
            mealCalories.forEach((meal: { calories: number | undefined; remainingCalories: number | undefined}) => {
              if (meal.date === data[i].date) {
                meal.calories += calories;
              }
            });          
          } else {
          mealCalories.push({
            calories: calories,
            date: data[i].date,
          });
        }
        }
        let weekMeals = mealCalories.map((meal: any) => {                    
          return {
            calories: meal.calories,
            remainingCalories: measurements.calories - meal.calories,
            date: meal.date,
          };                  
        });                     
        let missingDates = datesOfWeek.filter((date) => !weekMeals.some((stat: { date: string; }) => stat.date === date));
        missingDates.forEach((date) => {
          weekMeals.push({
            calories: 0,
            remainingCalories: measurements.calories,
            date: date,
          });
        });
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
            },
            {
              name: "Remaining Calories",
              data: weekMeals?.map((meal) => meal.remainingCalories),
            }],      
        };
        setState(formattedStats);  
        setDates(weekMeals.map((meal) => meal.date));            
      })              
      .catch((error) => {
        console.error("Loading weekly stats failed:", error);
      });      
  }

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
            },
            {
              name: "Remaining Calories",
              data: weekMeals?.map((meal) => meal.remainingCalories),
            }],      
        };
        setLastWeekState(formattedStats);  
        setPrevDates(weekMeals.map((meal) => meal.date));
      })              
      .catch((error) => {
        console.error("Loading weekly stats failed:", error);
      });
  }
    

  useEffect(() => {
    LoadMeasurements();
  }, [user]);

  useEffect(() => {
    if (measurements) {
      LoadCalories();
      LoadLastWeekCalories();
    }
  }, [measurements]);

  useEffect(() => {
    if (chartDateType == 0) {
      setGraphState((prevState) => ({
        ...prevState,
        series: prevState.series.map((serie, index) => ({
          ...serie,
          data: state.series[index].data,
        })),
      }));
    } 
    else {
    setGraphState((prevState) => ({
       ...prevState,
        series: prevState.series.map((serie, index) => ({
          ...serie,
          data: lastWeekState.series[index].data,
        })),
      }));
    }
  }, [chartDateType]);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded) {
      setGraphState((prevState) => ({
        ...prevState,
        series: prevState.series.map((serie, index) => ({
          ...serie,
          data: state.series[index].data,
        })),
      }));
  }}, [state]);

  const handleReset = () => {
    setGraphState((prevState) => ({
      ...prevState,
    }))
  };
  
  handleReset;

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <div className="mb-4 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Calorie Intake
          </h4>
        </div>
        <div>
          <div className="relative z-20 inline-block">
            <select
              name="#"
              id="#"
              className="relative z-20 inline-flex appearance-none bg-transparent py-1 pl-3 pr-8 text-sm font-medium outline-none"
              onChange={(e) => {
                handleDateChange(e);                
                handleReset();
              }}              
              value={chartDateType == 0 ? "This Week" : "Last Week"}
            >
              <option value="This Week" className="dark:bg-boxdark">
                This Week
              </option>
              <option value="Last Week" className="dark:bg-boxdark">
                Last Week
              </option>
            </select>
            <span className="absolute right-3 top-1/2 z-10 -translate-y-1/2">
              <svg
                width="10"
                height="6"
                viewBox="0 0 10 6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.47072 1.08816C0.47072 1.02932 0.500141 0.955772 0.54427 0.911642C0.647241 0.808672 0.809051 0.808672 0.912022 0.896932L4.85431 4.60386C4.92785 4.67741 5.06025 4.67741 5.14851 4.60386L9.09079 0.896932C9.19376 0.793962 9.35557 0.808672 9.45854 0.911642C9.56151 1.01461 9.5468 1.17642 9.44383 1.27939L5.50155 4.98632C5.22206 5.23639 4.78076 5.23639 4.51598 4.98632L0.558981 1.27939C0.50014 1.22055 0.47072 1.16171 0.47072 1.08816Z"
                  fill="#637381"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M1.22659 0.546578L5.00141 4.09604L8.76422 0.557869C9.08459 0.244537 9.54201 0.329403 9.79139 0.578788C10.112 0.899434 10.0277 1.36122 9.77668 1.61224L9.76644 1.62248L5.81552 5.33722C5.36257 5.74249 4.6445 5.7544 4.19352 5.32924C4.19327 5.32901 4.19377 5.32948 4.19352 5.32924L0.225953 1.61241C0.102762 1.48922 -4.20186e-08 1.31674 -3.20269e-08 1.08816C-2.40601e-08 0.905899 0.0780105 0.712197 0.211421 0.578787C0.494701 0.295506 0.935574 0.297138 1.21836 0.539529L1.22659 0.546578ZM4.51598 4.98632C4.78076 5.23639 5.22206 5.23639 5.50155 4.98632L9.44383 1.27939C9.5468 1.17642 9.56151 1.01461 9.45854 0.911642C9.35557 0.808672 9.19376 0.793962 9.09079 0.896932L5.14851 4.60386C5.06025 4.67741 4.92785 4.67741 4.85431 4.60386L0.912022 0.896932C0.809051 0.808672 0.647241 0.808672 0.54427 0.911642C0.500141 0.955772 0.47072 1.02932 0.47072 1.08816C0.47072 1.16171 0.50014 1.22055 0.558981 1.27939L4.51598 4.98632Z"
                  fill="#637381"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>

      <div>
        <div id="chartTwo" className="-mb-9 -ml-5">
          <ReactApexChart
            options={options}
            series={graphState.series}
            type="bar"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartTwo;
