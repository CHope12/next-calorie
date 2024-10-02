import { ApexOptions } from "apexcharts";
import React, { use, useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import Link from "next/link";

interface ChartThreeState {
  series: number[];
}

interface ChartThreeProps {
  chartState: ChartThreeState;
}

const options: ApexOptions = {
  chart: {
    fontFamily: "Satoshi, sans-serif",
    type: "donut",
  },
  colors: ["#3C50E0", "#0FADCF", "#8FD0EF"],
  labels: ["Carbs", "Protein", "Fat"],
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

const ChartThree: React.FC<ChartThreeProps> = ( props ) => {

  const [state, setState] = useState<ChartThreeState>(props.chartState);

  const handleReset = () => {
    setState((prevState) => ({
      ...prevState,
      series: [65, 34, 12, 56],
    }));
  };
  handleReset;

  const [macros, setMacros] = useState([0, 0, 0]);
  const [percentages, setPercentages] = useState([0, 0, 0]);

  useEffect(() => {
    setMacros([props.chartState.series[0], props.chartState.series[1], props.chartState.series[2]]);
  }, [props.chartState]);

  useEffect(() => {
    let total = macros[0] + macros[1] + macros[2];
    setPercentages([macros[0] / total * 100, macros[1] / total * 100, macros[2] / total * 100]);
  }, [macros]);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-4">
      <div className="mb-3 justify-between gap-4 sm:flex">
        <div>
          <h5 className="text-xl font-semibold text-black dark:text-white">
            Daily Macros
          </h5>
        </div>
      </div>      

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

      <div className="mt-2">
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
