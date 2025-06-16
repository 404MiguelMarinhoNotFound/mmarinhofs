"use client"
import SectionHeading from "./section-heading"
import { experiencesData } from "@/lib/data"
import { useSectionInView } from "@/lib/hooks"
import { useTheme } from "@/context/theme-context"

export default function Experience() {
  const { ref } = useSectionInView("Experience")
  const { theme } = useTheme()

  return (
    <section id="experience" ref={ref} className="scroll-mt-28 mb-28 sm:mb-40 w-full px-4 sm:px-6 lg:px-8">
      <SectionHeading>My experience</SectionHeading>

      <div className="relative w-full max-w-7xl mx-auto">
        {/* Timeline line - responsive positioning */}
        <div className="absolute left-8 lg:left-1/2 transform lg:-translate-x-px top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>

        {experiencesData.map((item, index) => (
          <div
            key={index}
            className={`relative flex items-start mb-16 w-full ${
              index % 2 === 0 ? "lg:justify-start" : "lg:justify-end"
            }`}
          >
            {/* Timeline icon */}
            <div className="absolute left-8 lg:left-1/2 transform lg:-translate-x-1/2 w-12 h-12 bg-white dark:bg-gray-800 border-4 border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 shadow-lg z-10">
              {item.icon}
            </div>

            {/* Content container */}
            <div className={`w-full lg:w-[45%] pl-20 lg:pl-0 ${index % 2 === 0 ? "lg:pr-12" : "lg:pl-12"}`}>
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                {/* Date badge */}
                <div className="inline-flex items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4 shadow-md">
                  {item.date}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 capitalize leading-tight">
                  {item.title}
                </h3>

                {/* Location */}
                <p className="text-lg text-gray-600 dark:text-gray-300 font-semibold mb-4 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  {item.location}
                </p>

                {/* Description */}
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-base">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
