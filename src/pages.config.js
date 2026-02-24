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
import AccessibilityStatement from './pages/AccessibilityStatement';
import AdminUserTracking from './pages/AdminUserTracking';
import CarePlans from './pages/CarePlans';
import CaregiverPortal from './pages/CaregiverPortal';
import CaregiverPortalRouter from './pages/CaregiverPortalRouter';
import ChatMode from './pages/ChatMode';
import FAQ from './pages/FAQ';
import FamilyConnect from './pages/FamilyConnect';
import Feedback from './pages/Feedback';
import HealthMonitor from './pages/HealthMonitor';
import Home from './pages/Home';
import ImportArticle from './pages/ImportArticle';
import Landing from './pages/Landing';
import MemoryGames from './pages/MemoryGames';
import MemorySessions from './pages/MemorySessions';
import MusicTherapy from './pages/MusicTherapy';
import MyBank from './pages/MyBank';
import NewsArticle from './pages/NewsArticle';
import NightWatch from './pages/NightWatch';
import OfflineAudio from './pages/OfflineAudio';
import PatientAccess from './pages/PatientAccess';
import PhoneMode from './pages/PhoneMode';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Security from './pages/Security';
import SecurityMode from './pages/SecurityMode';
import SyncBackup from './pages/SyncBackup';
import TVMode from './pages/TVMode';
import TVPairing from './pages/TVPairing';
import TermsOfService from './pages/TermsOfService';
import VoiceSetup from './pages/VoiceSetup';
import YouthMirror from './pages/YouthMirror';
import chat from './pages/chat';
import phone from './pages/phone';
import security from './pages/security';
import InsightsAnalytics from './pages/InsightsAnalytics';
import PhotoLibrary from './pages/PhotoLibrary';
import MusicPlayer from './pages/MusicPlayer';
import CareJournalPage from './pages/CareJournalPage';
import NightWatchPage from './pages/NightWatchPage';
import SmartHome from './pages/SmartHome';
import MoodAutomations from './pages/MoodAutomations';
import ActivityReminders from './pages/ActivityReminders';
import VoiceCloning from './pages/VoiceCloning';
import AICareInsights from './pages/AICareInsights';
import FamilyTree from './pages/FamilyTree';
import ContentLibrary from './pages/ContentLibrary';
import AuditTrail from './pages/AuditTrail';
import FakeBankSettings from './pages/FakeBankSettings';
import EmergencyAlerts from './pages/EmergencyAlerts';
import PatientRegistration from './pages/PatientRegistration';
import ActivityReports from './pages/ActivityReports';
import OfflineContent from './pages/OfflineContent';
import OfflineTest from './pages/OfflineTest';
import CareTeam from './pages/CareTeam';
import SharedJournal from './pages/SharedJournal';
import TeamNotifications from './pages/TeamNotifications';
import AIAgentTeam from './pages/AIAgentTeam';
import FamilyVideoCall from './pages/FamilyVideoCall';
import FamilyChatRoom from './pages/FamilyChatRoom';
import FamilyOverview from './pages/FamilyOverview';
import FamilyNotifications from './pages/FamilyNotifications';
import FamilyAIInsights from './pages/FamilyAIInsights';
import FamilyPhotoAlbum from './pages/FamilyPhotoAlbum';
import FamilyTimeline from './pages/FamilyTimeline';
import FamilyRemoteTrigger from './pages/FamilyRemoteTrigger';
import FamilyCalendar from './pages/FamilyCalendar';
import FamilyMediaAlbum from './pages/FamilyMediaAlbum';
import FamilyMessages from './pages/FamilyMessages';
import FamilyMusic from './pages/FamilyMusic';
import FamilyStories from './pages/FamilyStories';
import FamilyContacts from './pages/FamilyContacts';
import FamilyTreePage from './pages/FamilyTreePage';
import FamilyPlaylists from './pages/FamilyPlaylists';
import CaregiverDashboard from './pages/CaregiverDashboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AccessibilityStatement": AccessibilityStatement,
    "AdminUserTracking": AdminUserTracking,
    "CarePlans": CarePlans,
    "CaregiverPortal": CaregiverPortal,
    "CaregiverPortalRouter": CaregiverPortalRouter,
    "ChatMode": ChatMode,
    "FAQ": FAQ,
    "FamilyConnect": FamilyConnect,
    "Feedback": Feedback,
    "HealthMonitor": HealthMonitor,
    "Home": Home,
    "ImportArticle": ImportArticle,
    "Landing": Landing,
    "MemoryGames": MemoryGames,
    "MemorySessions": MemorySessions,
    "MusicTherapy": MusicTherapy,
    "MyBank": MyBank,
    "NewsArticle": NewsArticle,
    "NightWatch": NightWatch,
    "OfflineAudio": OfflineAudio,
    "PatientAccess": PatientAccess,
    "PhoneMode": PhoneMode,
    "PrivacyPolicy": PrivacyPolicy,
    "Security": Security,
    "SecurityMode": SecurityMode,
    "SyncBackup": SyncBackup,
    "TVMode": TVMode,
    "TVPairing": TVPairing,
    "TermsOfService": TermsOfService,
    "VoiceSetup": VoiceSetup,
    "YouthMirror": YouthMirror,
    "chat": chat,
    "phone": phone,
    "security": security,
    "InsightsAnalytics": InsightsAnalytics,
    "PhotoLibrary": PhotoLibrary,
    "MusicPlayer": MusicPlayer,
    "CareJournalPage": CareJournalPage,
    "NightWatchPage": NightWatchPage,
    "SmartHome": SmartHome,
    "MoodAutomations": MoodAutomations,
    "ActivityReminders": ActivityReminders,
    "VoiceCloning": VoiceCloning,
    "AICareInsights": AICareInsights,
    "FamilyTree": FamilyTree,
    "ContentLibrary": ContentLibrary,
    "AuditTrail": AuditTrail,
    "FakeBankSettings": FakeBankSettings,
    "EmergencyAlerts": EmergencyAlerts,
    "PatientRegistration": PatientRegistration,
    "ActivityReports": ActivityReports,
    "OfflineContent": OfflineContent,
    "OfflineTest": OfflineTest,
    "CareTeam": CareTeam,
    "SharedJournal": SharedJournal,
    "TeamNotifications": TeamNotifications,
    "AIAgentTeam": AIAgentTeam,
    "FamilyVideoCall": FamilyVideoCall,
    "FamilyChatRoom": FamilyChatRoom,
    "FamilyOverview": FamilyOverview,
    "FamilyNotifications": FamilyNotifications,
    "FamilyAIInsights": FamilyAIInsights,
    "FamilyPhotoAlbum": FamilyPhotoAlbum,
    "FamilyTimeline": FamilyTimeline,
    "FamilyRemoteTrigger": FamilyRemoteTrigger,
    "FamilyCalendar": FamilyCalendar,
    "FamilyMediaAlbum": FamilyMediaAlbum,
    "FamilyMessages": FamilyMessages,
    "FamilyMusic": FamilyMusic,
    "FamilyStories": FamilyStories,
    "FamilyContacts": FamilyContacts,
    "FamilyTreePage": FamilyTreePage,
    "FamilyPlaylists": FamilyPlaylists,
    "CaregiverDashboard": CaregiverDashboard,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};