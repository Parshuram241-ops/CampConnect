import { Link } from "react-router-dom";
import { ShoppingBag, Tag, MessageCircle, Heart, Star, ArrowRight, Activity } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import CategoryCard from "../../components/common/CategoryCard";
import HowItWorks from "../../components/common/HowItWorks";
import FeaturedProducts from "../../components/product/FeaturedProducts";
const categories = [
  {
    icon: "📚",
    title: "Books",
    description: "Textbooks, novels and study books",
    category: "books",
  },
  {
    icon: "💻",
    title: "Electronics",
    description: "Laptops, phones, calculators and more",
    category: "electronics",
  },
  {
    icon: "📝",
    title: "Study Materials",
    description: "Notes, guides and academic resources",
    category: "study-materials",
  },
  {
    icon: "🪑",
    title: "Furniture",
    description: "Chairs, tables, shelves and more",
    category: "furniture",
  },
  {
    icon: "🏠",
    title: "Hostel Essentials",
    description: "Everything you need for your room",
    category: "hostel-essentials",
  },
  {
    icon: "🔬",
    title: "Lab Equipment",
    description: "Useful equipment for practical work",
    category: "lab-equipment",
  },
  {
    icon: "👕",
    title: "Clothing",
    description: "Clothes, shoes and accessories",
    category: "clothing",
  },
  {
    icon: "🎮",
    title: "Others",
    description: "Explore more campus products",
    category: "others",
  },
];

function Home() {
  return (
    <>
      <Navbar />

      <main>

        {/* ================= HERO SECTION ================= */}
        <section className="relative min-h-screen overflow-hidden bg-[#0a0f1c] text-white flex items-center pt-20 pb-20 md:pb-32">
          {/* Advanced animated background */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Grid pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMGg0MHYxbC00MCAuMDAydzB6TTQwIDB2NDBoLTFWMHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz4KPC9zdmc+')] [mask-image:linear-gradient(to_bottom,white,transparent)] opacity-50" />
            
            {/* Glowing orbs */}
            <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[120px] mix-blend-screen" />
            <div className="absolute top-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px] mix-blend-screen" />
            <div className="absolute -bottom-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[120px] mix-blend-screen animate-pulse" />
          </div>

          <div className="relative mx-auto max-w-7xl px-6 z-10 w-full mt-10 md:mt-0">
            <div className="grid gap-16 lg:grid-cols-2 lg:gap-8 items-center">
              
              {/* Left Side */}
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800/5 border border-white/10 backdrop-blur-md mb-8 shadow-lg shadow-blue-500/10">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-200">Your Campus. Your Marketplace.</span>
                </div>

                <h1 className="text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl leading-[1.1]">
                  Buy, Sell & <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-gradient-x pb-2 inline-block">
                    Connect
                  </span>
                  <br />
                  <span className="text-3xl md:text-5xl text-slate-300 font-semibold mt-2 block">
                    within your Campus.
                  </span>
                </h1>

                <p className="mt-6 text-lg leading-relaxed text-slate-400 max-w-xl">
                  CampConnect is your campus marketplace to buy, sell, rent, borrow and exchange products with students around you. Experience a seamless and secure way to trade.
                </p>

                <div className="mt-10 flex flex-wrap gap-4">
                  <Link
                    to="/marketplace"
                    className="group relative overflow-hidden rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white shadow-[0_0_40px_rgba(37,99,235,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(37,99,235,0.5)]"
                  >
                    <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
                      <div className="relative h-full w-8 bg-white dark:bg-slate-800/20" />
                    </div>
                    <span className="relative flex items-center gap-2">
                      Explore Marketplace <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>

                  <Link
                    to="/dashboard"
                    className="group rounded-2xl border border-white/10 bg-white dark:bg-slate-800/5 px-8 py-4 font-bold text-white backdrop-blur-md transition-all hover:bg-white dark:bg-slate-800/10 hover:scale-105 hover:border-white/20"
                  >
                    Sell an Item
                  </Link>
                </div>
                
                {/* Trust Indicators */}
                <div className="mt-12 flex items-center gap-6 border-t border-white/10 pt-8">
                  <div className="flex -space-x-3">
                    <img className="inline-block h-10 w-10 rounded-full border-2 border-[#0a0f1c]" src="https://ui-avatars.com/api/?name=Alex&background=random" alt="" />
                    <img className="inline-block h-10 w-10 rounded-full border-2 border-[#0a0f1c]" src="https://ui-avatars.com/api/?name=Sam&background=random" alt="" />
                    <img className="inline-block h-10 w-10 rounded-full border-2 border-[#0a0f1c]" src="https://ui-avatars.com/api/?name=John&background=random" alt="" />
                    <img className="inline-block h-10 w-10 rounded-full border-2 border-[#0a0f1c]" src="https://ui-avatars.com/api/?name=Emma&background=random" alt="" />
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0a0f1c] bg-blue-600 text-xs font-bold text-white z-10">
                      +1k
                    </div>
                  </div>
                  <div>
                    <div className="flex gap-1 text-yellow-400">
                      {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <p className="text-sm text-slate-400 mt-1 font-medium">Trusted by 1000+ students</p>
                  </div>
                </div>

              </div>

              {/* Right Side - Interactive Glass Card */}
              <div className="relative mx-auto w-full max-w-md lg:max-w-none mt-10 lg:mt-0">
                {/* Floating elements */}
                <div className="absolute -left-8 top-10 animate-bounce z-20" style={{ animationDuration: '3s' }}>
                  <div className="rounded-2xl border border-white/10 bg-white dark:bg-slate-800/10 p-4 backdrop-blur-xl shadow-2xl">
                    <Tag className="w-8 h-8 text-emerald-400" />
                  </div>
                </div>
                <div className="absolute -right-6 bottom-20 animate-bounce z-20" style={{ animationDuration: '4s' }}>
                  <div className="rounded-2xl border border-white/10 bg-white dark:bg-slate-800/10 p-4 backdrop-blur-xl shadow-2xl">
                    <MessageCircle className="w-8 h-8 text-purple-400" />
                  </div>
                </div>

                <div className="relative z-10 overflow-hidden rounded-[2.5rem] border border-white/10 bg-white dark:bg-slate-800/5 p-2 backdrop-blur-3xl shadow-2xl transform transition-transform duration-500 hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-transparent opacity-50" />
                  
                  <div className="relative rounded-[2rem] bg-[#0f172a]/80 p-6 md:p-8 border border-white/5 shadow-inner">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                          Live Market 
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                          </span>
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">Real-time campus activity</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-800/5 flex items-center justify-center border border-white/10">
                        <Activity className="w-5 h-5 text-blue-400" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Activity Item 1 */}
                      <div className="group rounded-2xl border border-white/5 bg-white dark:bg-slate-800/5 p-4 transition-all duration-300 hover:bg-white dark:bg-slate-800/10 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 transition-transform group-hover:scale-110">
                            <ShoppingBag className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">Scientific Calculator</h4>
                            <p className="text-sm text-slate-400">Listed 2 mins ago</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-400">₹800</p>
                          </div>
                        </div>
                      </div>

                      {/* Activity Item 2 */}
                      <div className="group rounded-2xl border border-white/5 bg-white dark:bg-slate-800/5 p-4 transition-all duration-300 hover:bg-white dark:bg-slate-800/10 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 transition-transform group-hover:scale-110">
                            <Heart className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">Engineering Drawing Kit</h4>
                            <p className="text-sm text-slate-400">Someone favorited</p>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-2 py-1 text-xs font-medium text-purple-400 border border-purple-500/30">
                              🔥 Hot
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Activity Item 3 */}
                      <div className="group rounded-2xl border border-white/5 bg-white dark:bg-slate-800/5 p-4 transition-all duration-300 hover:bg-white dark:bg-slate-800/10 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10 cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 transition-transform group-hover:scale-110">
                            <MessageCircle className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">Active Negotiation</h4>
                            <p className="text-sm text-slate-400">Study Table</p>
                          </div>
                          <div className="flex -space-x-2">
                            <img className="h-8 w-8 rounded-full border-2 border-slate-900" src="https://ui-avatars.com/api/?name=B&background=random" alt="" />
                            <img className="h-8 w-8 rounded-full border-2 border-slate-900" src="https://ui-avatars.com/api/?name=S&background=random" alt="" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Link
                      to="/login"
                      className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-white dark:bg-slate-800 px-4 py-4 font-bold text-slate-900 dark:text-slate-100 transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    >
                      Join the Market <ArrowRight className="h-5 w-5" />
                    </Link>

                  </div>
                </div>
              </div>

            </div>
          </div>
          
          {/* Transition wave to next section */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10 text-white">
            <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[40px] md:h-[80px]">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,119.3,200.7,105.5C241.6,97.5,282.4,75.4,321.39,56.44Z" fill="currentColor"></path>
            </svg>
          </div>
        </section>


        {/* ================= CATEGORIES SECTION ================= */}
        <section className="bg-white dark:bg-slate-800 py-20">
          <div className="mx-auto max-w-7xl px-6">

            {/* Section Header */}
            <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">

              <div>

                <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                  Explore Campus
                </p>

                <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-slate-100 md:text-4xl">
                  Find what you <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">need</span>
                </h2>

                <p className="mt-3 max-w-2xl text-slate-500">
                  Explore products listed by students across your campus.
                </p>

              </div>

              <Link
                to="/marketplace"
                className="flex items-center gap-2 font-semibold text-blue-600 transition hover:text-blue-700"
              >
                View all categories
                <span>→</span>
              </Link>

            </div>


            {/* Category Cards */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

              {categories.map((category) => (
                <CategoryCard
                  key={category.title}
                  icon={category.icon}
                  title={category.title}
                  description={category.description}
                  category={category.category}
                />
              ))}

            </div>

          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <HowItWorks />
        {/*=============== Featured Products========== */}
        <FeaturedProducts />
      </main>
    </>
  );
}

export default Home;