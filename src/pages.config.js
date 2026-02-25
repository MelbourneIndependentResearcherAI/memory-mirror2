/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import { lazy } from 'react';
import __Layout from './Layout.jsx';

const AIAgentTeam = lazy(() => import('./pages/AIAgentTeam'));
const AICareInsights = lazy(() => import('./pages/AICareInsights'));
const AccessibilityStatement = lazy(() => import('./pages/AccessibilityStatement'));
const ActivityReminders = lazy(() => import('./pages/ActivityReminders'));
const ActivityReports = lazy(() => import('./pages/ActivityReports'));
const AdminUserTracking = lazy(() => import('./pages/AdminUserTracking'));
const AuditTrail = lazy(() => import('./pages/AuditTrail'));
const CareJournalPage = lazy(() => import('./pages/CareJournalPage'));
const CarePlans = lazy(() => import('./pages/CarePlans'));
const CareTeam = lazy(() => import('./pages/CareTeam'));
const CaregiverDashboard = lazy(() => import('./pages/CaregiverDashboard'));
const CaregiverPortal = lazy(() => import('./pages/CaregiverPortal'));
const CaregiverPortalRouter = lazy(() => import('./pages/CaregiverPortalRouter'));
const ChatCompanionDashboard = lazy(() => import('./pages/ChatCompanionDashboard'));
const ChatHistory = lazy(() => import('./pages/ChatHistory'));
const ChatMode = lazy(() => import('./pages/ChatMode'));
const ContentLibrary = lazy(() => import('./pages/ContentLibrary'));
const ConversationAnalytics = lazy(() => import('./pages/ConversationAnalytics'));
const EmergencyAlerts = lazy(() => import('./pages/EmergencyAlerts'));
const FAQ = lazy(() => import('./pages/FAQ'));
const FamilyAIInsights = lazy(() => import('./pages/FamilyAIInsights'));
const FamilyCalendar = lazy(() => import('./pages/FamilyCalendar'));
const FamilyChatRoom = lazy(() => import('./pages/FamilyChatRoom'));
const FamilyConnect = lazy(() => import('./pages/FamilyConnect'));
const FamilyContacts = lazy(() => import('./pages/FamilyContacts'));
const FamilyMediaAlbum = lazy(() => import('./pages/FamilyMediaAlbum'));
const FamilyMessages = lazy(() => import('./pages/FamilyMessages'));
const FamilyMusic = lazy(() => import('./pages/FamilyMusic'));
const FamilyNotifications = lazy(() => import('./pages/FamilyNotifications'));
const FamilyOverview = lazy(() => import('./pages/FamilyOverview'));
const FamilyPhotoAlbum = lazy(() => import('./pages/FamilyPhotoAlbum'));
const FamilyPlaylists = lazy(() => import('./pages/FamilyPlaylists'));
const FamilyRemoteTrigger = lazy(() => import('./pages/FamilyRemoteTrigger'));
const FamilyStories = lazy(() => import('./pages/FamilyStories'));
const FamilyTimeline = lazy(() => import('./pages/FamilyTimeline'));
const FamilyTree = lazy(() => import('./pages/FamilyTree'));
const FamilyTreePage = lazy(() => import('./pages/FamilyTreePage'));
const FamilyVideoCall = lazy(() => import('./pages/FamilyVideoCall'));
const Feedback = lazy(() => import('./pages/Feedback'));
const HealthMonitor = lazy(() => import('./pages/HealthMonitor'));
const Home = lazy(() => import('./pages/Home'));
const ImportArticle = lazy(() => import('./pages/ImportArticle'));
const InsightsAnalytics = lazy(() => import('./pages/InsightsAnalytics'));
const Landing = lazy(() => import('./pages/Landing'));
const MemoryGames = lazy(() => import('./pages/MemoryGames'));
const MemorySessions = lazy(() => import('./pages/MemorySessions'));
const MoodAutomations = lazy(() => import('./pages/MoodAutomations'));
const MusicPlayer = lazy(() => import('./pages/MusicPlayer'));
const MusicTherapy = lazy(() => import('./pages/MusicTherapy'));
const MyBank = lazy(() => import('./pages/MyBank'));
const NewsArticle = lazy(() => import('./pages/NewsArticle'));
const NightWatch = lazy(() => import('./pages/NightWatch'));
const NightWatchDashboard = lazy(() => import('./pages/NightWatchDashboard'));
const NightWatchIncidents = lazy(() => import('./pages/NightWatchIncidents'));
const NightWatchPage = lazy(() => import('./pages/NightWatchPage'));
const OfflineAudio = lazy(() => import('./pages/OfflineAudio'));
const OfflineCapabilities = lazy(() => import('./pages/OfflineCapabilities'));
const OfflineContent = lazy(() => import('./pages/OfflineContent'));
const OfflineModeDashboard = lazy(() => import('./pages/OfflineModeDashboard'));
const OfflineTest = lazy(() => import('./pages/OfflineTest'));
const PatientAccess = lazy(() => import('./pages/PatientAccess'));
const PatientRegistration = lazy(() => import('./pages/PatientRegistration'));
const PhoneMode = lazy(() => import('./pages/PhoneMode'));
const PhotoLibrary = lazy(() => import('./pages/PhotoLibrary'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Security = lazy(() => import('./pages/Security'));
const SecurityMode = lazy(() => import('./pages/SecurityMode'));
const SharedJournal = lazy(() => import('./pages/SharedJournal'));
const SmartHome = lazy(() => import('./pages/SmartHome'));
const SyncBackup = lazy(() => import('./pages/SyncBackup'));
const TVDashboard = lazy(() => import('./pages/TVDashboard'));
const TVMode = lazy(() => import('./pages/TVMode'));
const TVMusicTherapy = lazy(() => import('./pages/TVMusicTherapy'));
const TVPairing = lazy(() => import('./pages/TVPairing'));
const TVPhotoGallery = lazy(() => import('./pages/TVPhotoGallery'));
const TeamNotifications = lazy(() => import('./pages/TeamNotifications'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const VoiceAlwaysOnDashboard = lazy(() => import('./pages/VoiceAlwaysOnDashboard'));
const VoiceCloning = lazy(() => import('./pages/VoiceCloning'));
const VoiceCommands = lazy(() => import('./pages/VoiceCommands'));
const VoiceSetup = lazy(() => import('./pages/VoiceSetup'));
const VoiceUsageAnalytics = lazy(() => import('./pages/VoiceUsageAnalytics'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const YouthMirror = lazy(() => import('./pages/YouthMirror'));
const chat = lazy(() => import('./pages/chat'));
const phone = lazy(() => import('./pages/phone'));
const security = lazy(() => import('./pages/security'));


export const PAGES = {
    "AIAgentTeam": AIAgentTeam,
    "AICareInsights": AICareInsights,
    "AccessibilityStatement": AccessibilityStatement,
    "ActivityReminders": ActivityReminders,
    "ActivityReports": ActivityReports,
    "AdminUserTracking": AdminUserTracking,
    "AuditTrail": AuditTrail,
    "CareJournalPage": CareJournalPage,
    "CarePlans": CarePlans,
    "CareTeam": CareTeam,
    "CaregiverDashboard": CaregiverDashboard,
    "CaregiverPortal": CaregiverPortal,
    "CaregiverPortalRouter": CaregiverPortalRouter,
    "ChatCompanionDashboard": ChatCompanionDashboard,
    "ChatHistory": ChatHistory,
    "ChatMode": ChatMode,
    "ContentLibrary": ContentLibrary,
    "ConversationAnalytics": ConversationAnalytics,
    "EmergencyAlerts": EmergencyAlerts,
    "FAQ": FAQ,
    "FamilyAIInsights": FamilyAIInsights,
    "FamilyCalendar": FamilyCalendar,
    "FamilyChatRoom": FamilyChatRoom,
    "FamilyConnect": FamilyConnect,
    "FamilyContacts": FamilyContacts,
    "FamilyMediaAlbum": FamilyMediaAlbum,
    "FamilyMessages": FamilyMessages,
    "FamilyMusic": FamilyMusic,
    "FamilyNotifications": FamilyNotifications,
    "FamilyOverview": FamilyOverview,
    "FamilyPhotoAlbum": FamilyPhotoAlbum,
    "FamilyPlaylists": FamilyPlaylists,
    "FamilyRemoteTrigger": FamilyRemoteTrigger,
    "FamilyStories": FamilyStories,
    "FamilyTimeline": FamilyTimeline,
    "FamilyTree": FamilyTree,
    "FamilyTreePage": FamilyTreePage,
    "FamilyVideoCall": FamilyVideoCall,
    "Feedback": Feedback,
    "HealthMonitor": HealthMonitor,
    "Home": Home,
    "ImportArticle": ImportArticle,
    "InsightsAnalytics": InsightsAnalytics,
    "Landing": Landing,
    "MemoryGames": MemoryGames,
    "MemorySessions": MemorySessions,
    "MoodAutomations": MoodAutomations,
    "MusicPlayer": MusicPlayer,
    "MusicTherapy": MusicTherapy,
    "MyBank": MyBank,
    "NewsArticle": NewsArticle,
    "NightWatch": NightWatch,
    "NightWatchDashboard": NightWatchDashboard,
    "NightWatchIncidents": NightWatchIncidents,
    "NightWatchPage": NightWatchPage,
    "OfflineAudio": OfflineAudio,
    "OfflineCapabilities": OfflineCapabilities,
    "OfflineContent": OfflineContent,
    "OfflineModeDashboard": OfflineModeDashboard,
    "OfflineTest": OfflineTest,
    "PatientAccess": PatientAccess,
    "PatientRegistration": PatientRegistration,
    "PhoneMode": PhoneMode,
    "PhotoLibrary": PhotoLibrary,
    "PrivacyPolicy": PrivacyPolicy,
    "Security": Security,
    "SecurityMode": SecurityMode,
    "SharedJournal": SharedJournal,
    "SmartHome": SmartHome,
    "SyncBackup": SyncBackup,
    "TVDashboard": TVDashboard,
    "TVMode": TVMode,
    "TVMusicTherapy": TVMusicTherapy,
    "TVPairing": TVPairing,
    "TVPhotoGallery": TVPhotoGallery,
    "TeamNotifications": TeamNotifications,
    "TermsOfService": TermsOfService,
    "VoiceAlwaysOnDashboard": VoiceAlwaysOnDashboard,
    "VoiceCloning": VoiceCloning,
    "VoiceCommands": VoiceCommands,
    "VoiceSetup": VoiceSetup,
    "VoiceUsageAnalytics": VoiceUsageAnalytics,
    "UserProfile": UserProfile,
    "YouthMirror": YouthMirror,
    "chat": chat,
    "phone": phone,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};