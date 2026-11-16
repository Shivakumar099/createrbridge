import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ScriptDraft, ScriptScene } from '../types';
import {
  Sparkles,
  Copy,
  Download,
  RotateCw,
  Save,
  Check,
  Languages,
  Film,
  Sliders,
  AlertTriangle,
  Info,
  CheckCircle2,
  FileText,
  Clock,
  Layers,
  Edit3
} from 'lucide-react';

export const AIScriptWriterPage: React.FC = () => {
  const { campaigns, collaborations, generateAIScript, saveScriptToCollaboration, showToast } = useData();
  const { user } = useAuth();

  // Step 1: Campaign Brief selection
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id || '');
  const activeCampaign = campaigns.find(c => c.id === selectedCampaignId) || campaigns[0];

  // Step 2: Content Format
  const formats = [
    'Instagram Reel',
    'Instagram Story',
    'Instagram Post',
    'YouTube Short',
    'YouTube Video',
    'Product Review',
    'Promotional Video'
  ];
  const [selectedFormat, setSelectedFormat] = useState('Instagram Reel');

  // Step 3: Script Style
  const styles = [
    'Storytelling',
    'Informative',
    'Entertaining',
    'Promotional',
    'Educational',
    'Trend-based',
    'Emotional'
  ];
  const [selectedStyle, setSelectedStyle] = useState('Storytelling');

  // Language & Tone
  const languages = ['English', 'Hindi', 'Kannada', 'Hinglish', 'Tamil', 'Telugu'];
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  // Script output state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<ScriptDraft | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scriptVersion, setScriptVersion] = useState(1);

  // Editable fields
  const [editHook, setEditHook] = useState('');
  const [editScenes, setEditScenes] = useState<ScriptScene[]>([]);
  const [editCTA, setEditCTA] = useState('');
  const [editCaption, setEditCaption] = useState('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const script = await generateAIScript({
        campaignId: selectedCampaignId,
        format: selectedFormat,
        style: selectedStyle,
        language: selectedLanguage
      });

      setGeneratedScript(script);
      setEditHook(script.hook);
      setEditScenes(script.scenes);
      setEditCTA(script.cta);
      setEditCaption(script.caption);
      setIsEditing(false);
      showToast('AI Script Generated!', `Script generated following ${activeCampaign.brandName} brand guidelines.`);
    } catch (e) {
      showToast('Generation Failed', 'Could not generate script at this time.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    setScriptVersion(prev => prev + 1);
    await handleGenerate();
  };

  const handleCopy = () => {
    if (!generatedScript) return;
    const fullText = `
TITLE: ${generatedScript.title} (v${scriptVersion})
FORMAT: ${selectedFormat} | STYLE: ${selectedStyle} | LANGUAGE: ${selectedLanguage}

HOOK (FIRST 3 SECONDS):
${editHook}

SCENE BREAKDOWN:
${editScenes.map(s => `SCENE ${s.sceneNumber}:
Visual: ${s.visual}
Voiceover: ${s.voiceover}
On-Screen Text: ${s.onScreenText}
`).join('\n')}

PRODUCT PLACEMENT:
${generatedScript.productPlacement}

CALL TO ACTION:
${editCTA}

CAPTION:
${editCaption}

HASHTAGS:
${generatedScript.hashtags.join(' ')}

DISCLAIMER:
${generatedScript.disclaimer}
`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    showToast('Copied to Clipboard!', 'Complete script breakdown ready to paste.');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportText = () => {
    if (!generatedScript) return;
    const element = document.createElement("a");
    const fullText = `CreatorBridge AI Script Breakdown\n\nTitle: ${generatedScript.title}\nBrand: ${activeCampaign.brandName}\nFormat: ${selectedFormat}\n\nHOOK:\n${editHook}\n\nSCENES:\n${editScenes.map(s => `Scene ${s.sceneNumber}:\n[Visual] ${s.visual}\n[Voiceover] ${s.voiceover}\n[Text] ${s.onScreenText}\n`).join('\n')}\nCTA: ${editCTA}\n\nCaption: ${editCaption}\n\n${generatedScript.disclaimer}`;
    const file = new Blob([fullText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${activeCampaign.brandName.replace(/\s+/g, '_')}_script_v${scriptVersion}.txt`;
    document.body.appendChild(element);
    element.click();
    showToast('Exported Script!', 'Script file downloaded successfully.');
  };

  const handleSaveToCollab = async () => {
    if (!generatedScript) return;
    // Find matching active collaboration for this campaign
    const targetCollab = collaborations.find(c => c.campaignId === selectedCampaignId) || collaborations[0];
    if (targetCollab) {
      await saveScriptToCollaboration(targetCollab.id, {
        ...generatedScript,
        hook: editHook,
        scenes: editScenes,
        cta: editCTA,
        caption: editCaption,
        versionNumber: scriptVersion
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-[28px] animate-fade-in max-w-[1020px] mx-auto">
        {/* Header */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2ECFF] border border-[#6425E8]/20 text-[#6425E8] text-[12px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Brief-Driven Content Intelligence
          </div>
          <h1 className="text-[30px] font-bold text-[#17152F] leading-tight">
            AI Script Writer
          </h1>
          <p className="text-[14px] text-[#77758B] max-w-3xl leading-relaxed">
            Automatically transform official brand briefs into viral, production-ready scripts. Adheres strictly to approved product benefits, required CTAs, and compliance guidelines without fabricating claims.
          </p>
        </div>

        {/* STEP-BY-STEP WORKFLOW CONFIGURATION CARD */}
        <div className="p-[22px] rounded-[16px] bg-white border border-[#EAE8F2] shadow-subtle space-y-6">
          {/* STEP 1: Select Brand Brief */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#6425E8] text-white text-[12px] font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="text-[16px] font-semibold text-[#17152F]">
                Select Brand Campaign Brief
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-[#77758B] mb-1.5">
                  Active Campaign
                </label>
                <select
                  value={selectedCampaignId}
                  onChange={e => setSelectedCampaignId(e.target.value)}
                  className="w-full h-[46px] px-3.5 rounded-xl border border-[#EAE8F2] bg-white text-[14px] font-medium text-[#17152F] focus:outline-none focus:border-[#6425E8]"
                >
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.brandName} — {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#77758B] mb-1.5">
                  Target Product / Service
                </label>
                <input
                  type="text"
                  disabled
                  value={activeCampaign?.product || 'boAt Nirvana Ion ANC'}
                  className="w-full h-[46px] px-3.5 rounded-xl border border-[#EAE8F2] bg-[#FAFAFF] text-[14px] font-medium text-[#77758B]"
                />
              </div>
            </div>

            {/* Displaying extracted brand brief parameters */}
            {activeCampaign && (
              <div className="p-4 rounded-xl bg-[#FAFAFF] border border-[#EAE8F2] text-[13px] space-y-1.5 leading-relaxed">
                <div className="font-bold text-[#17152F] text-[13px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Loaded Brief Guidelines for {activeCampaign.brandName}:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[#77758B]">
                  <div><strong className="text-[#17152F]">Key Message:</strong> {activeCampaign.brief.keyMessage}</div>
                  <div><strong className="text-[#17152F]">Mandatory CTA:</strong> {activeCampaign.brief.requiredCTA}</div>
                  <div><strong className="text-[#17152F]">Benefits:</strong> {activeCampaign.brief.productBenefits.join(', ')}</div>
                  {activeCampaign.brief.specialOffers && (
                    <div><strong className="text-[#17152F]">Special Offers:</strong> {activeCampaign.brief.specialOffers}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: Choose Content Format */}
          <div className="space-y-3 pt-4 border-t border-[#EAE8F2]">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#6425E8] text-white text-[12px] font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="text-[16px] font-semibold text-[#17152F]">
                Choose Content Format
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {formats.map(fmt => (
                <button
                  type="button"
                  key={fmt}
                  onClick={() => setSelectedFormat(fmt)}
                  className={`text-[13px] px-4 py-2 rounded-xl font-semibold border transition-all cursor-pointer ${
                    selectedFormat === fmt
                      ? 'bg-[#6425E8] text-white border-[#6425E8] shadow-xs'
                      : 'bg-white text-[#77758B] border-[#EAE8F2] hover:border-[#6425E8]/30 hover:text-[#17152F]'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 3: Choose Style & Language */}
          <div className="space-y-3 pt-4 border-t border-[#EAE8F2]">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#6425E8] text-white text-[12px] font-bold flex items-center justify-center">
                3
              </span>
              <h3 className="text-[16px] font-semibold text-[#17152F]">
                Choose Script Style & Language
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-[#77758B] mb-2">
                  Narrative Style
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {styles.map(st => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setSelectedStyle(st)}
                      className={`text-[13px] px-3.5 py-1.5 rounded-lg font-medium border transition-all cursor-pointer ${
                        selectedStyle === st
                          ? 'bg-[#6425E8] text-white border-[#6425E8]'
                          : 'bg-white text-[#77758B] border-[#EAE8F2] hover:border-[#6425E8]/30 hover:text-[#17152F]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#77758B] mb-2">
                  Script Language
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {languages.map(lang => (
                    <button
                      type="button"
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`text-[13px] px-3.5 py-1.5 rounded-lg font-medium border transition-all cursor-pointer ${
                        selectedLanguage === lang
                          ? 'bg-[#6425E8] text-white border-[#6425E8]'
                          : 'bg-white text-[#77758B] border-[#EAE8F2] hover:border-[#6425E8]/30 hover:text-[#17152F]'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* GENERATE ACTION BUTTON */}
          <div className="pt-4 border-t border-[#EAE8F2]">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="h-[46px] w-full sm:w-auto flex items-center justify-center gap-2 px-8 rounded-xl bg-[#6425E8] text-white font-semibold text-[14px] hover:bg-[#521dc7] transition-all shadow-md shadow-[#6425E8]/20 disabled:opacity-60 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  Generating Script from Brand Brief...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate AI Content Script
                </>
              )}
            </button>
          </div>
        </div>

        {/* STEP 4: GENERATED SCRIPT OUTPUT */}
        {generatedScript && (
          <div className="p-[22px] rounded-[16px] bg-white border border-[#EAE8F2] shadow-card space-y-6 animate-slide-up">
            {/* Output Header with Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#EAE8F2] gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[22px] font-semibold text-[#17152F]">
                    {generatedScript.title}
                  </h3>
                  <span className="text-[12px] px-2.5 py-0.5 rounded-full bg-[#F2ECFF] text-[#6425E8] font-bold">
                    v{scriptVersion}
                  </span>
                </div>
                <p className="text-[13px] text-[#77758B] mt-0.5">
                  {selectedFormat} • {selectedStyle} Style • {selectedLanguage}
                </p>
              </div>

              {/* Action Toolbar with standard 38-42px buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="h-[38px] flex items-center gap-1.5 px-3.5 rounded-xl border border-[#EAE8F2] text-[13px] font-semibold text-[#77758B] hover:text-[#6425E8] hover:bg-[#FAFAFF] transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {isEditing ? 'Done Editing' : 'Edit Script'}
                </button>

                <button
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="h-[38px] flex items-center gap-1.5 px-3.5 rounded-xl border border-[#EAE8F2] text-[13px] font-semibold text-[#77758B] hover:text-[#6425E8] hover:bg-[#FAFAFF] transition-colors cursor-pointer"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  Regenerate
                </button>

                <button
                  onClick={handleCopy}
                  className="h-[38px] flex items-center gap-1.5 px-3.5 rounded-xl border border-[#EAE8F2] text-[13px] font-semibold text-[#77758B] hover:text-[#6425E8] hover:bg-[#FAFAFF] transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>

                <button
                  onClick={handleExportText}
                  className="h-[38px] flex items-center gap-1.5 px-3.5 rounded-xl border border-[#EAE8F2] text-[13px] font-semibold text-[#77758B] hover:text-[#6425E8] hover:bg-[#FAFAFF] transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export
                </button>

                <button
                  onClick={handleSaveToCollab}
                  className="h-[38px] flex items-center gap-1.5 px-4 rounded-xl bg-[#6425E8] hover:bg-[#521dc7] text-white text-[13px] font-semibold transition-all shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save
                </button>
              </div>
            </div>

            {/* Hook Section (First 3 Seconds) */}
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-primary flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Hook (First 3 Seconds)
              </span>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={editHook}
                  onChange={e => setEditHook(e.target.value)}
                  className="w-full p-2 text-xs font-bold rounded-lg border border-purple-300 bg-white"
                />
              ) : (
                <p className="text-sm font-extrabold text-content-primary leading-snug">
                  "{editHook}"
                </p>
              )}
            </div>

            {/* Scene-by-Scene Breakdown Table/Cards */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-content-muted">
                Scene-by-Scene Breakdown
              </h4>

              <div className="space-y-3">
                {editScenes.map((scene, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-surface-border bg-surface-bg space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between font-bold text-content-primary">
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-brand-light text-brand-primary text-[10px] flex items-center justify-center font-bold">
                          {scene.sceneNumber}
                        </span>
                        Scene {scene.sceneNumber}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                      <div>
                        <strong className="text-content-secondary block mb-1">Visual Direction:</strong>
                        {isEditing ? (
                          <textarea
                            rows={3}
                            value={scene.visual}
                            onChange={e => {
                              const updated = [...editScenes];
                              updated[idx].visual = e.target.value;
                              setEditScenes(updated);
                            }}
                            className="w-full p-2 text-xs rounded-lg border bg-white"
                          />
                        ) : (
                          <p className="text-content-primary leading-relaxed">{scene.visual}</p>
                        )}
                      </div>

                      <div>
                        <strong className="text-content-secondary block mb-1">Voiceover / Dialogue:</strong>
                        {isEditing ? (
                          <textarea
                            rows={3}
                            value={scene.voiceover}
                            onChange={e => {
                              const updated = [...editScenes];
                              updated[idx].voiceover = e.target.value;
                              setEditScenes(updated);
                            }}
                            className="w-full p-2 text-xs rounded-lg border bg-white"
                          />
                        ) : (
                          <p className="text-content-primary leading-relaxed italic">"{scene.voiceover}"</p>
                        )}
                      </div>

                      <div>
                        <strong className="text-content-secondary block mb-1">On-Screen Text:</strong>
                        {isEditing ? (
                          <input
                            type="text"
                            value={scene.onScreenText}
                            onChange={e => {
                              const updated = [...editScenes];
                              updated[idx].onScreenText = e.target.value;
                              setEditScenes(updated);
                            }}
                            className="w-full p-2 text-xs rounded-lg border bg-white"
                          />
                        ) : (
                          <span className="inline-block px-2.5 py-1 rounded-md bg-white border border-surface-border text-content-primary font-semibold">
                            {scene.onScreenText}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Placement & CTA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-surface-border bg-white space-y-1">
                <span className="font-bold text-content-primary block">Product Placement Instructions:</span>
                <p className="text-content-secondary leading-relaxed">{generatedScript.productPlacement}</p>
              </div>

              <div className="p-4 rounded-xl border border-surface-border bg-white space-y-1">
                <span className="font-bold text-content-primary block">Mandatory Call to Action:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editCTA}
                    onChange={e => setEditCTA(e.target.value)}
                    className="w-full p-2 rounded-lg border bg-white text-xs"
                  />
                ) : (
                  <p className="text-brand-primary font-bold leading-relaxed">{editCTA}</p>
                )}
              </div>
            </div>

            {/* Caption & Hashtags */}
            <div className="p-4 rounded-xl border border-surface-border bg-white space-y-2 text-xs">
              <span className="font-bold text-content-primary block">Suggested Caption & Hashtags:</span>
              {isEditing ? (
                <textarea
                  rows={3}
                  value={editCaption}
                  onChange={e => setEditCaption(e.target.value)}
                  className="w-full p-2 rounded-lg border bg-white text-xs"
                />
              ) : (
                <p className="text-content-secondary leading-relaxed">{editCaption}</p>
              )}

              <div className="flex flex-wrap gap-1 pt-1">
                {generatedScript.hashtags.map((tag, idx) => (
                  <span key={idx} className="text-[11px] font-semibold text-brand-primary bg-brand-light px-2 py-0.5 rounded-md">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Mandatory Compliance Disclaimer */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
              <div>
                <strong className="block font-bold">CreatorBridge AI Compliance Disclaimer:</strong>
                <span className="leading-relaxed">
                  {generatedScript.disclaimer}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
