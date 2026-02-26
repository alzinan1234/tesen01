 "use client"
import React, { useState } from 'react';
import { Check } from 'lucide-react';

const SubscribeNow = () => {
  // State to manage selected plan
  const [selectedPlan, setSelectedPlan] = useState('yearly');

  const plans = [
    {
      id: 'free',
      title: 'Free',
      price: '$0',
      period: '',
      features: [
        'Access to selected free articles',
        'Read latest news & opinions',
        'Create an account & personalize feed',
        'Premium articles locked'
      ],
      isFree: true
    },
    {
      id: 'yearly',
      title: 'Yearly',
      price: '$89.99',
      oldPrice: '49.99', // Based on image text
      period: '/Year',
      save: 'SAVE 20%',
      features: [
        'Unlimited access to premium articles',
        'Save articles & personalized recommendations',
        'Exclusive opinions & long-form content',
        'Save more with full premium access, billed yearly.'
      ]
    },
    {
      id: 'monthly',
      title: 'Monthly',
      price: '$9.99',
      period: '/month',
      features: [
        'Unlimited access to premium articles',
        'Unlimited access to premium articles, billed monthly.',
        'Exclusive opinions & long-form content',
        'Save articles & personalized recommendations'
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-20 px-4 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={`relative p-8 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
              selectedPlan === plan.id 
                ? 'border-blue-800 ring-1 ring-blue-800' 
                : 'border-gray-200'
            }`}
          >
            {/* Selection Circle */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  selectedPlan === plan.id ? 'border-blue-800' : 'border-gray-400'
                }`}>
                  {selectedPlan === plan.id && (
                    <div className="w-3 h-3 rounded-full bg-blue-800" />
                  )}
                </div>
                <h3 className="text-xl font-medium text-black">{plan.title}</h3>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-black">{plan.price}</span>
                <span className="text-sm text-gray-500">{plan.period}</span>
                {plan.oldPrice && (
                  <p className="text-xs text-gray-400 line-through">{plan.oldPrice}</p>
                )}
              </div>
            </div>

            {plan.save && (
              <div className="mb-4">
                <span className="bg-[#10B981] text-white text-[10px] font-bold px-3 py-1 rounded-full ">
                  {plan.save}
                </span>
              </div>
            )}

            {/* Feature List */}
            <ul className="space-y-4">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex font-serif items-start gap-3">
                   {/* Double checkmark style from image */}
                  <div className="flex flex-col mt-1">
                    <Check size={12} className="text-black -mb-1.5" strokeWidth={3} />
                    <Check size={12} className="text-black" strokeWidth={3} />
                  </div>
                  <span className={`text-sm leading-relaxed ${
                    feature === 'Premium articles locked' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Action Section */}
      <div className="flex flex-col items-center gap-6">
        <button 
          className="w-full max-w-lg py-4 rounded-xl text-white font-sans text-lg font-medium transition-transform active:scale-95 shadow-lg"
          style={{ 
            background: 'linear-gradient(90deg, #343E87 12.02%, #3448D6 50%, #343E87 88.46%)' 
          }}
          onClick={() => alert(`Subscribing to ${selectedPlan} plan`)}
        >
          Subscribe Now
        </button>
        <p className="text-gray-800 font-sans text-lg">
          Cancel or pause anytime.
        </p>
      </div>
    </div>
  );
};

export default SubscribeNow;