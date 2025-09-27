import { Sparkles } from 'lucide-react';

const HeaderGradient = ({ title, subtitle }: { title: string; subtitle: string }) => {
  return (
    <div className="text-center sm:text-left ">
      <h1 className="text-2xl  p-2 sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
        {title}
      </h1>
      <p className="text-sm sm:text-base text-gray-600 mt-1 flex items-center justify-center sm:justify-start">
        <Sparkles className="w-4 h-4 mr-1 text-yellow-500" />
        {subtitle}
      </p>
    </div>
  );
};

export default HeaderGradient;
