"use client";

import React, { useState, useEffect } from 'react';
import { Check, Loader2, CreditCard, Calendar, AlertCircle, X } from 'lucide-react';

interface Subscription {
  id: string;
  plan: 'yearly' | 'monthly';
  status: 'active' | 'canceled' | 'expired';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

interface Transaction {
  id: string;
  amount: number;
  plan: string;
  date: string;
  status: 'success' | 'pending' | 'failed';
}

const SubscribeNow = () => {
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Set to true for demo
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Payment form states
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // Load saved subscription on mount
  useEffect(() => {
    const savedSubscription = localStorage.getItem('demo_subscription');
    if (savedSubscription) {
      setCurrentSubscription(JSON.parse(savedSubscription));
    }
    
    const savedTransactions = localStorage.getItem('demo_transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

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
      oldPrice: '$112.99',
      period: '/Year',
      save: 'SAVE 20%',
      features: [
        'Unlimited access to premium articles',
        'Save articles & personalized recommendations',
        'Exclusive opinions & long-form content',
        'Save more with full premium access, billed yearly.',
        'Cancel anytime'
      ]
    },
    {
      id: 'monthly',
      title: 'Monthly',
      price: '$9.99',
      period: '/month',
      features: [
        'Unlimited access to premium articles',
        'Access all premium content, billed monthly',
        'Exclusive opinions & long-form content',
        'Save articles & personalized recommendations',
        'Cancel anytime'
      ]
    }
  ];

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    
    if (selectedPlan === 'free') {
      alert('Free plan activated! You can continue with limited access.');
      return;
    }
    
    setShowPaymentModal(true);
    setPaymentError('');
    setPaymentSuccess(false);
  };

  const handlePayment = () => {
    // Validate form
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      setPaymentError('Please enter a valid card number');
      return;
    }
    if (!expiryDate || expiryDate.length < 5) {
      setPaymentError('Please enter a valid expiry date');
      return;
    }
    if (!cvv || cvv.length < 3) {
      setPaymentError('Please enter a valid CVV');
      return;
    }
    if (!cardName) {
      setPaymentError('Please enter the name on card');
      return;
    }

    setLoading(true);
    setPaymentError('');

    // Simulate payment processing
    setTimeout(() => {
      // Random success/failure for demo (90% success rate)
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        const newSubscription: Subscription = {
          id: `sub_${Date.now()}`,
          plan: selectedPlan as 'yearly' | 'monthly',
          status: 'active',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + (selectedPlan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
          autoRenew: true
        };
        
        const newTransaction: Transaction = {
          id: `txn_${Date.now()}`,
          amount: selectedPlan === 'yearly' ? 89.99 : 9.99,
          plan: selectedPlan === 'yearly' ? 'Yearly Plan' : 'Monthly Plan',
          date: new Date().toISOString(),
          status: 'success'
        };
        
        setCurrentSubscription(newSubscription);
        setTransactions([newTransaction, ...transactions]);
        
        localStorage.setItem('demo_subscription', JSON.stringify(newSubscription));
        localStorage.setItem('demo_transactions', JSON.stringify([newTransaction, ...transactions]));
        
        setPaymentSuccess(true);
        
        // Close modal after success
        setTimeout(() => {
          setShowPaymentModal(false);
          setPaymentSuccess(false);
          resetForm();
          alert('Subscription successful! 🎉 You now have premium access.');
        }, 2000);
      } else {
        setPaymentError('Payment failed. Please try again with a different card.');
      }
      
      setLoading(false);
    }, 2000);
  };

  const handleCancelSubscription = () => {
    if (confirm('Are you sure you want to cancel your subscription? You will lose premium access at the end of your billing period.')) {
      if (currentSubscription) {
        const updatedSubscription = {
          ...currentSubscription,
          status: 'canceled' as const,
          autoRenew: false
        };
        setCurrentSubscription(updatedSubscription);
        localStorage.setItem('demo_subscription', JSON.stringify(updatedSubscription));
        alert('Your subscription has been canceled. You will retain premium access until ' + 
              new Date(currentSubscription.endDate).toLocaleDateString());
      }
    }
  };

  const handleRenewSubscription = () => {
    setShowPaymentModal(true);
    setPaymentError('');
    setPaymentSuccess(false);
  };

  const resetForm = () => {
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setCardName('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // If user has active subscription
  if (currentSubscription?.status === 'active') {
    const daysLeft = Math.ceil((new Date(currentSubscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    return (
      <div className="max-w-7xl mx-auto py-20 px-4 font-sans">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium Member 🎉</h2>
            <p className="text-gray-600 mb-4">
              You have full access to all premium content.
            </p>
            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">Plan</span>
                <span className="font-semibold capitalize">{currentSubscription.plan}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">Status</span>
                <span className="text-green-600 font-semibold">Active</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">Renewal Date</span>
                <span className="font-semibold">{formatDate(currentSubscription.endDate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Days Left</span>
                <span className="font-semibold text-orange-600">{daysLeft} days</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancelSubscription}
                className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition"
              >
                {showHistory ? 'Hide History' : 'View History'}
              </button>
            </div>
          </div>
          
          {/* Transaction History */}
          {showHistory && transactions.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-lg mb-4">Payment History</h3>
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-left">
                      <p className="font-medium text-sm">{tx.plan}</p>
                      <p className="text-xs text-gray-500">{formatDate(tx.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${tx.amount}</p>
                      <p className="text-xs text-green-600 capitalize">{tx.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  // If subscription is canceled but still active
  if (currentSubscription?.status === 'canceled' && new Date(currentSubscription.endDate) > new Date()) {
    const daysLeft = Math.ceil((new Date(currentSubscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    return (
      <div className="max-w-7xl mx-auto py-20 px-4 font-sans">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8 mb-6">
            <AlertCircle className="w-12 h-12 text-orange-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscription Canceled</h2>
            <p className="text-gray-600 mb-4">
              Your premium access ends on {formatDate(currentSubscription.endDate)}
            </p>
            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Days Remaining</span>
                <span className="font-semibold text-orange-600">{daysLeft} days</span>
              </div>
            </div>
            <button
              onClick={handleRenewSubscription}
              className="w-full py-3 rounded-lg text-white font-medium transition-transform active:scale-95"
              style={{ 
                background: 'linear-gradient(90deg, #343E87 12.02%, #3448D6 50%, #343E87 88.46%)' 
              }}
            >
              Renew Subscription
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto py-20 px-4 font-sans">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-gray-600 text-lg">Get unlimited access to premium content</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative p-8 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
                selectedPlan === plan.id 
                  ? 'border-blue-800 ring-2 ring-blue-800 ring-offset-2' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Popular Badge */}
              {plan.id === 'yearly' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-blue-800 text-white text-xs font-bold px-3 py-1 rounded-full">
                    BEST VALUE
                  </span>
                </div>
              )}
              
              {/* Selection Circle */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === plan.id ? 'border-blue-800' : 'border-gray-400'
                  }`}>
                    {selectedPlan === plan.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-800" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-black">{plan.title}</h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-black">{plan.price}</span>
                  <span className="text-sm text-gray-500">{plan.period}</span>
                  {plan.oldPrice && (
                    <p className="text-xs text-gray-400 line-through">{plan.oldPrice}</p>
                  )}
                </div>
              </div>

              {plan.save && (
                <div className="mb-4">
                  <span className="bg-[#10B981] text-white text-[10px] font-bold px-3 py-1 rounded-full">
                    {plan.save}
                  </span>
                </div>
              )}

              {/* Feature List */}
              <ul className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <Check size={14} className="text-green-500" strokeWidth={2.5} />
                    </div>
                    <span className={`text-sm leading-relaxed ${
                      feature === 'Premium articles locked' ? 'text-gray-400' : 'text-gray-700'
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
            className="w-full max-w-lg py-4 rounded-xl text-white font-sans text-lg font-medium transition-all hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              background: 'linear-gradient(90deg, #343E87 12.02%, #3448D6 50%, #343E87 88.46%)' 
            }}
            onClick={handleSubscribe}
          >
            {selectedPlan === 'free' ? 'Get Free Plan' : `Subscribe to ${selectedPlan === 'yearly' ? 'Yearly' : 'Monthly'} Plan`}
          </button>
          <p className="text-gray-500 text-sm flex items-center gap-2">
            <Check size={14} />
            Cancel or pause anytime
          </p>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl font-serif text-black">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Complete Payment</h2>
              <button 
                onClick={() => {
                  setShowPaymentModal(false);
                  resetForm();
                  setPaymentError('');
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>
            {paymentSuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
                <p className="text-black">Your subscription is now active.</p>
              </div>
            ) : (
              <div className="p-6">
                {/* Order Summary */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <p className="text-sm mb-2">Order Summary</p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium capitalize">{selectedPlan} Plan</span>
                    <span className="font-bold">${selectedPlan === 'yearly' ? '89.99' : '9.99'}</span>
                  </div>
                  {selectedPlan === 'yearly' && (
                    <div className="flex justify-between items-center text-sm text-green-600">
                      <span>Savings</span>
                      <span>- $23.00</span>
                    </div>
                  )}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center font-bold">
                      <span>Total</span>
                      <span>${selectedPlan === 'yearly' ? '89.99' : '9.99'}</span>
                    </div>
                  </div>
                </div>
                {/* Payment Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Card Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="1234 5678 9012 3456"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent font-serif text-black"
                        maxLength={19}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Expiry Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                          placeholder="MM/YY"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent font-serif text-black"
                          maxLength={5}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">CVV</label>
                      <input
                        type="password"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                        placeholder="123"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent font-serif text-black"
                        maxLength={4}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent font-serif text-black"
                    />
                  </div>
                  {paymentError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-600 text-sm font-serif">{paymentError}</p>
                    </div>
                  )}
                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full py-3 rounded-lg text-white font-serif font-medium transition-all active:scale-95 disabled:opacity-50"
                    style={{ 
                      background: 'linear-gradient(90deg, #343E87 12.02%, #3448D6 50%, #343E87 88.46%)' 
                    }}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      `Pay $${selectedPlan === 'yearly' ? '89.99' : '9.99'}`
                    )}
                  </button>
                  <p className="text-xs text-center font-serif text-black/60">
                    By subscribing, you agree to our Terms of Service and Privacy Policy.
                    Your payment will be processed securely.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔐</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">Login Required</h2>
              <p className="text-gray-600">Please login to continue with your subscription</p>
            </div>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800"
                defaultValue="demo@example.com"
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800"
                defaultValue="password123"
              />
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setIsAuthenticated(true);
                  alert('Demo login successful! Now you can subscribe.');
                }}
                className="w-full py-3 rounded-lg text-white font-medium"
                style={{ 
                  background: 'linear-gradient(90deg, #343E87 12.02%, #3448D6 50%, #343E87 88.46%)' 
                }}
              >
                Login (Demo)
              </button>
              <button
                onClick={() => setShowLoginModal(false)}
                className="w-full py-3 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SubscribeNow;