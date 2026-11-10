import { Upload, MessageCircle, Handshake } from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "List Your Item",
    description:
      "Upload photos, add details and set your price. Listing an item takes less than a minute.",
    link: "/add-product",
  },
  {
    number: "02",
    icon: MessageCircle,
    title: "Connect With Students",
    description:
      "Interested students can discover your listing and chat with you directly to discuss the deal.",
    link: "/messages",
  },
  {
    number: "03",
    icon: Handshake,
    title: "Make the Deal",
    description:
      "Negotiate, buy, sell, rent, borrow or exchange your item safely within your campus.",
    link: "/marketplace",
  },
];

function HowItWorks() {
  return (
    <section className="bg-slate-50 dark:bg-slate-800 py-20">
      <div className="mx-auto max-w-7xl px-6">

        {/* Section Header */}
        <div className="mx-auto mb-14 max-w-2xl text-center">

          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Simple & Fast
          </p>

          <h2 className="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-100 md:text-4xl">
            How CampConnect works
          </h2>

          <p className="mt-4 text-slate-500">
            From listing an item to making a deal, everything happens
            right inside your campus community.
          </p>

        </div>


        {/* Steps */}
        <div className="grid gap-8 md:grid-cols-3">

          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <Link
                key={step.number}
                to={step.link}
                className="group relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100/40"
              >

                {/* Number */}
                <span className="absolute right-6 top-5 text-5xl font-bold text-slate-100">
                  {step.number}
                </span>

                {/* Icon */}
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white">
                  <Icon className="h-7 w-7" />
                </div>

                {/* Content */}
                <h3 className="relative mt-6 text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {step.title}
                </h3>

                <p className="relative mt-3 text-sm leading-7 text-slate-500">
                  {step.description}
                </p>

              </Link>
            );
          })}

        </div>

      </div>
    </section>
  );
}

export default HowItWorks;