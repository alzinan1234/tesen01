"use client"
import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQ = () => {
  // State to track which accordion item is open
  const [openIndex, setOpenIndex] = useState(0); // Default first one open as per image

  const faqData = [
    {
      question: "What do I get with an OPED Premium subscription?",
      answer: "The OPED Free plan allows readers to explore the platform at no cost. You can read a selection of free articles, browse categories and authors, listen to limited podcast episodes, and create an account to personalize your feed. This plan is ideal for new readers who want to understand OPED's editorial style before upgrading to Premium."
    },
    {
      question: "What do I get with an OPED Premium subscription?",
      answer: "Premium members receive unlimited access to all articles, exclusive newsletters, and ad-free podcast experiences."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time through your account settings without any hidden fees."
    },
    {
      question: "Is the annual plan cheaper than the monthly plan?",
      answer: "Typically, the annual plan offers a significant discount compared to paying month-to-month over a full year."
    },
    {
      question: "Do I need an account to read OPED articles?",
      answer: "You can read a limited number of guest articles, but a free account is required to access more content and personalize your experience."
    },
    {
      question: "Are OPED podcasts included in the subscription?",
      answer: "Yes, all OPED podcasts are included. Premium subscribers enjoy them without ad interruptions."
    },
    {
      question: "Can I switch or upgrade my plan later?",
      answer: "Absolutely. You can upgrade from Free to Premium or switch between monthly and annual billing at any time."
    },
    {
      question: "How do I access Premium content after subscribing?",
      answer: "Once your subscription is active, simply log in to your account on any device to instantly unlock all premium features."
    }
  ];

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-[#F9F9F9] min-h-screen py-20 px-4 font-serif">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-center mb-16 text-black">
          Frequently Asked Questions (FAQ)
        </h2>

        {/* Accordion Container */}
        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full flex items-center justify-between p-6 text-left transition-colors hover:bg-gray-50"
              >
                <span className="text-lg md:text-xl font-serif font-semibold text-black pr-8">
                  {item.question}
                </span>
                <div className={`flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                  {openIndex === index ? (
                    <div className="w-6 h-6 rounded-full border border-blue-600 flex items-center justify-center">
                      <Minus size={14} className="text-blue-600" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-gray-900 flex items-center justify-center">
                      <Plus size={14} className="text-gray-900" />
                    </div>
                  )}
                </div>
              </button>

              {/* Animated Content Body */}
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  openIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-6 pt-0 text-gray-700  leading-relaxed text-sm md:text-base border-t border-gray-50">
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;