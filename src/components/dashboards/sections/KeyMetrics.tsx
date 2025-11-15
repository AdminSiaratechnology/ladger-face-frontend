const gradient = [
  "bg-gradient-to-r from-teal-500 to-teal-600",
  "bg-gradient-to-r from-blue-500 to-blue-600",
  "bg-gradient-to-r from-green-500 to-green-600",
  "bg-gradient-to-r from-purple-500 to-purple-600",
];

export const KeyMetrics = ({ stats }: { stats: any[] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const isPositive = !stat.change.startsWith("-");
        return (
          <div
            key={index}
            className={`${gradient[index]} p-4 md:p-6 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-xl">
                <Icon className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <div className="text-right">
                <div className="text-xs opacity-75">Growth</div>
                <div
                  className={`text-sm font-semibold ${
                    isPositive ? "text-green-200" : "text-red-200"
                  }`}
                >
                  {stat.change}
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm opacity-90 mb-1">{stat.title}</p>
              <p className="text-xl md:text-2xl font-bold mb-1">{stat.value}</p>
              <p className="text-xs opacity-75">{stat.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
