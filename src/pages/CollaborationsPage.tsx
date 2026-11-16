import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Collaboration, CollaborationStatus } from '../types';
import { formatINR, formatDate } from '../utils/helpers';
import { Link } from 'react-router-dom';
import {
  GitPullRequest,
  CheckCircle2,
  Clock,
  Sparkles,
  Film,
  Send,
  Upload,
  ExternalLink,
  Wallet,
  AlertCircle,
  FileText,
  MessageSquare,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

export const CollaborationsPage: React.FC = () => {
  const { collaborations, updateCollaborationStep, showToast } = useData();
  const { user, role } = useAuth();

  const isBrand = role === 'brand';

  // Filter collaborations for current user
  const relevantCollabs = collaborations.filter(c =>
    isBrand ? c.brandId === user?.id || c.brandId === 'brand_boat' : c.creatorId === user?.id || c.creatorId === 'user_creator_1'
  );

  const [selectedCollabId, setSelectedCollabId] = useState<string>(relevantCollabs[0]?.id || collaborations[0]?.id);
  const activeCollab = collaborations.find(c => c.id === selectedCollabId) || collaborations[0];

  // Forms for interaction
  const [contentUrl, setContentUrl] = useState('https://instagram.com/reel/demo_creatorbridge');
  const [contentNotes, setContentNotes] = useState('Added the hybrid ANC transition at 0:12 as discussed in script!');
  const [revisionNotes, setRevisionNotes] = useState('');

  // 14-step workflow stages
  const workflowSteps: { key: CollaborationStatus; label: string; desc: string }[] = [
    { key: 'brief_received', label: '1. Brief Received', desc: 'Campaign brief dispatched to creator' },
    { key: 'script_generated', label: '2. Script Generated', desc: 'AI Script drafted by creator' },
    { key: 'script_submitted', label: '3. Script Under Review', desc: 'Submitted to brand manager' },
    { key: 'script_approved', label: '4. Script Approved', desc: 'Brand approved scene breakdown' },
    { key: 'content_in_production', label: '5. In Production', desc: 'Shooting and video editing' },
    { key: 'content_submitted', label: '6. Content Submitted', desc: 'Video link uploaded for review' },
    { key: 'approved', label: '7. Deliverable Approved', desc: 'Brand confirmed content quality' },
    { key: 'payment_completed', label: '8. Payment Released', desc: 'Milestone escrow transferred' },
  ];

  const currentStepIndex = workflowSteps.findIndex(s => s.key === activeCollab?.status) !== -1
    ? workflowSteps.findIndex(s => s.key === activeCollab?.status)
    : activeCollab?.status === 'revision_requested' ? 2 : 0;

  // Actions
  const handleCreatorSubmitScript = () => {
    updateCollaborationStep(activeCollab.id, {
      status: 'script_submitted'
    });
  };

  const handleBrandApproveScript = () => {
    updateCollaborationStep(activeCollab.id, {
      status: 'script_approved'
    });
  };

  const handleBrandRequestScriptRevision = () => {
    if (!revisionNotes) {
      showToast('Please add revision feedback', 'Let the creator know what scenes need changes.', 'warning');
      return;
    }
    updateCollaborationStep(activeCollab.id, {
      status: 'revision_requested',
      revisionFeedback: revisionNotes
    });
    setRevisionNotes('');
  };

  const handleCreatorStartProduction = () => {
    updateCollaborationStep(activeCollab.id, {
      status: 'content_in_production'
    });
  };

  const handleCreatorUploadContent = () => {
    if (!contentUrl) {
      showToast('URL required', 'Please provide a valid video preview link.', 'warning');
      return;
    }
    updateCollaborationStep(activeCollab.id, {
      status: 'content_submitted',
      submittedContentUrl: contentUrl,
      submittedContentNotes: contentNotes
    });
  };

  const handleBrandApproveContent = () => {
    updateCollaborationStep(activeCollab.id, {
      status: 'approved'
    });
  };

  const handleBrandReleasePayment = () => {
    updateCollaborationStep(activeCollab.id, {
      status: 'payment_completed',
      paymentStatus: 'paid'
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-[28px] animate-fade-in max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#6425E8] uppercase tracking-wider mb-1">
              <GitPullRequest className="w-3.5 h-3.5" /> 14-Step Collaboration Pipeline
            </div>
            <h1 className="text-[30px] font-bold text-[#17152F] leading-tight">
              Campaign Collaborations
            </h1>
            <p className="text-[14px] text-[#77758B]">
              Real-time milestone tracking between {isBrand ? 'your brand and creators' : 'you and brands'}.
            </p>
          </div>
        </div>

        {/* Collaboration Selector Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {relevantCollabs.map(collab => {
            const isSelected = collab.id === selectedCollabId;
            return (
              <button
                key={collab.id}
                onClick={() => setSelectedCollabId(collab.id)}
                className={`flex-shrink-0 flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white border-[#6425E8] shadow-sm ring-1 ring-[#6425E8]'
                    : 'bg-white/80 border-[#EAE8F2] hover:border-[#6425E8]/30'
                }`}
              >
                <img
                  src={isBrand ? collab.creatorAvatar : collab.brandLogo}
                  alt={isBrand ? collab.creatorName : collab.brandName}
                  className="w-10 h-10 rounded-xl object-cover border border-[#EAE8F2]"
                />
                <div className="min-w-0 pr-2">
                  <span className="text-[14px] font-semibold text-[#17152F] block truncate">
                    {isBrand ? collab.creatorName : collab.brandName}
                  </span>
                  <span className="text-[12px] text-[#77758B] truncate block max-w-[160px]">
                    {collab.campaignTitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {activeCollab && (
          <div className="space-y-[28px]">
            {/* COLLABORATION OVERVIEW HERO */}
            <div className="p-[22px] rounded-[16px] bg-white border border-[#EAE8F2] shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <img
                  src={isBrand ? activeCollab.creatorAvatar : activeCollab.brandLogo}
                  alt="Partner Logo"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#F2ECFF] shadow-sm"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[22px] font-semibold text-[#17152F] leading-snug">
                      {activeCollab.campaignTitle}
                    </h2>
                  </div>
                  <p className="text-[14px] text-[#77758B]">
                    Collaborating with: <strong className="text-[#6425E8] font-semibold">{isBrand ? activeCollab.creatorName : activeCollab.brandName}</strong>
                  </p>
                  <p className="text-[12px] text-[#77758B]">
                    Deliverables: {activeCollab.deliverables.join(' • ')} | Deadline: {formatDate(activeCollab.deadline)}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FAFAFF] border border-[#EAE8F2] text-right self-stretch sm:self-auto flex sm:flex-col justify-between sm:justify-center items-center sm:items-end">
                <span className="text-[12px] text-[#77758B] uppercase font-semibold">Escrow Milestone</span>
                <span className="text-[30px] font-bold text-[#17152F] leading-tight">
                  {formatINR(activeCollab.paymentAmount)}
                </span>
                <span className={`text-[12px] font-semibold px-2.5 py-0.5 rounded-full mt-1 ${
                  activeCollab.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-[#F2ECFF] text-[#6425E8]'
                }`}>
                  {activeCollab.paymentStatus === 'paid' ? 'Paid to Bank' : 'Escrow Secured'}
                </span>
              </div>
            </div>

            {/* 14-STEP WORKFLOW TRACKER */}
            <div className="p-[22px] rounded-[16px] bg-white border border-[#EAE8F2] shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[16px] font-semibold text-[#17152F]">
                    Collaboration Lifecycle Milestones
                  </h3>
                  <p className="text-[13px] text-[#77758B]">Step-by-step progress from brief to guaranteed payment release</p>
                </div>
                <span className="text-[13px] font-semibold text-[#6425E8] bg-[#F2ECFF] px-3 py-1 rounded-full">
                  Step {currentStepIndex + 1} of {workflowSteps.length}
                </span>
              </div>

              {/* Responsive Step Progression Visualizer - No text truncation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2.5 pt-2">
                {workflowSteps.map((step, idx) => {
                  const isCompleted = idx < currentStepIndex || activeCollab.status === 'payment_completed';
                  const isCurrent = idx === currentStepIndex && activeCollab.status !== 'payment_completed';

                  return (
                    <div
                      key={step.key}
                      className={`p-3 rounded-xl border text-center flex flex-col justify-between min-h-[90px] transition-all ${
                        isCompleted
                          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                          : isCurrent
                          ? 'bg-[#6425E8] text-white border-[#6425E8] shadow-md'
                          : 'bg-[#FAFAFF] border-[#EAE8F2] text-[#77758B]'
                      }`}
                    >
                      <div className="flex justify-center mb-1.5">
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : isCurrent ? (
                          <Sparkles className="w-5 h-5 text-white animate-spin" />
                        ) : (
                          <span className="w-5 h-5 rounded-full border border-[#77758B] flex items-center justify-center text-[11px] font-bold">
                            {idx + 1}
                          </span>
                        )}
                      </div>
                      <span className={`text-[12px] font-semibold leading-snug break-words ${isCurrent ? 'text-white' : ''}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* INTERACTIVE WORKFLOW ACTION STATIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Script Station */}
              <div className="lg:col-span-6 p-6 rounded-card bg-surface-card border border-surface-border shadow-subtle space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-content-primary flex items-center gap-2">
                      <FileText className="w-4 h-4 text-brand-primary" />
                      Campaign Script Draft
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-brand-light text-brand-primary">
                      {activeCollab.script ? 'Script Ready' : 'Awaiting Generation'}
                    </span>
                  </div>

                  {activeCollab.script ? (
                    <div className="p-4 rounded-xl bg-surface-bg border border-surface-border text-xs space-y-2">
                      <div className="font-bold text-content-primary">{activeCollab.script.title}</div>
                      <p className="text-content-secondary italic">"{activeCollab.script.hook}"</p>
                      <div className="pt-2 text-[11px] text-content-muted">
                        {activeCollab.script.scenes.length} Scenes Breakdown Attached
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-content-secondary">
                      No script attached yet. Use CreatorBridge AI Script Writer to generate hook & scenes from the brand brief.
                    </p>
                  )}

                  {activeCollab.revisionFeedback && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                      <strong>Brand Feedback:</strong> {activeCollab.revisionFeedback}
                    </div>
                  )}
                </div>

                {/* Role Specific Actions for Script */}
                <div className="pt-4 border-t border-surface-border/60 flex flex-wrap gap-2">
                  {!isBrand ? (
                    <>
                      <Link
                        to="/creator/ai-script-writer"
                        className="px-4 py-2 rounded-xl border border-brand-primary text-brand-primary text-xs font-semibold hover:bg-brand-light"
                      >
                        Open in AI Script Writer
                      </Link>
                      {activeCollab.status === 'script_generated' && (
                        <button
                          onClick={handleCreatorSubmitScript}
                          className="px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-secondary shadow-xs"
                        >
                          Submit Script to Brand
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {activeCollab.status === 'script_submitted' && (
                        <div className="w-full space-y-2">
                          <input
                            type="text"
                            placeholder="Optional revision request notes..."
                            value={revisionNotes}
                            onChange={e => setRevisionNotes(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleBrandApproveScript}
                              className="flex-1 py-2 rounded-xl bg-status-success text-white text-xs font-semibold hover:bg-green-700 shadow-xs flex items-center justify-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve Script
                            </button>
                            <button
                              onClick={handleBrandRequestScriptRevision}
                              className="px-3 py-2 rounded-xl border border-surface-border text-xs font-semibold text-content-secondary hover:bg-surface-bg"
                            >
                              Request Revision
                            </button>
                          </div>
                        </div>
                      )}
                      {activeCollab.status === 'script_approved' && (
                        <span className="text-xs font-semibold text-status-success flex items-center gap-1">
                          ✓ Script Approved. Creator is in production.
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Content Production & Delivery Station */}
              <div className="lg:col-span-6 p-6 rounded-card bg-surface-card border border-surface-border shadow-subtle space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-content-primary flex items-center gap-2">
                      <Film className="w-4 h-4 text-brand-primary" />
                      Content Production & Upload
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-brand-light text-brand-primary">
                      {activeCollab.submittedContentUrl ? 'Content Submitted' : 'In Production'}
                    </span>
                  </div>

                  {!isBrand && activeCollab.status === 'script_approved' && (
                    <div className="space-y-3 text-xs">
                      <p className="text-content-secondary">
                        Script approved! Shoot your footage and paste your video preview link below.
                      </p>
                      <input
                        type="url"
                        placeholder="Google Drive, Dropbox, or unlisted YouTube link..."
                        value={contentUrl}
                        onChange={e => setContentUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-brand-primary"
                      />
                      <textarea
                        rows={2}
                        placeholder="Notes for brand reviewer..."
                        value={contentNotes}
                        onChange={e => setContentNotes(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-brand-primary"
                      />
                      <button
                        onClick={handleCreatorUploadContent}
                        className="w-full py-2.5 rounded-xl bg-brand-primary text-white font-semibold text-xs hover:bg-brand-secondary shadow-md shadow-brand-primary/20 flex items-center justify-center gap-1.5"
                      >
                        <Upload className="w-4 h-4" /> Upload Content for Review
                      </button>
                    </div>
                  )}

                  {activeCollab.submittedContentUrl && (
                    <div className="p-4 rounded-xl bg-surface-bg border border-surface-border text-xs space-y-2">
                      <div className="font-bold text-content-primary">Uploaded Video Preview:</div>
                      <a
                        href={activeCollab.submittedContentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-primary font-semibold hover:underline flex items-center gap-1"
                      >
                        {activeCollab.submittedContentUrl}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      {activeCollab.submittedContentNotes && (
                        <p className="text-content-secondary">{activeCollab.submittedContentNotes}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Brand Review Content & Release Payment */}
                <div className="pt-4 border-t border-surface-border/60">
                  {isBrand && activeCollab.status === 'content_submitted' && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleBrandApproveContent}
                        className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-secondary shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve Content Deliverable
                      </button>
                    </div>
                  )}

                  {isBrand && activeCollab.status === 'approved' && (
                    <button
                      onClick={handleBrandReleasePayment}
                      className="w-full py-3 rounded-xl bg-status-success text-white text-xs font-bold hover:bg-green-700 transition-all shadow-md shadow-green-600/25 flex items-center justify-center gap-2"
                    >
                      <Wallet className="w-4 h-4" /> Release Escrow Payment ({formatINR(activeCollab.paymentAmount)})
                    </button>
                  )}

                  {activeCollab.status === 'payment_completed' && (
                    <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-xs text-status-success font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Collaboration Completed & Paid in Full!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
