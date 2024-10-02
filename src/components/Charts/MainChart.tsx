import { ApexOptions } from "apexcharts";
import { set } from "mongoose";
import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/router";
import Loader from "@/components/common/Loader";
import { format } from "path";

interface ChartOneState {
  series: {
    name: string;
    data: number[];
    dates: string[];
  }[];
}

interface ChartOneProps {
  date: Date;
  needsUpdate: boolean;
  update: () => void;
}

interface Stats {
  weight: number,
  calories: number,
  steps: number,
  water: number,
  exercise: number,
  date?: string,
};

const ChartOne: React.FC<ChartOneProps> = ({ date, needsUpdate, update }) => {

  const { user, error, isLoading } = useUser();

  if (isLoading) return <Loader />;
  if (error) return <div>{error.message}</div>;

  //redirect to /api/auth/login if user is not authenticated
  if (!user) {
    const router = useRouter();
    router.push("/api/auth/login");
    return <Loader />;
  }

  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  const [state, setState] = useState<ChartOneState>({
    series: [
      {
        name: "Product One",
        data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30, 45],
        dates: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
      },
    ],
  });
  
  const [minData, setMinData] = useState(0);
  const [maxData, setMaxData] = useState(100);  

  function calcMinMax(state: ChartOneState){
    let max = 0;
    let min = 1000000;
    for (let i = 0; i < state.series[0].data.length; i++){
      if (state.series[0].data[i] > max){
        max = state.series[0].data[i];
      }
      if (state.series[0].data[i] < min){
        min = state.series[0].data[i];
      }
    }
    if(min == 1000000){
      min = 0;
    }
    if (min == minData && max == maxData){
      setMinData(minData + 0.001);
    } else {
      setMinData(min);
      setMaxData(max);    
    }
  }

  const [options, setOptions] = useState<ApexOptions>({
    legend: {
      show: false,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#3C50E0", "#80CAEE"],
    chart: {
      fontFamily: "Satoshi, sans-serif",
      height: 335,
      type: "area",
      dropShadow: {
        enabled: true,
        color: "#623CEA14",
        top: 10,
        blur: 4,
        left: 0,
        opacity: 0.1,
      },
  
      toolbar: {
        show: false,
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 300,
          },
        },
      },
      {
        breakpoint: 1366,
        options: {
          chart: {
            height: 350,
          },
        },
      },
    ],
    stroke: {
      width: [2, 2],
      curve: "straight",
    },
    // labels: {
    //   show: false,
    //   position: "top",
    // },
    grid: {
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,      
    },
    markers: {
      size: 4,
      colors: "#fff",
      strokeColors: ["#3056D3", "#80CAEE"],
      strokeWidth: 3,
      strokeOpacity: 0.9,
      strokeDashArray: 0,
      fillOpacity: 1,
      discrete: [],
      hover: {
        size: undefined,
        sizeOffset: 5,
      },
    },
    xaxis: {
      type: "category",
      categories: state.series[0].dates,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        style: {
          fontSize: "0px",
        },
      },
      min: minData,
      max: maxData,
    },
  });

  function formatDate(date: Date) {
    let d = date;
    let day = d.getDate();
    let month = d.getMonth() + 1;
    let year = d.getFullYear();
    let formattedDate = day + "/" + month + "/" + year;
    return formattedDate;
  }

  function sortDates(stats: [any], reverse: boolean){
    return stats.sort((a: { date: string; }, b: { date: string; }) => {
      //dd/mm/yyyy
      // get dd, mm, yyyy
      let ddA = a.date?.split("/")[0];
      let ddB = b.date?.split("/")[0];
      let mmA = a.date?.split("/")[1];
      let mmB = b.date?.split("/")[1];
      let yyyyA = a.date?.split("/")[2];
      let yyyyB = b.date?.split("/")[2];
      //compare
      if (reverse) {
        if (yyyyA !== yyyyB) {
          return parseInt(yyyyA) - parseInt(yyyyB);
        }
        if (mmA !== mmB) {
          return parseInt(mmA) - parseInt(mmB);
        }
        return parseInt(ddA) - parseInt(ddB);
      }      
      if (yyyyA !== yyyyB) {
        return parseInt(yyyyB) - parseInt(yyyyA);
      }
      if (mmA !== mmB) {
        return parseInt(mmB) - parseInt(mmA);
      }
      return parseInt(ddB) - parseInt(ddA);          
    })
  }

  //0 = daily, 1 = weekly, 2 = monthly
  const [dateType, setDateType] = useState(0);
  const handleDateChange = (e: React.MouseEvent<HTMLButtonElement>) => {
    if(e.currentTarget.textContent == "Week"){
      setDateType(0);
    }
    if(e.currentTarget.textContent == "Weekly (Avg.)"){
      setDateType(1);
    }
    if(e.currentTarget.textContent == "Monthly (Avg.)"){
      setDateType(2);
    }
  }

  
  const [measurement, setMeasurement] = useState("kg");
  const [chartType, setChartType] = useState("weight");
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {    
    if(e.target.value == "weight"){
      setChartType("weight");
      setMeasurement("kg");
    }
    if(e.target.value == "calories"){
      setChartType("calories");
      setMeasurement("cals burned");
    }
    if(e.target.value == "steps"){
      setChartType("steps");
      setMeasurement("steps");
    }
    if(e.target.value == "water"){
      setChartType("water");
      setMeasurement("L");
    }
    if(e.target.value == "exercise"){
      setChartType("exercise");
      setMeasurement("mins");
    }
  }

  const [thisWeekStats, setThisWeekStats] = useState<[Stats]>();
  const [weeklyStats, setWeeklyStats] = useState<[Stats]>();
  const [monthlyStats, setMonthlyStats] = useState<[Stats]>();

  function LoadThisWeekStats() {
    //Get dates
    let datesOfWeek: string[] = []
    let curr = new Date(selectedDate);    
    for (let i = 1; i <= 7; i++) {      
      let first = curr.getDate() - curr.getDay() + i;  
      if (curr.getDay() === 0) first -= 7; // adjust when sunday
      let day = new Date(curr.setDate(first)).toISOString().slice(0, 10);
      datesOfWeek.push(formatDate(new Date(day)));
    }    

    //fetch input
    let input = {
      email: user?.email,
      dates: datesOfWeek,
    };

    fetch("http://localhost:5000/api/getStatsByDate", {
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
        let weekStats = data.map((stat: any) => {          
          return {
            weight: stat.weight,
            calories: stat.calories,
            steps: stat.steps,
            water: stat.water,
            exercise: stat.exercise,
            date: stat.date,
          };                  
        });            
        if (weekStats.length < 7) {
          let missingDates = datesOfWeek.filter((date) => !weekStats.some((stat: { date: string; }) => stat.date === date));
          missingDates.forEach((date) => {
            weekStats.push({
              weight: 0,
              calories: 0,
              steps: 0,
              water: 0,
              exercise: 0,
              date: date,
            });
          });
        }  
        //fill undefined with 0          
        weekStats.forEach((stat: { weight: number | undefined; calories: number | undefined; steps: number | undefined; water: number | undefined; exercise: number | undefined; }) => {
          if (stat.weight === undefined) {
            stat.weight = 0;
          }
          if (stat.calories === undefined) {
            stat.calories = 0;
          }
          if (stat.steps === undefined) {
            stat.steps = 0;
          }
          if (stat.water === undefined) {
            stat.water = 0;
          }
          if (stat.exercise === undefined) {
            stat.exercise = 0;
          }
        });
        weekStats = sortDates(weekStats, true);
        setThisWeekStats(weekStats);  
      })              
      .catch((error) => {
        console.error("Loading weekly stats failed:", error);
      });
  }

  function LoadWeeklyStats(){
    //get dates for the last 8 weeks
    let dates: string[] = [];
    let curr = new Date(selectedDate);
    let first = new Date(curr.setDate(curr.getDate() + 7));
    for (let i = 0; i < 7; i++) {
      var day = new Date(first.setDate(first.getDate() - 7));
      dates.push(formatDate(day));
    }
    let input = {
      email: user?.email,
      dates: dates,
    };
    
    fetch("http://localhost:5000/api/getStatsByDate", {
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
        let weekStats = data.map((stat: any) => {          
          return {
            weight: stat.weight,
            calories: stat.calories,
            steps: stat.steps,
            water: stat.water,
            exercise: stat.exercise,
            date: stat.date,
          };                  
        });            
        if (weekStats.length < 7) {
          let missingDates = dates.filter((date) => !weekStats.some((stat: { date: string; }) => stat.date === date));
          missingDates.forEach((date) => {
            weekStats.push({
              weight: 0,
              calories: 0,
              steps: 0,
              water: 0,
              exercise: 0,
              date: date,
            });
          });
        }  
        //fill undefined with 0          
        weekStats.forEach((stat: { weight: number | undefined; calories: number | undefined; steps: number | undefined; water: number | undefined; exercise: number | undefined; }) => {
          if (stat.weight === undefined) {
            stat.weight = 0;
          }
          if (stat.calories === undefined) {
            stat.calories = 0;
          }
          if (stat.steps === undefined) {
            stat.steps = 0;
          }
          if (stat.water === undefined) {
            stat.water = 0;
          }
          if (stat.exercise === undefined) {
            stat.exercise = 0;
          }
        });        
        
        weekStats = sortDates(weekStats, true);
        setWeeklyStats(weekStats);   
      })              
      .catch((error) => {
        console.error("Loading weekly stats failed:", error);
      });
  }

  function LoadMonthlyStats(){
    // Get every day within the last 7 months
    let dates: string[] = [];
    let curr = new Date(selectedDate); // Assuming selectedDate is the reference date
    
    // Helper function to get days in a month
    function getDaysInMonth(year: number, month: number): string[] {
      let date = new Date(year, month, 1);
      let days: string[] = [];
      while (date.getMonth() === month) {
        days.push(formatDate(new Date(date))); // Push formatted date
        date.setDate(date.getDate() + 1); // Increment the day
      }
      return days;
    }

    // Loop through the last 7 months and get all dates
    for (let i = 0; i < 7; i++) {
      let year = curr.getFullYear();
      let month = curr.getMonth();
      dates = dates.concat(getDaysInMonth(year, month)); // Add all days of the month to dates array
      curr.setMonth(curr.getMonth() - 1); // Move to the previous month
    }
    let input = {
      email: user?.email,
      dates: dates,
    };
    fetch("http://localhost:5000/api/getStatsByDate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load monthly stats");
        }
        return response.json();
      })
      .then((data) => {   
        console.log(data); 
        data.forEach((stat: any) => {
          stat.date = formatDate(new Date(stat.date));
        });
        let monthStats = data.map((stat: any) => {          
          return {
            weight: stat.weight,
            calories: stat.calories,
            steps: stat.steps,
            water: stat.water,
            exercise: stat.exercise,
            date: stat.date,
          };                  
        });        
          
        monthStats = sortDates(monthStats, true);
        console.log(monthStats);
        setMonthlyStats(monthStats);
      })
      .catch((error) => {
        console.error("Loading monthly stats failed:", error);
      });
  }

  function updateChart() { 
    if (dateType === 0) { //this week       
      if (!thisWeekStats) {
        return;
      }              
      let days = thisWeekStats?.map((stat) => stat.date);
      let formattedStats: ChartOneState = {
        series: [{
          name: chartType,
          data: thisWeekStats?.map((stat) => stat.weight),
          dates: days.filter((day) => day !== undefined).map((day) => day!),
        }],
      };
      if (chartType === "calories") {
        formattedStats = {
          series: [{
              name: chartType,
              data: thisWeekStats?.map((stat) => stat.calories),
              dates: days.filter((day) => day !== undefined).map((day) => day!),
            }],
        };
      }
      if (chartType === "steps") {
        formattedStats = {
          series: [{
              name: chartType,
              data: thisWeekStats?.map((stat) => stat.steps),
              dates: days.filter((day) => day !== undefined).map((day) => day!),
            }],
        };
      }
      if (chartType === "water") {
        formattedStats = {
          series: [{
              name: chartType,
              data: thisWeekStats?.map((stat) => stat.water),
              dates: days.filter((day) => day !== undefined).map((day) => day!),
            }],
        };
      }
      if (chartType === "exercise") {
        formattedStats = {
          series: [{
              name: chartType,
              data: thisWeekStats?.map((stat) => stat.exercise),
              dates: days.filter((day) => day !== undefined).map((day) => day!),
            }],
        };
      };      
      setState(formattedStats);
    }
    if (dateType === 1) {
      if (!weeklyStats) {
        return;
      }
      let formattedStats: ChartOneState = {
        series: [{
          name: chartType,
          data: weeklyStats?.map((stat) => stat.weight),
          dates: weeklyStats?.map((stat) => stat.date).filter((date) => date !== undefined) as string[],
        }],
      };
      if (chartType === "calories") {
        formattedStats = {
          series: [{
              name: chartType,
              data: weeklyStats?.map((stat) => stat.calories),
              dates: weeklyStats?.map((stat) => stat.date).filter((date) => date !== undefined) as string[],
            }],
        };
      }
      if (chartType === "steps") {
        formattedStats = {
          series: [{
              name: chartType,
              data: weeklyStats?.map((stat) => stat.steps),
              dates: weeklyStats?.map((stat) => stat.date).filter((date) => date !== undefined) as string[],
            }],
        };
      }
      if (chartType === "water") {
        formattedStats = {
          series: [{
              name: chartType,
              data: weeklyStats?.map((stat) => stat.water),
              dates: weeklyStats?.map((stat) => stat.date).filter((date) => date !== undefined) as string[],
            }],
        };
      }
      if (chartType === "exercise") {
        formattedStats = {
          series: [{
              name: chartType,
              data: weeklyStats?.map((stat) => stat.exercise),
              dates: weeklyStats?.map((stat) => stat.date).filter((date) => date !== undefined) as string[],
            }],
        };
      };  
      setState(formattedStats);
    }
    if (dateType === 2) {
      if(!monthlyStats){
        return;
      }
      let formattedStats: ChartOneState = {
        series: [{
          name: chartType,
          data: monthlyStats?.map((stat) => stat.weight),
          dates: monthlyStats?.map((stat) => stat.date).filter((date) => date !== undefined) as string[],
        }],
      };
      if (chartType === "calories") {
        formattedStats = {
          series: [{
              name: chartType,
              data: monthlyStats?.map((stat) => stat.calories),
              dates: monthlyStats?.map((stat) => stat.date).filter((date) => date !== undefined) as string[],
            }],
        };
      }
      if (chartType === "steps") {
        formattedStats = {
          series: [{
              name: chartType,
              data: monthlyStats?.map((stat) => stat.steps),
              dates: monthlyStats?.map((stat) => stat.date).filter((date) => date !== undefined) as string[],
            }],
        };
      }
      if (chartType === "water") {
        formattedStats = {
          series: [{
              name: chartType,
              data: monthlyStats?.map((stat) => stat.water),
              dates: monthlyStats?.map((stat) => stat.date).filter((date) => date !== undefined) as string[],
            }],
        };
      }
      if (chartType === "exercise") {
        formattedStats = {
          series: [{
              name: chartType,
              data: monthlyStats?.map((stat) => stat.exercise),
              dates: monthlyStats?.map((stat) => stat.date).filter((date) => date !== undefined) as string[],
            }],
        };
      };  
      setState(formattedStats);
    }
  }

  useEffect(() => {
    LoadThisWeekStats();
    LoadWeeklyStats();
    LoadMonthlyStats();
    update();
  }, [selectedDate, needsUpdate]);

  useEffect(() => {
    updateChart();
  }, [chartType, dateType, thisWeekStats]); //this weekstats for inital page load

  useEffect(() => {
    calcMinMax(state);    
  }, [state]);

  useEffect(() => {    
    setOptions((prevState) => ({
      ...prevState,
      yaxis: {
        ...prevState.yaxis,
        min: minData,
        max: maxData,
      },
      xaxis: {
        ...prevState.xaxis,
        categories: state.series[0].dates,
      },
    }));        
    handleReset();
  }, [minData, maxData]);

  useEffect(() => {        
    handleReset();    
  }, [options]);
  
  const handleReset = () => {
    setState(state);
  };
  handleReset;  


  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
        <div className="flex w-full flex-wrap gap-3 sm:gap-5">
          <div className="flex min-w-47.5">            
            <div className="w-full">
              {/*
              <p className="font-semibold text-primary">Weight</p>
              <p className="text-sm font-medium">12.04.2022 - 12.05.2022</p>
              */}
              <div className="relative z-20 inline-block">
                <select
                name="option"
                id="option"
                className="relative z-20 inline-flex appearance-none bg-transparent py-1 pl-3 pr-8 text-large outline-none text-black dark:text-white font-semibold"
                onChange={handleChange}
                >
                <option value="weight" className="dark:bg-boxdark text-md">
                  Weight
                </option>
                <option value="calories" className="dark:bg-boxdark text-md">
                  Calories Burned
                </option>
                <option value="steps" className="dark:bg-boxdark text-md">
                  Steps
                </option>
                <option value="water" className="dark:bg-boxdark text-md">
                  Water
                </option>
                <option value="exercise" className="dark:bg-boxdark text-md">
                  Exercise
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
        </div>
        <div className="flex w-full max-w-45 justify-end">
          <div className="inline-flex items-center rounded-md bg-whiter p-1.5 dark:bg-meta-4">
            <button 
              className={`rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark ${dateType === 0 ? "bg-white dark:bg-boxdark shadow-card" : ""}`}
              onClick={(e) => handleDateChange(e)}
            >
              Week
            </button>
            <button 
              className={`rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark ${dateType === 1 ? "bg-white dark:bg-boxdark shadow-card" : ""}`}
              onClick={(e) => handleDateChange(e)}
            >
              Weekly (Avg.)
            </button>
            <button 
              className={`rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark ${dateType === 2 ? "bg-white dark:bg-boxdark shadow-card" : ""}`}
              onClick={(e) => handleDateChange(e)}
            >
              Monthly (Avg.)
            </button>
          </div>
        </div>
      </div>

      <div>
        <div id="chartOne" className="-ml-5">          
          <ReactApexChart      
            options={options}
            series={state.series}
            type="area"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartOne;
