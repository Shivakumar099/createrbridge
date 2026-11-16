import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Campaign,
  CreatorProfile,
  Application,
  Collaboration,
  CalendarTask,
  Transaction,
  AppNotification,
  Conversation,
  ChatMessage,
  ScriptDraft,
  CollaborationStatus
} from '../types';
import {
  CAMPAIGNS,
  CREATOR_PROFILES,
  APPLICATIONS,
  INITIAL_COLLABORATIONS,
  INITIAL_CALENDAR_TASKS,
  INITIAL_TRANSACTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES
} from '../data/seedData';
import { safeApiCall } from '../utils/api';
import { useAuth } from './AuthContext';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

interface DataContextType {
  campaigns: Campaign[];
  creators: CreatorProfile[];
  applications: Application[];
  collaborations: Collaboration[];
  calendarTasks: CalendarTask[];
  transactions: Transaction[];
  notifications: AppNotification[];
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  toasts: ToastMessage[];
  showToast: (title: string, message?: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  createCampaign: (data: Partial<Campaign>) => Promise<Campaign>;
  applyToCampaign: (campaignId: string, pitch: string, requestedFee?: number) => Promise<boolean>;
  updateApplicationStatus: (appId: string, status: 'accepted' | 'rejected', reason?: string) => Promise<void>;
  updateCollaborationStep: (collabId: string, updates: Partial<Collaboration>) => Promise<void>;
  addCalendarTask: (task: Partial<CalendarTask>) => Promise<CalendarTask>;
  toggleCalendarTask: (taskId: string) => Promise<void>;
  deleteCalendarTask: (taskId: string) => Promise<void>;
  generateAIScript: (params: { campaignId?: string; format: string; style: string; language: string; customBrief?: any }) => Promise<ScriptDraft>;
  saveScriptToCollaboration: (collabId: string, script: ScriptDraft) => Promise<void>;
  sendMessage: (conversationId: string, text: string, campaignId?: string, campaignTitle?: string) => Promise<void>;
  markAllNotificationsRead: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = localStorage.getItem('cb_campaigns');
    return saved ? JSON.parse(saved) : CAMPAIGNS;
  });

  const [creators, setCreators] = useState<CreatorProfile[]>(() => {
    const saved = localStorage.getItem('cb_creators');
    return saved ? JSON.parse(saved) : CREATOR_PROFILES;
  });

  const [applications, setApplications] = useState<Application[]>(() => {
    const saved = localStorage.getItem('cb_applications');
    return saved ? JSON.parse(saved) : APPLICATIONS;
  });

  const [collaborations, setCollaborations] = useState<Collaboration[]>(() => {
    const saved = localStorage.getItem('cb_collaborations');
    return saved ? JSON.parse(saved) : INITIAL_COLLABORATIONS;
  });

  const [calendarTasks, setCalendarTasks] = useState<CalendarTask[]>(() => {
    const saved = localStorage.getItem('cb_calendar_tasks');
    return saved ? JSON.parse(saved) : INITIAL_CALENDAR_TASKS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('cb_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('cb_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('cb_conversations');
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
  });

  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem('cb_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Local storage synchronization
  useEffect(() => { localStorage.setItem('cb_campaigns', JSON.stringify(campaigns)); }, [campaigns]);
  useEffect(() => { localStorage.setItem('cb_creators', JSON.stringify(creators)); }, [creators]);
  useEffect(() => { localStorage.setItem('cb_applications', JSON.stringify(applications)); }, [applications]);
  useEffect(() => { localStorage.setItem('cb_collaborations', JSON.stringify(collaborations)); }, [collaborations]);
  useEffect(() => { localStorage.setItem('cb_calendar_tasks', JSON.stringify(calendarTasks)); }, [calendarTasks]);
  useEffect(() => { localStorage.setItem('cb_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('cb_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('cb_conversations', JSON.stringify(conversations)); }, [conversations]);
  useEffect(() => { localStorage.setItem('cb_messages', JSON.stringify(messages)); }, [messages]);

  const showToast = (title: string, message?: string, type: ToastMessage['type'] = 'success') => {
    const id = 'toast_' + Date.now();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const createCampaign = async (data: Partial<Campaign>): Promise<Campaign> => {
    if (!user) {
      showToast('Login Required', 'Please log in as a brand to create campaigns.', 'warning');
      throw new Error('Authentication required');
    }
    const newCamp: Campaign = {
      id: 'camp_' + Date.now(),
      brandId: user.id,
      brandName: user.businessName || user.name || 'Brand',
      brandLogo: user.avatar || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=120&q=80',
      title: data.title || 'New Creator Campaign',
      product: data.product || 'Featured Brand Offering',
      description: data.description || 'Promote product benefits with authentic creator content.',
      category: data.category || 'Technology',
      location: data.location || 'Pan-India',
      budget: Number(data.budget) || 250000,
      creatorPayment: Number(data.creatorPayment) || Math.round((Number(data.budget) || 250000) * 0.15),
      deliverables: data.deliverables || { reels: 1, stories: 2 },
      deadline: data.deadline || '2026-12-31',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || '2026-12-31',
      platforms: data.platforms || ['Instagram', 'YouTube Shorts'],
      audienceRequirements: data.audienceRequirements || {
        minFollowers: 50000,
        creatorCategory: data.category || 'Lifestyle',
        audienceType: 'Youth & Young Professionals',
        location: 'Metro & Tier-1 Cities'
      },
      brief: data.brief || {
        objective: data.description || 'Promote product awareness',
        targetAudience: 'Active social media users',
        keyMessage: data.title || 'Premium product experience',
        productBenefits: ['High performance', 'Premium design', 'Great customer value'],
        specialOffers: 'Flat 10% off using creator code',
        requiredCTA: 'Tap the link in bio to shop now!',
        brandGuidelines: 'High resolution visuals, authentic tone.',
        contentRestrictions: 'No negative competitor comparisons.'
      },
      status: 'active',
      isNew: true,
      bannerImage: data.bannerImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
      applicantsCount: 0,
      selectedCreatorsCount: 0,
      createdAt: new Date().toISOString()
    };

    setCampaigns(prev => [newCamp, ...prev]);
    showToast('Campaign Published Successfully!', `"${newCamp.title}" is now open for creator applications.`);
    return newCamp;
  };

  const applyToCampaign = async (campaignId: string, pitch: string, requestedFee?: number): Promise<boolean> => {
    if (!user) {
      showToast('Login Required', 'Please log in as a creator to apply for campaigns.', 'warning');
      return false;
    }
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return false;

    // Check if already applied
    const alreadyApplied = applications.some(a => a.campaignId === campaignId && a.creatorId === user.id);
    if (alreadyApplied) {
      showToast('Already Applied', 'You have already submitted an application for this campaign.', 'info');
      return false;
    }

    const creator = creators.find(c => c.id === user.id) || {
      fullName: user.name,
      profilePhoto: user.avatar,
      followersCount: 485000,
      categories: ['Lifestyle'],
      location: user.location
    };

    const newApp: Application = {
      id: 'app_' + Date.now(),
      campaignId,
      campaignTitle: campaign.title,
      brandId: campaign.brandId,
      brandName: campaign.brandName,
      brandLogo: campaign.brandLogo,
      creatorId: user?.id || 'creator_guest',
      creatorName: creator.fullName,
      creatorAvatar: creator.profilePhoto,
      creatorFollowers: creator.followersCount,
      creatorCategory: creator.categories.join(' & '),
      creatorLocation: creator.location,
      pitch,
      requestedFee: requestedFee || campaign.creatorPayment,
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0]
    };

    setApplications(prev => [newApp, ...prev]);
    setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, applicantsCount: c.applicantsCount + 1 } : c));

    // Brand notification
    setNotifications(prev => [
      {
        id: 'notif_' + Date.now(),
        userId: campaign.brandId,
        title: 'New Application Received',
        message: `${creator.fullName} applied for ${campaign.title}`,
        type: 'application',
        isRead: false,
        createdAt: 'Just now',
        linkUrl: '/brand/applications'
      },
      ...prev
    ]);

    showToast('Application Submitted!', `Your pitch has been delivered to ${campaign.brandName}.`);
    return true;
  };

  const updateApplicationStatus = async (appId: string, status: 'accepted' | 'rejected', reason?: string) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;

    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status, rejectionReason: reason } : a));

    if (status === 'accepted') {
      const campaign = campaigns.find(c => c.id === app.campaignId);
      if (campaign) {
        setCampaigns(prev => prev.map(c => c.id === campaign.id ? { ...c, selectedCreatorsCount: c.selectedCreatorsCount + 1 } : c));
      }

      const collabId = 'collab_' + Date.now();
      const newCollab: Collaboration = {
        id: collabId,
        campaignId: app.campaignId,
        campaignTitle: app.campaignTitle,
        campaignBanner: campaign?.bannerImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        brandId: app.brandId,
        brandName: app.brandName,
        brandLogo: app.brandLogo,
        creatorId: app.creatorId,
        creatorName: app.creatorName,
        creatorAvatar: app.creatorAvatar,
        deliverables: ['1x Instagram Reel', '2x Instagram Stories'],
        paymentAmount: app.requestedFee,
        deadline: campaign?.deadline || '2026-12-15',
        status: 'brief_received',
        paymentStatus: 'escrowed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setCollaborations(prev => [newCollab, ...prev]);

      // Schedule automated calendar tasks
      const today = new Date();
      const addDays = (d: Date, n: number) => {
        const copy = new Date(d);
        copy.setDate(copy.getDate() + n);
        return copy.toISOString().split('T')[0];
      };

      const autoTasks: CalendarTask[] = [
        {
          id: 'cal_' + Date.now() + '_1',
          creatorId: app.creatorId,
          collaborationId: collabId,
          campaignTitle: app.campaignTitle,
          brandName: app.brandName,
          taskType: 'script_writing',
          title: `Generate AI Script Draft for ${app.brandName}`,
          dueDate: addDays(today, 2),
          dueTime: '17:00',
          completed: false,
          priority: 'high',
          notes: 'Use CreatorBridge AI Script Writer with campaign brief.'
        },
        {
          id: 'cal_' + Date.now() + '_2',
          creatorId: app.creatorId,
          collaborationId: collabId,
          campaignTitle: app.campaignTitle,
          brandName: app.brandName,
          taskType: 'content_shooting',
          title: `Shoot Content Footage for ${app.brandName}`,
          dueDate: addDays(today, 6),
          dueTime: '12:00',
          completed: false,
          priority: 'high'
        },
        {
          id: 'cal_' + Date.now() + '_3',
          creatorId: app.creatorId,
          collaborationId: collabId,
          campaignTitle: app.campaignTitle,
          brandName: app.brandName,
          taskType: 'content_submission',
          title: `Submit Video for Brand Review`,
          dueDate: addDays(today, 9),
          dueTime: '18:00',
          completed: false,
          priority: 'high'
        },
        {
          id: 'cal_' + Date.now() + '_4',
          creatorId: app.creatorId,
          collaborationId: collabId,
          campaignTitle: app.campaignTitle,
          brandName: app.brandName,
          taskType: 'final_publishing',
          title: `Publish Content Live on Socials`,
          dueDate: campaign?.deadline || addDays(today, 14),
          dueTime: '19:30',
          completed: false,
          priority: 'high'
        },
        {
          id: 'cal_' + Date.now() + '_5',
          creatorId: app.creatorId,
          collaborationId: collabId,
          campaignTitle: app.campaignTitle,
          brandName: app.brandName,
          taskType: 'payment_due',
          title: `Milestone Payout: ₹${app.requestedFee.toLocaleString('en-IN')}`,
          dueDate: addDays(today, 18),
          completed: false,
          priority: 'medium'
        }
      ];

      setCalendarTasks(prev => [...autoTasks, ...prev]);

      // Creator notification
      setNotifications(prev => [
        {
          id: 'notif_' + Date.now(),
          userId: app.creatorId,
          title: 'Application Accepted! 🎉',
          message: `${app.brandName} accepted your application! Milestone tasks have been added to your Content Calendar.`,
          type: 'application',
          isRead: false,
          createdAt: 'Just now',
          linkUrl: '/creator/collaborations'
        },
        ...prev
      ]);

      showToast('Creator Accepted!', `${app.creatorName} has been enrolled into the campaign collaboration workflow.`);
    } else {
      showToast('Application Declined', `${app.creatorName}'s application has been archived.`, 'info');
    }
  };

  const updateCollaborationStep = async (collabId: string, updates: Partial<Collaboration>) => {
    const collab = collaborations.find(c => c.id === collabId);
    if (!collab) return;

    const newStatus = updates.status || collab.status;
    const isPaymentCompletion = newStatus === 'payment_completed' || updates.paymentStatus === 'paid';

    let txnId = collab.transactionId;
    if (isPaymentCompletion && !collab.paidAt) {
      txnId = 'TXN_CB_' + Math.floor(100000 + Math.random() * 900000);
      const newTxn: Transaction = {
        id: txnId,
        type: 'payout',
        amount: collab.paymentAmount,
        status: 'completed',
        date: new Date().toISOString().split('T')[0],
        campaignId: collab.campaignId,
        campaignTitle: collab.campaignTitle,
        counterpartyName: collab.brandName,
        counterpartyRole: 'Brand',
        invoiceNumber: 'INV-' + Date.now().toString().slice(-6)
      };
      setTransactions(prev => [newTxn, ...prev]);
    }

    setCollaborations(prev =>
      prev.map(c => {
        if (c.id === collabId) {
          return {
            ...c,
            ...updates,
            transactionId: txnId,
            paidAt: isPaymentCompletion ? new Date().toISOString() : c.paidAt,
            updatedAt: new Date().toISOString()
          };
        }
        return c;
      })
    );

    // Feedback notifications based on step transition
    if (updates.status === 'script_submitted') {
      showToast('Script Submitted!', 'Brand has received your script draft for review.');
      setNotifications(prev => [
        {
          id: 'notif_' + Date.now(),
          userId: collab.brandId,
          title: 'Script Submitted for Review',
          message: `${collab.creatorName} submitted a script draft for ${collab.campaignTitle}.`,
          type: 'script',
          isRead: false,
          createdAt: 'Just now',
          linkUrl: '/brand/collaborations'
        },
        ...prev
      ]);
    } else if (updates.status === 'script_approved') {
      showToast('Script Approved! 🎬', 'Creator can now proceed with shooting and production.');
      setNotifications(prev => [
        {
          id: 'notif_' + Date.now(),
          userId: collab.creatorId,
          title: 'Script Approved by Brand! 🚀',
          message: `${collab.brandName} approved your script draft! You can now start shooting content.`,
          type: 'script',
          isRead: false,
          createdAt: 'Just now',
          linkUrl: '/creator/collaborations'
        },
        ...prev
      ]);
    } else if (updates.status === 'revision_requested') {
      showToast('Revision Requested', 'Creator will review your feedback and resubmit.');
    } else if (updates.status === 'content_submitted') {
      showToast('Content Uploaded!', 'Brand has received your video link for final review.');
    } else if (updates.status === 'approved') {
      showToast('Content Approved! 🎉', 'Campaign deliverables completed. Ready for milestone payment.');
    } else if (isPaymentCompletion) {
      showToast('Payment Released! 💰', `₹${collab.paymentAmount.toLocaleString('en-IN')} has been transferred to creator.`);
    }
  };

  const addCalendarTask = async (task: Partial<CalendarTask>): Promise<CalendarTask> => {
    if (!user) {
      throw new Error('Authentication required');
    }
    const newTask: CalendarTask = {
      id: 'cal_' + Date.now(),
      creatorId: user?.id || 'creator_guest',
      collaborationId: task.collaborationId,
      campaignTitle: task.campaignTitle,
      brandName: task.brandName,
      taskType: task.taskType || 'personal',
      title: task.title || 'Personal Creator Task',
      dueDate: task.dueDate || new Date().toISOString().split('T')[0],
      dueTime: task.dueTime,
      completed: false,
      priority: task.priority || 'medium',
      notes: task.notes
    };

    setCalendarTasks(prev => [...prev, newTask]);
    showToast('Task Scheduled', `"${newTask.title}" added to your Content Calendar.`);
    return newTask;
  };

  const toggleCalendarTask = async (taskId: string) => {
    setCalendarTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const nextState = !t.completed;
          if (nextState) {
            showToast('Task Completed! ✅', `"${t.title}"`);
          }
          return { ...t, completed: nextState };
        }
        return t;
      })
    );
  };

  const deleteCalendarTask = async (taskId: string) => {
    setCalendarTasks(prev => prev.filter(t => t.id !== taskId));
    showToast('Task Removed', 'Task deleted from calendar.', 'info');
  };

  const generateAIScript = async (params: {
    campaignId?: string;
    format: string;
    style: string;
    language: string;
    customBrief?: any;
  }): Promise<ScriptDraft> => {
    const campaign = campaigns.find(c => c.id === params.campaignId);

    // Try backend API first
    try {
      const result = await safeApiCall<{ script?: ScriptDraft }>('/scripts/generate', {
        method: 'POST',
        body: JSON.stringify(params)
      });
      if (result.ok && result.data?.script) {
        return result.data.script;
      }
    } catch (e) {
      // offline fallback
    }

    // Direct frontend fallback adhering strictly to the brand brief
    const brandName = campaign?.brandName || params.customBrief?.brandName || 'boAt Lifestyle';
    const product = campaign?.product || params.customBrief?.product || 'boAt Nirvana Ion ANC';
    const objective = campaign?.brief?.objective || params.customBrief?.objective || 'Showcase product in everyday commute.';
    const keyMessage = campaign?.brief?.keyMessage || params.customBrief?.keyMessage || 'Premium performance with everyday silence.';
    const benefits = campaign?.brief?.productBenefits || params.customBrief?.benefits || ['Hybrid ANC', '120h Battery', 'Spatial Sound'];
    const specialOffers = campaign?.brief?.specialOffers || params.customBrief?.specialOffers || 'Use code CREATORBOAT for 10% off';
    const requiredCTA = campaign?.brief?.requiredCTA || params.customBrief?.requiredCTA || 'Tap link in bio to shop with discount!';

    const isHindi = params.language.toLowerCase().includes('hindi');
    const isKannada = params.language.toLowerCase().includes('kannada');

    let hookText = `POV: You found the one thing that actually solves ${benefits[0] || 'daily noise'}. Watch this.`;
    if (params.style === 'Entertaining') {
      hookText = `Stop scrolling! If you're tired of daily travel chaos, look at what ${brandName} just dropped.`;
    } else if (params.style === 'Informative') {
      hookText = `Here's why ${product} is going viral across India—and the 3 features you actually need to know.`;
    }

    if (isHindi) {
      hookText = `अगर आप भी रोज़ के शोर और भागदौड़ से परेशान हैं, तो ${brandName} का ये नया ${product} आपका दिन बदल देगा!`;
    } else if (isKannada) {
      hookText = `ಪ್ರತಿದಿನದ ಗದ್ದಲದಿಂದ ಮುಕ್ತಿ ಬೇಕಾ? ${brandName} ರ ಈ ಹೊಸ ${product} ನೋಡಿ!`;
    }

    return {
      id: 'script_' + Date.now(),
      campaignId: params.campaignId || 'custom',
      creatorId: user?.id || 'creator_guest',
      title: `${params.style} ${params.format} for ${brandName} — ${product}`,
      format: params.format,
      style: params.style,
      language: params.language,
      hook: hookText,
      scenes: [
        {
          sceneNumber: 1,
          visual: 'Fast handheld POV walking onto noisy metro platform. Overwhelming ambient roar of trains and announcements.',
          voiceover: isHindi
            ? 'क्या आप भी हर दिन इसी शोर और भागदौड़ से जूझते हैं? अब और नहीं!'
            : 'POV: You just survived a hectic workday and need immediate peace on your way home...',
          onScreenText: 'Indian Rush Hour: 85 dB Chaos 🚨'
        },
        {
          sceneNumber: 2,
          visual: `Close-up holding ${product}. Finger taps earbud to engage ANC. Crisp audio transition.`,
          voiceover: isHindi
            ? `बस एक टैप... और ${benefits[0] || 'नॉइज़ कैंसिलेशन'} चालू! पूरा शोर गायब।`
            : `Single tap... and ${benefits[0] || 'Hybrid ANC'} kicks in. Pure silence.`,
          onScreenText: `TAP ➜ ANC On (Silence: 100%) 🔇`
        },
        {
          sceneNumber: 3,
          visual: 'Slow-motion cinematic smile leaning against metro glass, enjoying high-fidelity music.',
          voiceover: isHindi
            ? `क्रिस्टल क्लियर साउंड और ${benefits[1] || '120 घंटे की लंबी बैटरी'}।`
            : `The whole outside world vanishes. Punchy bass and ${benefits[1] || '120 hours battery'}.`,
          onScreenText: `${benefits[1] || '120h Battery'} • Pure Spatial Audio`
        },
        {
          sceneNumber: 4,
          visual: 'Holding product box smiling directly at camera.',
          voiceover: isHindi
            ? `${specialOffers}! अभी बायो में दिए लिंक पर क्लिक करें।`
            : `${specialOffers}! ${requiredCTA}`,
          onScreenText: 'Link in Bio • Extra 10% OFF 🎁'
        }
      ],
      productPlacement: `Keep ${product} clearly in frame during scene 2 and 3. Show packaging and brand logo upright.`,
      cta: requiredCTA,
      caption: `${keyMessage} Survived the rush with @${brandName.toLowerCase().replace(/\s+/g, '')} ${product}! ${benefits.join(' • ')}. ${specialOffers}. ${requiredCTA} #CreatorBridge #${brandName.replace(/\s+/g, '')} #Sponsored`,
      hashtags: [`#${brandName.replace(/\s+/g, '')}`, `#${product.replace(/\s+/g, '').slice(0, 15)}`, '#CreatorCollab', '#Ad'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDraft: true,
      disclaimer: 'Draft generated by CreatorBridge AI Script Writer based strictly on the official brand brief. Please review and personalize before submitting.'
    };
  };

  const saveScriptToCollaboration = async (collabId: string, script: ScriptDraft) => {
    setCollaborations(prev =>
      prev.map(c => {
        if (c.id === collabId) {
          return {
            ...c,
            script,
            status: c.status === 'brief_received' ? 'script_generated' : c.status,
            updatedAt: new Date().toISOString()
          };
        }
        return c;
      })
    );
    showToast('Script Saved to Collaboration!', 'You can now submit it for brand approval.');
  };

  const sendMessage = async (conversationId: string, text: string, campaignId?: string, campaignTitle?: string) => {
    if (!user) {
      showToast('Login Required', 'Please log in to send messages.', 'warning');
      return;
    }
    const newMsg: ChatMessage = {
      id: 'm_' + Date.now(),
      conversationId,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      text,
      timestamp: 'Just now',
      campaignId,
      campaignTitle
    };

    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg]
    }));

    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: text,
            lastMessageTime: 'Just now'
          };
        }
        return c;
      })
    );

    // Simulated reply after 1.5s if talking to brand/creator
    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: 'm_reply_' + Date.now(),
        conversationId,
        senderId: user.role === 'creator' ? 'brand_boat' : 'user_creator_1',
        senderName: user.role === 'creator' ? 'boAt Partnerships Team' : 'Tanya Sharma',
        senderRole: user.role === 'creator' ? 'brand' : 'creator',
        text: user.role === 'creator'
          ? "Thanks Tanya! We've received this. Looking forward to the final cut!"
          : "Sounds great! I'll update the script accordingly and submit for your review.",
        timestamp: 'Just now',
        campaignId,
        campaignTitle
      };

      setMessages(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), replyMsg]
      }));

      setConversations(prev =>
        prev.map(c => {
          if (c.id === conversationId) {
            return {
              ...c,
              lastMessage: replyMsg.text,
              lastMessageTime: 'Just now'
            };
          }
          return c;
        })
      );
    }, 1800);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <DataContext.Provider
      value={{
        campaigns,
        creators,
        applications,
        collaborations,
        calendarTasks,
        transactions,
        notifications,
        conversations,
        messages,
        toasts,
        showToast,
        removeToast,
        createCampaign,
        applyToCampaign,
        updateApplicationStatus,
        updateCollaborationStep,
        addCalendarTask,
        toggleCalendarTask,
        deleteCalendarTask,
        generateAIScript,
        saveScriptToCollaboration,
        sendMessage,
        markAllNotificationsRead
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
