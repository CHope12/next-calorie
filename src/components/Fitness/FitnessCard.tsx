import Link from "next/link"

const FitnessCard = () => {
  return (
    <div className="min-h-[420px] col-span-12 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <h4 className="mb-6 px-7.5 text-xl font-semibold text-black dark:text-white">
        Fitness
      </h4>

      <div className="h-[80%] flex justify-center items-center">
        This feature is not yet available
      </div>

      <div className="px-7.5 bottom-0">
      <Link href="/">
        <div className="py-2 font-md text-white bg-primary text-center opacity-80">
          Go to Fitness
        </div>
      </Link>
      </div>
    </div>
  );
};

export default FitnessCard;