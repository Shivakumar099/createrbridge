import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { formatINR, formatDate } from '../utils/helpers';
import {
  Wallet,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Download,
  Building2,
  ShieldCheck,
  FileText,
  CreditCard
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const PaymentsPage: React.FC = () => {
  const { transactions, collaborations, showToast } = useData();
  const { role } = useAuth();

  const isBrand = role === 'brand';

  // Earnings calculations
  const totalEarnings = 77000;
  const pendingPayments = 50000;
  const completedPayments = 77000;
  const totalSpend = 1420000;

  const campaignSpendingData = [
    { name: 'boAt Nirvana ANC', spend: 650000 },
    { name: 'Nykaa Glass Skin', spend: 450000 },
    { name: 'CultPass Challenge', spend: 520000 },
    { name: 'Zomato Gold', spend: 720000 },
  ];

  const handleDownloadInvoice = (invoiceNumber: string) => {
    showToast(
      'Invoice Downloaded',
      `Official GST Tax Invoice ${invoiceNumber} downloaded as PDF.`,
      'success'
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-[28px] animate-fade-in max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#6425E8] uppercase tracking-wider mb-1">
              <Wallet className="w-3.5 h-3.5" /> Escrow Financial Ledger
            </div>
            <h1 className="text-[30px] font-bold text-[#17152F] leading-tight">
              {isBrand ? 'Brand Payments & Spend Management' : 'Creator Earnings & Payouts'}
            </h1>
            <p className="text-[14px] text-[#77758B]">
              Bank-grade escrow protection guaranteeing deliverable milestones.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-[13px]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> CreatorBridge Escrow Protected
            </span>
          </div>
        </div>

        {/* 3 Metric Cards with 30px Bold Financial Figures */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-[20px]">
          <div className="p-[22px] rounded-[16px] bg-white border border-[#EAE8F2] shadow-subtle flex items-center justify-between">
            <div>
              <span className="text-[13px] text-[#77758B] font-medium block">
                {isBrand ? 'Total Campaign Budget Spent' : 'Total Cumulative Earnings'}
              </span>
              <span className="text-[30px] font-bold text-[#17152F] mt-1 block leading-tight">
                {formatINR(isBrand ? totalSpend : totalEarnings)}
              </span>
              <span className="text-[12px] text-emerald-600 font-semibold block mt-1">
                Verified Bank Disbursements
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#F2ECFF] text-[#6425E8] flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
          </div>

          <div className="p-[22px] rounded-[16px] bg-white border border-[#EAE8F2] shadow-subtle flex items-center justify-between">
            <div>
              <span className="text-[13px] text-[#77758B] font-medium block">
                {isBrand ? 'Funds Currently In Escrow' : 'Pending Milestone Escrow'}
              </span>
              <span className="text-[30px] font-bold text-[#6425E8] mt-1 block leading-tight">
                {formatINR(pendingPayments)}
              </span>
              <span className="text-[12px] text-[#77758B] font-medium block mt-1">
                Release upon deliverable sign-off
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#6425E8] flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="p-[22px] rounded-[16px] bg-white border border-[#EAE8F2] shadow-subtle flex items-center justify-between">
            <div>
              <span className="text-[13px] text-[#77758B] font-medium block">
                {isBrand ? 'Active Milestone Escrows' : 'Completed Disbursements'}
              </span>
              <span className="text-[30px] font-bold text-emerald-600 mt-1 block leading-tight">
                {formatINR(completedPayments)}
              </span>
              <span className="text-[12px] text-emerald-600 font-semibold block mt-1">
                Instant UPI / NEFT Transfer
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Campaign Breakdown Chart */}
        <div className="p-[22px] rounded-[16px] bg-white border border-[#EAE8F2] shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[22px] font-semibold text-[#17152F]">
                {isBrand ? 'Campaign-Wise Budget Allocation' : 'Campaign-Wise Creator Income'}
              </h3>
              <p className="text-[14px] text-[#77758B]">Financial breakdown across current and past partnerships</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaignSpendingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAE8F2" />
                <XAxis dataKey="name" stroke="#77758B" fontSize={12} />
                <YAxis stroke="#77758B" fontSize={12} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  formatter={(v: any) => [formatINR(v), 'Amount']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #EAE8F2',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
                  }}
                />
                <Bar dataKey="spend" fill="#6425E8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transaction History Ledger Table */}
        <div className="p-[22px] rounded-[16px] bg-white border border-[#EAE8F2] shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[22px] font-semibold text-[#17152F]">Transaction History & Tax Invoices</h3>
              <p className="text-[14px] text-[#77758B]">Download GST compliant receipts and payout statements</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-[#FAFAFF] text-[#77758B] uppercase tracking-wider text-[12px] font-semibold border-b border-[#EAE8F2]">
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Campaign</th>
                  <th className="py-3 px-4">Counterparty</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE8F2]/70">
                {transactions.map(txn => (
                  <tr key={txn.id} className="hover:bg-[#FAFAFF]/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#17152F] text-[13px]">
                      {txn.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#17152F]">
                      {txn.campaignTitle}
                    </td>
                    <td className="py-3.5 px-4 text-[#77758B]">
                      {txn.counterpartyName} ({txn.counterpartyRole})
                    </td>
                    <td className="py-3.5 px-4 text-[#77758B] text-[13px]">
                      {formatDate(txn.date)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#17152F]">
                      {formatINR(txn.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        txn.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDownloadInvoice(txn.invoiceNumber)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#EAE8F2] text-[#77758B] hover:text-[#6425E8] hover:border-[#6425E8]/30 hover:bg-[#FAFAFF] text-[12px] font-semibold transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
