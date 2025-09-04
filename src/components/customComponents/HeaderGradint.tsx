
import { Sparkles } from 'lucide-react';

const HeaderGradient = ({title,subtitle}:{title: string, subtitle: string}) => {
  return (
    <div>
      <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
        {title}
      </h1>
      <p className="text-gray-600 mt-1 flex items-center">
        <Sparkles className="w-4 h-4 mr-1 text-yellow-500" />
        {subtitle}
      </p>
    </div>
  )
}

export default HeaderGradient;