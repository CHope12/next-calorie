import { useRouter } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";

const Login = () => {
  const { user, error, isLoading } = useUser();
  const router = useRouter();

  if (isLoading) return <Loader />;
  if (error) return <div>{error.message}</div>;
  //redirect to /api/auth/login if user is not authenticated
  if (!user) {
    router.push("/api/auth/login");
  }
};

export default Login;
