import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, MapPin, Tag, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { getAllProducts } from "../../services/api";
import ProductImage from "../common/ProductImage";

const formatTime = (milliseconds) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export default function FlashZone() {
  const [deals, setDeals] = useState([]);
  const [serverOffset, setServerOffset] = useState(0);
  const [now, setNow] = useState(0);

  useEffect(() => {
    let isMounted = true;
    getAllProducts({ dealsOnly: true, limit: 6, sort: "dealExpiresAt" })
      .then((response) => {
        if (!isMounted) return;
        setDeals(response.data || []);
        setNow(Date.now());
        if (response.serverTime) {
          setServerOffset(new Date(response.serverTime).getTime() - Date.now());
        }
      })
      .catch((error) => {
        console.error("Failed to load limited-time deals:", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const currentServerTime = now + serverOffset;
  const activeDeals = deals.filter(
    (deal) => new Date(deal.dealExpiresAt).getTime() > currentServerTime
  );

  if (activeDeals.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-10"
      aria-labelledby="flash-deals-heading"
    >
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0a0f1c] p-6 shadow-2xl sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-blue-600/20 blur-[100px]" />
        <div className="relative z-10">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20">
                  <Zap className="h-4 w-4 fill-blue-400 text-blue-400" />
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-300">
                  Limited time
                </span>
              </div>
              <h2 id="flash-deals-heading" className="text-3xl font-extrabold text-white md:text-5xl">
                Campus <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Deals</span>
              </h2>
              <p className="mt-3 max-w-2xl font-medium text-slate-400">
                Special prices on selected products, available until the countdown ends.
              </p>
            </div>
            <Link
              to="/marketplace?deals=true"
              className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 font-semibold text-white transition hover:bg-white/10"
            >
              View All Deals <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {activeDeals.map((deal) => {
              const savings = Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100);
              return (
                <motion.article
                  key={deal._id}
                  whileHover={{ y: -5 }}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl"
                >
                  <div className="relative h-48 overflow-hidden bg-slate-900">
                    <ProductImage
                      src={deal.images?.[0]}
                      images={deal.images}
                      category={deal.category}
                      alt={deal.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      containerClassName="h-full w-full"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white">
                      {savings}% OFF
                    </span>
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-1.5 text-white">
                      <Clock className="h-3.5 w-3.5 text-blue-300" />
                      <time dateTime={deal.dealExpiresAt} className="font-mono text-xs font-bold">
                        {formatTime(new Date(deal.dealExpiresAt).getTime() - currentServerTime)}
                      </time>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="line-clamp-1 text-lg font-bold text-white">{deal.title}</h3>
                    <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{deal.location}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-extrabold text-emerald-300">₹{deal.price}</span>
                        <span className="text-sm text-slate-400 line-through">₹{deal.originalPrice}</span>
                      </div>
                      <Link
                        to={`/marketplace?deals=true`}
                        className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500"
                      >
                        <Tag className="h-3.5 w-3.5" />
                        See deal
                      </Link>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
