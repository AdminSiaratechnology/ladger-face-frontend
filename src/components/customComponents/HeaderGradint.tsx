import { Sparkles } from "lucide-react";

const HeaderGradient = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => {
  return (
    <div className=" sm:text-left ">
      <h1 className=" sm:text-2xl lg:text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
        {title}
      </h1>
      <p className="sm:text-base text-gray-600 mt-1 flex items-center justify-center sm:justify-start">
        <Sparkles className="w-4 h-4 mr-1 text-yellow-500" />
        {subtitle}
      </p>
    </div>
  );
};

export default HeaderGradient;
