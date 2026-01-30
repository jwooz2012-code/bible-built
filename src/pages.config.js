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
import Accountability from './pages/Accountability';
import CustomPlanBuilder from './pages/CustomPlanBuilder';
import Index from './pages/Index';
import PeopleLibrary from './pages/PeopleLibrary';
import PersonDetail from './pages/PersonDetail';
import PlanDetail from './pages/PlanDetail';
import ThemeDetail from './pages/ThemeDetail';
import ThemesLibrary from './pages/ThemesLibrary';
import app from './pages/_app';
import ShareSummary from './pages/ShareSummary';
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import Plans from './pages/Plans';
import Settings from './pages/Settings';
import Stats from './pages/Stats';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Accountability": Accountability,
    "CustomPlanBuilder": CustomPlanBuilder,
    "Index": Index,
    "PeopleLibrary": PeopleLibrary,
    "PersonDetail": PersonDetail,
    "PlanDetail": PlanDetail,
    "ThemeDetail": ThemeDetail,
    "ThemesLibrary": ThemesLibrary,
    "_app": app,
    "ShareSummary": ShareSummary,
    "Home": Home,
    "Calendar": Calendar,
    "Plans": Plans,
    "Settings": Settings,
    "Stats": Stats,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};