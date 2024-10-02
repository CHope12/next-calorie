"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Image from "next/image";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import SelectGroupOne from "@/components/SelectGroup/SelectGroupOne";
import { use, useEffect, useState } from "react";
import { set } from "mongoose";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/router";
import Loader from "@/components/common/Loader";

interface MeasurementInterface {
  gender: string;
  age: number;
  height: number;
  weight: number;
  activity: number;
  calories: number;
}

const Measurements = () => {
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

  //get user's stats
  const [userMeasurements, setUserMeasurements] =
    useState<MeasurementInterface>();

  const [gender, setGender] = useState<string>("Male");
  const [age, setAge] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [weight, setWeight] = useState<number>(0);
  const [activity, setActivity] = useState<number>(1);

  function LoadMeasurements() {
    let measurements: MeasurementInterface = {
      gender: "",
      age: 0,
      height: 0,
      weight: 0,
      activity: 0,
      calories: 0,
    };

    let input = {
      email: user?.email,
    };

    // api call to get measurements
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
        measurements.gender = data.gender;
        measurements.age = data.age;
        measurements.height = data.height;
        measurements.weight = data.weight;
        measurements.activity = data.activity;
        measurements.calories = data.calories;
        setUserMeasurements(measurements);
        setGender(data.gender);
        setAge(data.age);
        setHeight(data.height);
        setWeight(data.weight);
        setActivity(data.activity);
      })
      .catch((error) => {
        console.error("Loading measurements failed:", error);
      });

    return measurements;
  }

  if (userMeasurements == null) {
    LoadMeasurements();
  }

  const handleStatsSave = () => {
    console.log(gender, age, height, weight, activity);
    if (gender === "" || age === 0 || height === 0 || weight === 0) {
      console.log("alert");
      return; // alert
    }
    if (userMeasurements === undefined) {
      return; // alert
    }
    SaveMeasurements(userMeasurements);
  };

  useEffect(() => {
    if (gender === "" || age === 0 || height === 0 || weight === 0) {
      return;
    }
    let cals = calculateCalories();
    let measurements: MeasurementInterface = {
      gender: gender,
      age: age,
      height: height,
      weight: weight,
      activity: activity,
      calories: cals,
    };
    setUserMeasurements(measurements);
  }, [gender, age, height, weight, activity]);

  function calculateCalories() {
    //BMR Men = 66.47 + (13.75 x weight in kg) + (5.003 x height in cm) - (6.75 x age in years)
    //BMR Women = 655.1 + (9.563 x weight in kg) + (1.850 x height in cm) - (4.676 x age in years)
    console.log("Calculating...");
    let bmr = 0;
    let activityLevelModifiers = [1.2, 1.375, 1.55, 1.725, 1.9];
    if (gender == "Male") {
      bmr = 66.47 + 13.75 * weight + 5.003 * height - 6.75 * age;
    } else {
      bmr = 655.1 + 9.563 * weight + 1.85 * height - 4.676 * age;
    }
    let amr = bmr * activityLevelModifiers[activity - 1];
    return Math.round(amr);
  }

  function SaveMeasurements(measurements: MeasurementInterface) {
    let input = {
      email: user?.email,
      gender: measurements.gender,
      age: measurements.age,
      height: measurements.height,
      weight: measurements.weight,
      activity: measurements.activity,
      calories: measurements.calories,
    };
    //api call to save meal
    fetch("http://localhost:5000/api/updateMeasurements", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to save measurements");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data.message); // Log success message
      })
      .catch((error) => {
        console.error("Saving measurements failed:", error);
      });
  }

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="Measurements" />

        <div className="grid grid-cols-5 gap-8">
          <div className="col-span-5 xl:col-span-3">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Measurements
                </h3>
              </div>
              <div className="p-7">
                <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-sm font-medium"
                      htmlFor="gender"
                    >
                      Gender
                    </label>
                    <div className="relative">
                      <div className="relative z-20 bg-transparent dark:bg-form-input">
                        <select
                          name="gender"
                          id="gender"
                          className={
                            "relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                          }
                          onChange={(e) => {
                            setGender(e.target.value);
                          }}
                        >
                          <option
                            value=""
                            disabled
                            className="text-body dark:text-bodydark"
                          >
                            Select your gender
                          </option>
                          <option
                            value="Male"
                            className="text-body dark:text-bodydark"
                            selected={
                              userMeasurements?.gender === undefined
                                ? false
                                : userMeasurements.gender === "Male"
                                  ? true
                                  : false
                            }
                          >
                            Male
                          </option>
                          <option
                            value="Female"
                            className="text-body dark:text-bodydark"
                            selected={
                              userMeasurements?.gender === undefined
                                ? false
                                : userMeasurements.gender === "Female"
                                  ? true
                                  : false
                            }
                          >
                            Female
                          </option>
                          <option
                            value="Other"
                            className="text-body dark:text-bodydark"
                            selected={
                              userMeasurements?.gender === undefined
                                ? false
                                : userMeasurements.gender === "Other"
                                  ? true
                                  : false
                            }
                          >
                            Other
                          </option>
                        </select>

                        <span className="absolute right-4 top-1/2 z-30 -translate-y-1/2">
                          <svg
                            className="fill-current"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.8">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                fill=""
                              ></path>
                            </g>
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-sm font-medium"
                      htmlFor="age"
                    >
                      Age
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      type="number"
                      name="age"
                      id="age"
                      onChange={(e) => {
                        if(e.target.value === ""){
                          setAge(0);
                          return;
                        }
                        setAge(parseInt(e.target.value));
                      }}
                      placeholder={
                        userMeasurements?.age === undefined
                          ? ""
                          : userMeasurements.age.toString()
                      }
                    />
                  </div>
                </div>

                <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-sm font-medium"
                      htmlFor="height"
                    >
                      Height (cm)
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      type="number"
                      name="height"
                      id="height"
                      onChange={(e) => {
                        if(e.target.value === ""){
                          setHeight(0);
                          return;
                        }
                        setHeight(parseInt(e.target.value));
                      }}
                      placeholder={
                        userMeasurements?.height === undefined
                          ? ""
                          : userMeasurements.height.toString()
                      }
                    />
                  </div>
                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-sm font-medium"
                      htmlFor="weight"
                    >
                      Weight (kg)
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="number"
                        name="weight"
                        id="weight"
                        onChange={(e) => {
                          if(e.target.value === ""){
                            setWeight(0);
                            return;
                          }
                          setWeight(parseInt(e.target.value));
                        }}
                        placeholder={
                          userMeasurements?.weight === undefined
                            ? ""
                            : userMeasurements.weight.toString()
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-5.5">
                  <label
                    className="mb-3 block text-sm font-medium"
                    htmlFor="activity"
                  >
                    Activity Level
                  </label>
                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                    <select
                      name="activity"
                      id="activity"
                      onChange={(e) => {
                        if (e.target.value === "Low") {
                          setActivity(1);
                        }
                        if (e.target.value === "Medium") {
                          setActivity(2);
                        }
                        if (e.target.value === "High") {
                          setActivity(3);
                        }
                      }}
                      className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    >
                      <option
                        value=""
                        disabled
                        className="text-body dark:text-bodydark"
                      >
                        Select your activity level
                      </option>
                      <option
                        value="Low"
                        className="text-body dark:text-bodydark"
                        selected={
                          userMeasurements?.activity === undefined
                            ? false
                            : userMeasurements.activity === 1
                              ? true
                              : false
                        }
                      >
                        Low - Sedentary (little or no exercise) or desk job
                      </option>
                      <option
                        value="Medium"
                        className="text-body dark:text-bodydark"
                        selected={
                          userMeasurements?.activity === undefined
                            ? false
                            : userMeasurements.activity === 2
                              ? true
                              : false
                        }
                      >
                        Medium - Light exercise or sports 1-3 days a week or
                        light job
                      </option>
                      <option
                        value="High"
                        className="text-body dark:text-bodydark"
                        selected={
                          userMeasurements?.activity === undefined
                            ? false
                            : userMeasurements.activity === 3
                              ? true
                              : false
                        }
                      >
                        High - Moderate exercise or sports 3-5 days a week or
                        active job
                      </option>
                    </select>

                    <span className="absolute right-4 top-1/2 z-30 -translate-y-1/2">
                      <svg
                        className="fill-current"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g opacity="0.8">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                            fill=""
                          ></path>
                        </g>
                      </svg>
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-4.5">
                  <button
                    className="flex justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:bg-opacity-90"
                    onClick={handleStatsSave}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-5 xl:col-span-2">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Estimated Daily Calories
                </h3>
              </div>
              <div className="p-7">
                <div className="block text-sm font-medium text-center">
                  Your estimated daily calories:
                </div>
                <div className="flex justify-center py-5 text-4xl text-black dark:text-white">
                  {userMeasurements?.calories === undefined
                    ? "0"
                    : userMeasurements.calories.toString()}
                </div>
                <div className="mb-3 block flex justify-center text-sm font-medium text-center">
                  Think of your calorie estimate as a starting point and adjust
                  it up or down as you alter your activity level.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Measurements;
