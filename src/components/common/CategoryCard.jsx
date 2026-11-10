import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function CategoryCard({ icon, title, description, category }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (category) {
      navigate(`/marketplace?category=${category}`);
    } else {
      navigate("/marketplace");
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="group cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/50"
    >

      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl transition group-hover:bg-blue-600">
        <span className="transition group-hover:scale-110">
          {icon}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h3>

        <ArrowRight
          className="h-5 w-5 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-blue-600"
        />
      </div>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

    </div>
  );
}

export default CategoryCard;