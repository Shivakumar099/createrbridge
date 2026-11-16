import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Navbar } from '../components/layout/Navbar';
import { safeApiCall } from '../utils/api';
import { SubscriptionPlan } from '../types';
import {
  Sparkles,
  Check,
  ShieldCheck,
  Crown,
  Zap,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Building,
  HelpCircle,
  FileCheck2,
  Lock,
  Edit3,
  X
} from 'lucide-react';

interface CheckoutQuote {
  planId: string;
  planName: string;
  originalPrice: number;
  basePrice: number;
  discountPercentage: number;
  taxPercentage: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
}

export const CreatorMembershipPage: React.FC = () => {
  const { user, isAuthenticated, role } = useAuth();
  const { showToast } = useData();

  const isCreatorLoggedIn = isAuthenticated && role === 'creator';

  const defaultPlans: SubscriptionPlan[] = [
    {
      id: "creator_pro",
      name: "Creator Pro",
      original_price: 599,
      discounted_price: 299,
      currency: "INR",
      discount_percentage: 50,
      features: [
        "Unlimited campaign applications",
        "AI Script Writer",
        "30 AI scripts per month",
        "Advanced creator portfolio",
        "Creator analytics",
        "Application tracking",
        "Priority support"
      ]
    },
    {
      id: "creator_premium",
      name: "Creator Premium",
      original_price: 1399,
      discounted_price: 599,
      currency: "INR",
      discount_percentage: 57.18,
      features: [
        "Everything in Creator Pro",
        "100 AI scripts per month",
        "Advanced analytics",
        "Portfolio insights",
        "Profile promotion credits",
        "Priority support",
        "Exclusive creator resources"
      ]
    }
  ];

  const [plans, setPlans] = useState<SubscriptionPlan[]>(defaultPlans);
  const [loading, setLoading] = useState(false);
  const [activePlanId, setActivePlanId] = useState<string>(user?.membership?.planId || '');

  // Checkout Modal State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [checkoutQuote, setCheckoutQuote] = useState<CheckoutQuote | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');
  const [processingPayment, setProcessingPayment] = useState(false);

  // Admin Config Modal State
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  // Load plans from backend
  const loadPlans = async () => {
    try {
      const res = await safeApiCall<{ subscription_plans: SubscriptionPlan[] }>('/membership/plans');
      if (res.ok && res.data?.subscription_plans) {
        setPlans(res.data.subscription_plans);
      }
    } catch {
      // Fallback already in place
    }
  };

  useEffect(() => {
    loadPlans();
    if (user?.membership?.planId) {
      setActivePlanId(user.membership.planId);
    }
  }, [user]);

  // Handle opening checkout
  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setLoading(true);
    try {
      const res = await safeApiCall<CheckoutQuote>('/membership/calculate', {
        method: 'POST',
        body: JSON.stringify({ planId: plan.id })
      });
      if (res.ok && res.data) {
        setCheckoutQuote(res.data);
      } else {
        // Local calculation fallback
        const taxAmount = Number(((plan.discounted_price * 18) / 100).toFixed(2));
        setCheckoutQuote({
          planId: plan.id,
          planName: plan.name,
          originalPrice: plan.original_price,
          basePrice: plan.discounted_price,
          discountPercentage: plan.discount_percentage,
          taxPercentage: 18,
          taxAmount,
          totalAmount: Number((plan.discounted_price + taxAmount).toFixed(2)),
          currency: plan.currency
        });
      }
    } catch {
      const taxAmount = Number(((plan.discounted_price * 18) / 100).toFixed(2));
      setCheckoutQuote({
        planId: plan.id,
        planName: plan.name,
        originalPrice: plan.original_price,
        basePrice: plan.discounted_price,
        discountPercentage: plan.discount_percentage,
        taxPercentage: 18,
        taxAmount,
        totalAmount: Number((plan.discounted_price + taxAmount).toFixed(2)),
        currency: plan.currency
      });
    } finally {
      setLoading(false);
      setCheckoutModalOpen(true);
    }
  };

  // Complete subscription
  const handleConfirmSubscription = async () => {
    if (!selectedPlan || !checkoutQuote) return;
    setProcessingPayment(true);

    try {
      const res = await safeApiCall('/membership/subscribe', {
        method: 'POST',
        body: JSON.stringify({
          planId: selectedPlan.id,
          paymentMethod
        })
      });

      if (res.ok) {
        setActivePlanId(selectedPlan.id);
        showToast(
          'Membership Activated! 🎉',
          `You are now a ${selectedPlan.name} member. Unlimited applications and creator perks are active.`,
          'success'
        );
        setCheckoutModalOpen(false);
      } else {
        showToast('Activation Error', res.error || 'Failed to process subscription', 'error');
      }
    } catch (e: any) {
      showToast('Error', e.message || 'Payment processing failed', 'error');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Admin save plan
  const handleSavePlanSettings = async () => {
    if (!editingPlan) return;
    try {
      const res = await safeApiCall(`/membership/plans/${editingPlan.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          original_price: editingPlan.original_price,
          discounted_price: editingPlan.discounted_price,
          discount_percentage: editingPlan.discount_percentage,
          features: editingPlan.features
        })
      });
      if (res.ok) {
        showToast('Pricing Updated', `${editingPlan.name} prices successfully updated in backend.`, 'success');
        setAdminModalOpen(false);
        loadPlans();
      }
    } catch (e: any) {
      showToast('Error', e.message, 'error');
    }
  };

  const content = (
    <div className="space-y-[32px] animate-fade-in max-w-[1200px] mx-auto py-2">
      
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2ECFF] text-[#6425E8] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>CreatorBridge Creator Membership</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#17152F] tracking-tight">
          Supercharge Your Creator Growth
        </h1>
        <p className="text-sm sm:text-base text-[#77758B] leading-relaxed">
          Get direct access to verified brand deals, generate high-converting AI reel scripts, and build your professional creator media kit.
        </p>

        {/* Admin configure button if authenticated */}
        {isAuthenticated && (
          <div className="pt-1">
            <button
              onClick={() => {
                setEditingPlan(plans[1] || plans[0]);
                setAdminModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#77758B] hover:text-[#6425E8] transition-colors bg-white px-3 py-1 rounded-full border border-[#EAE8F2] shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#6425E8]" />
              <span>Admin: Configure Plan Prices</span>
            </button>
          </div>
        )}
      </div>

      {/* Subscription Plans Grid - Displays ONLY Creator Pro and Creator Premium */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-4">
        {plans.map(plan => {
          const isPremium = plan.id === 'creator_premium';
          const isCurrentActive = activePlanId === plan.id;

          return (
            <div
              key={plan.id}
              className={`rounded-[24px] p-7 transition-all flex flex-col justify-between relative bg-white ${
                isPremium
                  ? 'border-2 border-[#6425E8] shadow-[0_12px_40px_rgba(100,37,232,0.12)] md:-translate-y-2'
                  : 'border border-[#EAE8F2] shadow-subtle hover:border-[#6425E8]/40'
              }`}
            >
              {/* Recommended Badge on Creator Premium */}
              {isPremium && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#6425E8] to-[#8B5CF6] text-white text-[11px] font-extrabold tracking-wider uppercase shadow-md flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" />
                  <span>Recommended Plan</span>
                </div>
              )}

              <div>
                {/* Plan Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-[#17152F]">{plan.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F2ECFF] text-[#6425E8] border border-[#6425E8]/20">
                    {Math.round(plan.discount_percentage)}% OFF
                  </span>
                </div>

                <p className="text-xs text-[#77758B] mt-1.5">
                  {isPremium
                    ? 'The complete powerhouse studio suite for creators seeking top-tier brand partnerships.'
                    : 'Ideal for rising creators ready to scale campaign pitches and monetize reliably.'}
                </p>

                {/* Pricing Block with Strikethrough & Prominent Discounted Price */}
                <div className="my-6 p-4 rounded-2xl bg-[#FAFAFC] border border-[#EAE8F2]/80 space-y-1">
                  <div className="flex items-baseline gap-2">
                    {/* Strikethrough Original Price */}
                    <span className="text-sm text-[#9CA3AF] line-through font-semibold">
                      ₹{plan.original_price}
                    </span>
                    {/* Prominent Discounted Price */}
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#17152F] tracking-tight">
                      ₹{plan.discounted_price}
                    </span>
                    <span className="text-xs text-[#77758B] font-medium">/ month</span>
                  </div>
                  <p className="text-[11px] text-[#77758B]">
                    + 18% GST (₹{((plan.discounted_price * 18) / 100).toFixed(2)}) • Billed monthly
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-[#17152F] uppercase tracking-wider block">
                    What's included:
                  </span>
                  <ul className="space-y-2.5 text-xs text-[#555368]">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isPremium ? 'bg-[#6425E8] text-white' : 'bg-[#F2ECFF] text-[#6425E8]'
                        }`}>
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className={isPremium && idx === 0 ? 'font-bold text-[#17152F]' : ''}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8">
                {isCurrentActive ? (
                  <button
                    disabled
                    className="w-full h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-default"
                  >
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Current Active Plan</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full h-11 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                      isPremium
                        ? 'bg-[#6425E8] hover:bg-[#521dc7] text-white shadow-[#6425E8]/25 hover:shadow-md'
                        : 'bg-[#F2ECFF] hover:bg-[#6425E8] text-[#6425E8] hover:text-white border border-[#6425E8]/30'
                    }`}
                  >
                    <span>Upgrade to {plan.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Matrix */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#EAE8F2] shadow-subtle space-y-5 max-w-4xl mx-auto mt-8">
        <div className="flex items-center justify-between border-b border-[#EAE8F2] pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#17152F]">Detailed Plan Comparison</h3>
            <p className="text-xs text-[#77758B]">Full breakdown of allowances, tool limits, and creator perks</p>
          </div>
          <span className="text-xs font-semibold text-[#6425E8] bg-[#F2ECFF] px-3 py-1 rounded-full">
            100% Escrow Protection Included
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#EAE8F2] text-[#77758B]">
                <th className="py-3 px-3 font-semibold">Capability</th>
                <th className="py-3 px-3 font-bold text-[#17152F]">Creator Pro</th>
                <th className="py-3 px-3 font-bold text-[#6425E8]">Creator Premium (Recommended)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE8F2] text-[#555368]">
              <tr>
                <td className="py-3 px-3 font-medium text-[#17152F]">Campaign Applications</td>
                <td className="py-3 px-3 font-semibold text-emerald-600">Unlimited</td>
                <td className="py-3 px-3 font-bold text-emerald-600">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-[#17152F]">AI Script Writer</td>
                <td className="py-3 px-3 font-semibold text-[#17152F]">30 Scripts / Month</td>
                <td className="py-3 px-3 font-bold text-[#6425E8]">100 Scripts / Month</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-[#17152F]">Media Kit & Portfolio</td>
                <td className="py-3 px-3">Advanced Verified Portfolio</td>
                <td className="py-3 px-3 font-semibold text-[#17152F]">Advanced Portfolio + Insights</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-[#17152F]">Profile Promotion Credits</td>
                <td className="py-3 px-3 text-[#9CA3AF]">—</td>
                <td className="py-3 px-3 font-bold text-[#6425E8]">Included (Priority Discovery)</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-[#17152F]">Support Level</td>
                <td className="py-3 px-3">Priority Support</td>
                <td className="py-3 px-3 font-semibold text-[#17152F]">24/7 Dedicated Concierge</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-[#17152F]">Exclusive Creator Workshops</td>
                <td className="py-3 px-3 text-[#9CA3AF]">—</td>
                <td className="py-3 px-3 font-semibold text-[#17152F]">Monthly Masterclasses</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Trust & Guarantees */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto pt-4 text-center">
        <div className="p-4 rounded-2xl bg-white border border-[#EAE8F2] space-y-1">
          <ShieldCheck className="w-5 h-5 text-[#6425E8] mx-auto" />
          <h4 className="text-xs font-bold text-[#17152F]">Secure Escrow Payouts</h4>
          <p className="text-[11px] text-[#77758B]">Payments held safely before every video shoot</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#EAE8F2] space-y-1">
          <Zap className="w-5 h-5 text-[#6425E8] mx-auto" />
          <h4 className="text-xs font-bold text-[#17152F]">Instant Activation</h4>
          <p className="text-[11px] text-[#77758B]">Start applying to high-ticket brand deals immediately</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#EAE8F2] space-y-1">
          <FileCheck2 className="w-5 h-5 text-[#6425E8] mx-auto" />
          <h4 className="text-xs font-bold text-[#17152F]">Tax Invoices</h4>
          <p className="text-[11px] text-[#77758B]">Official GST tax receipts for every billing cycle</p>
        </div>
      </div>

      {/* CHECKOUT MODAL WITH ITEMISED TAXES & FINAL AMOUNT */}
      {checkoutModalOpen && selectedPlan && checkoutQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-[24px] border border-[#EAE8F2] shadow-2xl p-6 sm:p-7 space-y-5 animate-scale-up">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE8F2]">
              <div>
                <span className="text-[11px] font-bold text-[#6425E8] uppercase tracking-wider block">
                  Membership Checkout
                </span>
                <h3 className="text-lg font-bold text-[#17152F]">
                  Upgrade to {checkoutQuote.planName}
                </h3>
              </div>
              <button
                onClick={() => setCheckoutModalOpen(false)}
                className="p-1.5 rounded-lg text-[#77758B] hover:text-[#17152F] hover:bg-[#F2ECFF]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Price Breakdown with Itemized Taxes */}
            <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-[#EAE8F2] space-y-2.5">
              <div className="flex items-center justify-between text-xs text-[#77758B]">
                <span>Original Plan Price</span>
                <span className="line-through">₹{checkoutQuote.originalPrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-[#17152F]">
                <span>Discounted Plan Fee ({checkoutQuote.discountPercentage}% OFF)</span>
                <span>₹{checkoutQuote.basePrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#77758B]">
                <span>Applicable Goods & Services Tax (18% GST)</span>
                <span className="font-medium text-[#17152F]">+ ₹{checkoutQuote.taxAmount.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-[#EAE8F2] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#17152F] block">Final Payable Amount</span>
                  <span className="text-[10px] text-[#77758B]">Inclusive of all applicable Indian taxes</span>
                </div>
                <span className="text-2xl font-extrabold text-[#6425E8]">
                  ₹{checkoutQuote.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#17152F]">Select Payment Option</span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-2.5 rounded-xl border text-center transition-all font-semibold ${
                    paymentMethod === 'UPI'
                      ? 'border-[#6425E8] bg-[#F2ECFF] text-[#6425E8]'
                      : 'border-[#EAE8F2] text-[#555368] hover:bg-[#FAFAFC]'
                  }`}
                >
                  <Zap className="w-4 h-4 mx-auto mb-1 text-[#6425E8]" />
                  <span>UPI / QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Card')}
                  className={`p-2.5 rounded-xl border text-center transition-all font-semibold ${
                    paymentMethod === 'Card'
                      ? 'border-[#6425E8] bg-[#F2ECFF] text-[#6425E8]'
                      : 'border-[#EAE8F2] text-[#555368] hover:bg-[#FAFAFC]'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mx-auto mb-1 text-[#6425E8]" />
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('NetBanking')}
                  className={`p-2.5 rounded-xl border text-center transition-all font-semibold ${
                    paymentMethod === 'NetBanking'
                      ? 'border-[#6425E8] bg-[#F2ECFF] text-[#6425E8]'
                      : 'border-[#EAE8F2] text-[#555368] hover:bg-[#FAFAFC]'
                  }`}
                >
                  <Building className="w-4 h-4 mx-auto mb-1 text-[#6425E8]" />
                  <span>Net Banking</span>
                </button>
              </div>
            </div>

            {/* Confirm CTA */}
            <button
              disabled={processingPayment}
              onClick={handleConfirmSubscription}
              className="w-full h-11 rounded-xl bg-[#6425E8] hover:bg-[#521dc7] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#6425E8]/20 disabled:opacity-60"
            >
              {processingPayment ? (
                <span>Processing Bank Escrow...</span>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Pay ₹{checkoutQuote.totalAmount.toFixed(2)} & Activate Membership</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-[#77758B]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-Bit Encrypted Payment • Instant GST Tax Receipt</span>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN PRICE CONFIGURATION MODAL */}
      {adminModalOpen && editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-[24px] border border-[#EAE8F2] shadow-2xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE8F2]">
              <div>
                <h3 className="text-base font-bold text-[#17152F]">Admin: Configure Plan Prices</h3>
                <p className="text-xs text-[#77758B]">Updates pricing and discount rules directly in the backend</p>
              </div>
              <button
                onClick={() => setAdminModalOpen(false)}
                className="p-1 rounded-lg text-[#77758B] hover:text-[#17152F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2">
              {plans.map(p => (
                <button
                  key={p.id}
                  onClick={() => setEditingPlan(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    editingPlan.id === p.id
                      ? 'bg-[#6425E8] text-white'
                      : 'bg-[#F2ECFF] text-[#6425E8]'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="font-semibold text-[#17152F] block mb-1">Plan Name</label>
                <input
                  type="text"
                  value={editingPlan.name}
                  disabled
                  className="w-full h-9 px-3 rounded-xl bg-gray-50 border border-[#EAE8F2] text-gray-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#17152F] block mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={editingPlan.original_price}
                    onChange={e => setEditingPlan({ ...editingPlan, original_price: Number(e.target.value) })}
                    className="w-full h-9 px-3 rounded-xl border border-[#EAE8F2] text-[#17152F] focus:border-[#6425E8]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#17152F] block mb-1">Discounted Price (₹)</label>
                  <input
                    type="number"
                    value={editingPlan.discounted_price}
                    onChange={e => {
                      const discounted = Number(e.target.value);
                      const discountPct = Number((((editingPlan.original_price - discounted) / editingPlan.original_price) * 100).toFixed(2));
                      setEditingPlan({ ...editingPlan, discounted_price: discounted, discount_percentage: discountPct });
                    }}
                    className="w-full h-9 px-3 rounded-xl border border-[#EAE8F2] text-[#17152F] focus:border-[#6425E8]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#17152F] block mb-1">Calculated Discount Percentage</label>
                <div className="p-2.5 rounded-xl bg-[#F2ECFF] text-[#6425E8] font-bold text-xs">
                  {editingPlan.discount_percentage}% OFF
                </div>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#EAE8F2]">
              <button
                onClick={() => setAdminModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#77758B] hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePlanSettings}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#6425E8] text-white hover:bg-[#521dc7]"
              >
                Save Backend Prices
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );

  return isCreatorLoggedIn ? (
    <DashboardLayout>
      {content}
    </DashboardLayout>
  ) : (
    <div className="min-h-screen bg-[#FAFAFF] flex flex-col text-[#17152F]">
      <Navbar />
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-6 2xl:px-8 py-8">
        {content}
      </main>
      <footer className="py-6 border-t border-[#EAE8F2] text-center text-xs text-[#77758B] bg-white">
        © 2026 CreatorBridge. Secure collaboration marketplace for Indian creators & brands.
      </footer>
    </div>
  );
};
