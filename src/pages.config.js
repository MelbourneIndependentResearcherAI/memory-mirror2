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
import CaregiverPortal from './pages/CaregiverPortal';
import ChatMode from './pages/ChatMode';
import FAQ from './pages/FAQ';
import FamilyConnect from './pages/FamilyConnect';
import Feedback from './pages/Feedback';
import Home from './pages/Home';
import ImportArticle from './pages/ImportArticle';
import Landing from './pages/Landing';
import MemoryGames from './pages/MemoryGames';
import MusicTherapy from './pages/MusicTherapy';
import MyBank from './pages/MyBank';
import NewsArticle from './pages/NewsArticle';
import NightWatch from './pages/NightWatch';
import OfflineAudio from './pages/OfflineAudio';
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
import __Layout from './Layout.jsx';


export const PAGES = {
    "CaregiverPortal": CaregiverPortal,
    "ChatMode": ChatMode,
    "FAQ": FAQ,
    "FamilyConnect": FamilyConnect,
    "Feedback": Feedback,
    "Home": Home,
    "ImportArticle": ImportArticle,
    "Landing": Landing,
    "MemoryGames": MemoryGames,
    "MusicTherapy": MusicTherapy,
    "MyBank": MyBank,
    "NewsArticle": NewsArticle,
    "NightWatch": NightWatch,
    "OfflineAudio": OfflineAudio,
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
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};