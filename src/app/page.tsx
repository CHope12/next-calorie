"use client";
import ECommerce from "@/components/Dashboard/E-commerce";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Loader from "@/components/common/Loader";
import { useRouter } from "next/navigation";
import { NextUIProvider } from "@nextui-org/react";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function Home() {
  const { user, error, isLoading } = useUser();
  const router = useRouter();

  if (isLoading) return <Loader />;
  if (error) return <div>{error.message}</div>;

  //redirect to /api/auth/login if user is not authenticated
  if (!user) {
    router.push("/api/auth/login");
    return <Loader />;
  }

  return (
    <>
      <DefaultLayout>
        <NextUIProvider>
          <ECommerce />
        </NextUIProvider>
      </DefaultLayout>
    </>
  );
}
