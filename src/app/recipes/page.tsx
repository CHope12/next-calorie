"use client";
import { useState } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb"
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/router";
import Loader from "@/components/common/Loader";

const Recipes = () => {

  // Get the user
  const { user, error, isLoading } = useUser();

  if (isLoading) return <Loader />;
  if (error) return <div>{error.message}</div>;

  //redirect to /api/auth/login if user is not authenticated
  if (!user) {
    //const router = useRouter();
    //router.push("/api/auth/login");
    return <Loader />;
  }

  const [ userRecipeCount, setUserRecipeCount ] = useState(0);
  const [ communityRecipeCount, setCommunityRecipeCount ] = useState(0);
  const [ userRecipeCountLoaded, setUserRecipeCountLoaded ] = useState(false);

  function loadRecipeCounts() {
  let input = {
    email: user?.email,    
  };
  //api call to load meals
  fetch("http://localhost:5000/api/getRecipeCounts", {
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
      console.log(data.user);
      console.log(data.community);
      setUserRecipeCount(data.user);
      if (data.user === undefined){
        setUserRecipeCount(0)
      }      
      setCommunityRecipeCount(data.community);
      if (data.community === undefined){
        setCommunityRecipeCount(0)
      }
      setUserRecipeCountLoaded(true);
    })
    .catch((error) => {
      console.error("Loading meals failed:", error);
    });
  }

  if (!userRecipeCountLoaded){
    loadRecipeCounts();
  }

  return(
    <DefaultLayout>
      <Breadcrumb pageName="Recipes" />

      {/* My recipe large card button */}
      <div className="flex justify-center w-[100%] h-[500px] gap-50">
        <div className="flex flex-col justify-center text-center">
          <div className="bg-white p-20 shadow-default dark:bg-black">
            <h1 className="text-3xl font-semibold text-black dark:text-white">My Recipes</h1>        
            <div className="flex justify-center mt-5 mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="100" height="100" fill="#787a7d">
                <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/>
              </svg>          
            </div>
            <div className="flex justify-center text-lg mb-5 leading-8">
              Browse your&nbsp; <span className="font-semibold text-primary text-2xl">{userRecipeCount} </span>&nbsp;recipes.
            </div>
            <div className="flex justify-center">
            <Link href="/recipes/myrecipes">
              <button className="bg-primary rounded py-2 px-4 text-white w-50">View My Recipes</button>
            </Link>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center text-center">
          <div className="bg-white p-20 shadow-default dark:bg-black">
            <h1 className="text-3xl font-semibold text-black dark:text-white">Community Recipes</h1>        
            <div className="flex justify-center mt-5 mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="100" height="100" fill="#787a7d">
              <path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3zM609.3 512H471.4c5.4-9.4 8.6-20.3 8.6-32v-8c0-60.7-27.1-115.2-69.8-151.8c2.4-.1 4.7-.2 7.1-.2h61.4C567.8 320 640 392.2 640 481.3c0 17-13.8 30.7-30.7 30.7zM432 256c-31 0-59-12.6-79.3-32.9C372.4 196.5 384 163.6 384 128c0-26.8-6.6-52.1-18.3-74.3C384.3 40.1 407.2 32 432 32c61.9 0 112 50.1 112 112s-50.1 112-112 112z"/>
            </svg>      
            </div>
            <div className="flex justify-center text-lg mb-5 leading-8">
              Browse &nbsp; <span className="font-semibold text-primary text-2xl">{communityRecipeCount} </span>&nbsp;community recipes.
            </div>
            <div className="flex justify-center">
            <Link href="/recipes/communityrecipes">
              <button className="bg-primary rounded py-2 px-4 text-white w-80">View Community Recipes</button>
            </Link>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}

export default Recipes;