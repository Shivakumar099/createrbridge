import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Navbar } from '../components/layout/Navbar';
import { safeApiCall } from '../utils/api';
import { SubscriptionPlan } from '../types';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  X,
  AlertTriangle,
  Receipt,
  Clock,
  ChevronRight,
  Download
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

interface CreatorMembershipPageProps {
  initialTab?: 'plans' | 'checkout' | 'billing' | 'manage';
}

export const CreatorMembershipPage: React.FC<CreatorMembershipPageProps> = ({ initialTab }) => {
  const { user, isAuthenticated, role, updateUser } = useAuth();
  const { showToast } = useData();
  const location = useLocation();
  const navigate = useNavigate();

  const isCreatorLoggedIn = isAuthenticated && role === 'creator';

  // Determine current active tab from prop or URL
  const determineTab = (): 'plans' | 'checkout' | 'billing' | 'manage' => {
    if (initialTab) return initialTab;
    if (location.pathname.includes('/billing')) return 'billing';
    if (location.pathname.includes('/manage')) return 'manage';
    if (location.pathname.includes('/checkout')) return 'checkout';
    return 'plans';
  };

  const [activeTab, setActiveTab] = useState<'plans' | 'checkout' | 'billing' | 'manage'>(determineTab());

  useEffect(() => {
    setActiveTab(determineTab());
  }, [location.pathname, initialTab]);

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
  const [activePlanId, setActivePlanId] = useState<string>(user?.membership?.planId || '');
  const [membershipStatus, setMembershipStatus] = useState<any>(null);
  const [paymentGatewayConfigured, setPaymentGatewayConfigured] = useState<boolean>(false);

  // Checkout State
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [checkoutQuote, setCheckoutQuote] = useState<CheckoutQuote | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  // Admin Config Modal State
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  // Billing history
  const [billingHistory, setBillingHistory] = useState<any[]>([
    {
      id: 'inv_101',
      invoiceNumber: 'INV-MEMB-891024',
      date: 'Nov 12, 2026',
      planName: 'Creator Premium',
      amount: 706.82,
      basePrice: 599,
      tax: 107.82,
      status: 'Paid'
    }
  ]);

  // Load plans & membership status from backend
  const loadMembershipData = async () => {
    try {
      const res = await safeApiCall<{ subscription_plans: SubscriptionPlan[] }>('/membership/plans');
      if (res.ok && res.data?.subscription_plans) {
        setPlans(res.data.subscription_plans);
      }

      if (isAuthenticated) {
        const statusRes = await safeApiCall<any>('/membership/status');
        if (statusRes.ok && statusRes.data) {
          setMembershipStatus(statusRes.data);
          if (statusRes.data.membership?.planId) {
            setActivePlanId(statusRes.data.membership.planId);
          }
        }
      }

      const healthRes = await safeApiCall<any>('/health');
      if (healthRes.ok && healthRes.data?.payments) {
        setPaymentGatewayConfigured(healthRes.data.payments.configured);
      }
    } catch {
      // Fallback in place
    }
  };

  useEffect(() => {
    loadMembershipData();
    if (user?.membership?.planId) {
      setActivePlanId(user.membership.planId);
    }
  }, [user, isAuthenticated]);

  // Handle plan selection
  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    try {
      const res = await safeApiCall<CheckoutQuote>('/membership/calculate', {
        method: 'POST',
        body: JSON.stringify({ planId: plan.id })
      });
      if (res.ok && res.data) {
        setCheckoutQuote(res.data);
      } else {
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
      setCheckoutModalOpen(true);
    }
  };

  // Secure checkout activation
  const handleInitiateOrder = async () => {
    if (!selectedPlan) return;
    setProcessingPayment(true);

    try {
      const orderRes = await safeApiCall<any>('/membership/create-order', {
        method: 'POST',
        body: JSON.stringify({ planId: selectedPlan.id })
      });

      if (orderRes.status === 503 || orderRes.data?.status === 'payment_gateway_not_configured') {
        showToast(
          'Gateway Credentials Required',
          'Razorpay payment gateway is not configured with live/test API keys. Please configure RAZORPAY_KEY_ID in server environment variables.',
          'warning'
        );
        return;
      }

      if (!orderRes.ok) {
        showToast('Payment Error', orderRes.error || 'Failed to initialize payment', 'error');
        return;
      }

      showToast('Payment In Progress', 'Please complete the verified payment checkout.', 'info');
    } catch (e: any) {
      showToast('Error', e.message, 'error');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Cancel subscription
  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your membership renewal? You will retain access until the end of your billing cycle. Existing collaborations and payments will NOT be deleted.')) {
      return;
    }

    try {
      const res = await safeApiCall('/membership/cancel', { method: 'POST' });
      if (res.ok) {
        showToast('Membership Cancellation Scheduled', 'Your membership will end at the conclusion of the billing cycle. Existing campaign earnings remain 100% safe.', 'info');
        loadMembershipData();
      } else {
        showToast('Error', res.error || 'Failed to cancel subscription', 'error');
      }
    } catch (e: any) {
      showToast('Error', e.message, 'error');
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
        loadMembershipData();
      } else {
        showToast('Access Denied', res.error || 'Only administrators can update plan pricing.', 'error');
      }
    } catch (e: any) {
      showToast('Error', e.message, 'error');
    }
  };

  const content = (
    <div className="space-y-[28px] animate-fade-in max-w-[1200px] mx-auto py-2">
      
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2ECFF] text-[#6425E8] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>CreatorBridge Creator Membership</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#17152F] tracking-tight">
          Elevate Your Content Creation Career
        </h1>
        <p className="text-sm sm:text-base text-[#77758B] leading-relaxed">
          Unlock unlimited brand campaign applications, AI script generation, and priority representation.
        </p>

        {/* Tab Navigation Navigation */}
        {isCreatorLoggedIn && (
          <div className="flex items-center justify-center gap-2 pt-3 flex-wrap">
            <button
              onClick={() => { setActiveTab('plans'); navigate('/creator/membership/plans'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'plans'
                  ? 'bg-[#6425E8] text-white shadow-sm'
                  : 'bg-white border border-[#EAE8F2] text-[#555368] hover:text-[#17152F]'
              }`}
            >
              Subscription Plans
            </button>
            <button
              onClick={() => { setActiveTab('manage'); navigate('/creator/membership/manage'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'manage'
                  ? 'bg-[#6425E8] text-white shadow-sm'
                  : 'bg-white border border-[#EAE8F2] text-[#555368] hover:text-[#17152F]'
              }`}
            >
              My Membership
            </button>
            <button
              onClick={() => { setActiveTab('billing'); navigate('/creator/membership/billing'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'billing'
                  ? 'bg-[#6425E8] text-white shadow-sm'
                  : 'bg-white border border-[#EAE8F2] text-[#555368] hover:text-[#17152F]'
              }`}
            >
              Billing & Invoices
            </button>
          </div>
        )}

        {/* Admin configure button if authenticated as admin */}
        {user?.role === 'admin' && (
          <div className="pt-1">
            <button
              onClick={() => {
                setEditingPlan(plans[1] || plans[0]);
                setAdminModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#77758B] hover:text-[#6425E8] transition-colors bg-white px-3 py-1 rounded-full border border-[#EAE8F2] shadow-2xs cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#6425E8]" />
              <span>Admin: Configure Plan Prices</span>
            </button>
          </div>
        )}
      </div>

      {/* Gateway Notice Banner when not configured */}
      {!paymentGatewayConfigured && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 text-xs max-w-4xl mx-auto">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold">Payment Gateway Setup Mode (Razorpay)</h4>
            <p className="leading-relaxed text-amber-800">
              Live payments require configuring <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">RAZORPAY_KEY_ID</code> and <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">RAZORPAY_KEY_SECRET</code> in the backend environment. In compliance with security policy, fake simulated payments are disabled.
            </p>
          </div>
        </div>
      )}

      {/* VIEW: PLANS & PRICING */}
      {(activeTab === 'plans' || activeTab === 'checkout') && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-2">
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
                    {/* Header */}
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

                    {/* Pricing */}
                    <div className="my-6 p-4 rounded-2xl bg-[#FAFAFC] border border-[#EAE8F2]/80 space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm text-[#9CA3AF] line-through font-semibold">
                          ₹{plan.original_price}
                        </span>
                        <span className="text-3xl sm:text-4xl font-extrabold text-[#17152F] tracking-tight">
                          ₹{plan.discounted_price}
                        </span>
                        <span className="text-xs text-[#77758B] font-medium">/ month</span>
                      </div>
                      <p className="text-[11px] text-[#77758B]">
                        + 18% GST (₹{((plan.discounted_price * 18) / 100).toFixed(2)}) • Billed monthly
                      </p>
                    </div>

                    {/* Features list */}
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

          {/* Feature Comparison Matrix Table */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#EAE8F2] shadow-subtle space-y-5 max-w-4xl mx-auto">
            <div className="flex items-center justify-between border-b border-[#EAE8F2] pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#17152F]">Detailed Plan Comparison</h3>
                <p className="text-xs text-[#77758B]">Authoritative feature allowances and limits</p>
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
        </div>
      )}

      {/* VIEW: MANAGE MEMBERSHIP */}
      {activeTab === 'manage' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#EAE8F2] shadow-subtle space-y-6 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE8F2] pb-6">
            <div>
              <span className="text-xs font-bold text-[#6425E8] uppercase tracking-wider block">
                Membership Overview
              </span>
              <h2 className="text-2xl font-bold text-[#17152F] mt-1">
                {user?.membership?.planName || 'Free Creator Account'}
              </h2>
              <p className="text-xs text-[#77758B] mt-0.5">
                Status: <span className="font-semibold text-emerald-600 capitalize">{user?.membership?.status || 'Active (Basic)'}</span>
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setActiveTab('plans'); navigate('/creator/membership/plans'); }}
                className="h-10 px-4 rounded-xl bg-[#6425E8] text-white text-xs font-bold hover:bg-[#521dc7] transition-all cursor-pointer"
              >
                Change or Upgrade Plan
              </button>
            </div>
          </div>

          {/* Usage Tracker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-[#EAE8F2] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#17152F]">AI Script Generations</span>
                <span className="font-bold text-[#6425E8]">
                  {membershipStatus?.usage?.scriptsUsed || 0} / {membershipStatus?.usage?.scriptsLimit || 30} used
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#EAE8F2] overflow-hidden">
                <div
                  className="h-full bg-[#6425E8] rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, Math.round(((membershipStatus?.usage?.scriptsUsed || 0) / (membershipStatus?.usage?.scriptsLimit || 30)) * 100))}%`
                  }}
                />
              </div>
              <p className="text-[11px] text-[#77758B]">
                Resets at the start of each monthly billing cycle.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-[#EAE8F2] space-y-1">
              <span className="text-xs font-semibold text-[#17152F] block">Campaign Application Status</span>
              <span className="text-lg font-bold text-emerald-600 block">Unlimited Applications</span>
              <p className="text-[11px] text-[#77758B]">
                Pitch to unlimited verified brand deals across India.
              </p>
            </div>
          </div>

          {/* Cancellation section */}
          {user?.membership?.status === 'active' && (
            <div className="pt-4 border-t border-[#EAE8F2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-[#17152F]">Cancel Membership Renewal</h4>
                <p className="text-[11px] text-[#77758B]">
                  Your access will remain active until the end of the period. Existing collaborations and payouts will never be deleted.
                </p>
              </div>
              <button
                onClick={handleCancelSubscription}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer"
              >
                Cancel Renewal
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW: BILLING & INVOICES */}
      {activeTab === 'billing' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#EAE8F2] shadow-subtle space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between border-b border-[#EAE8F2] pb-4">
            <div>
              <h3 className="text-lg font-bold text-[#17152F]">Billing History & GST Invoices</h3>
              <p className="text-xs text-[#77758B]">Download official tax invoices for your membership fees</p>
            </div>
            <Receipt className="w-5 h-5 text-[#6425E8]" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#EAE8F2] text-[#77758B]">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Invoice Number</th>
                  <th className="py-3 px-3">Plan</th>
                  <th className="py-3 px-3">Amount (inc. GST)</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE8F2] text-[#555368]">
                {billingHistory.map((inv, i) => (
                  <tr key={i} className="hover:bg-[#FAFAFC]">
                    <td className="py-3 px-3">{inv.date}</td>
                    <td className="py-3 px-3 font-mono font-medium text-[#17152F]">{inv.invoiceNumber}</td>
                    <td className="py-3 px-3 font-semibold text-[#17152F]">{inv.planName}</td>
                    <td className="py-3 px-3 font-bold text-[#17152F]">₹{inv.amount.toFixed(2)}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => showToast('Invoice Download', `Official Tax Invoice ${inv.invoiceNumber} downloaded as PDF.`, 'info')}
                        className="inline-flex items-center gap-1 text-[#6425E8] hover:underline font-semibold cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                className="p-1.5 rounded-lg text-[#77758B] hover:text-[#17152F] hover:bg-[#F2ECFF] cursor-pointer"
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
              <span className="text-xs font-bold text-[#17152F]">Payment Provider: Razorpay Secure Checkout</span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-2.5 rounded-xl border text-center transition-all font-semibold cursor-pointer ${
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
                  className={`p-2.5 rounded-xl border text-center transition-all font-semibold cursor-pointer ${
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
                  className={`p-2.5 rounded-xl border text-center transition-all font-semibold cursor-pointer ${
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
              onClick={handleInitiateOrder}
              className="w-full h-11 rounded-xl bg-[#6425E8] hover:bg-[#521dc7] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#6425E8]/20 disabled:opacity-60"
            >
              {processingPayment ? (
                <span>Connecting Payment Gateway...</span>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Pay ₹{checkoutQuote.totalAmount.toFixed(2)} via Razorpay</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-[#77758B]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Razorpay Verified • Cryptographic Signature Protected</span>
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
                <p className="text-xs text-[#77758B]">Authoritative prices saved directly in server database</p>
              </div>
              <button
                onClick={() => setAdminModalOpen(false)}
                className="p-1 rounded-lg text-[#77758B] hover:text-[#17152F] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2">
              {plans.map(p => (
                <button
                  key={p.id}
                  onClick={() => setEditingPlan(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                <label className="font-semibold text-[#17152F] block mb-1">Calculated Discount</label>
                <div className="p-2.5 rounded-xl bg-[#F2ECFF] text-[#6425E8] font-bold text-xs">
                  {editingPlan.discount_percentage}% OFF
                </div>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#EAE8F2]">
              <button
                onClick={() => setAdminModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#77758B] hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePlanSettings}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#6425E8] text-white hover:bg-[#521dc7] cursor-pointer"
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
