import Calendar from './pages/Calendar';
import CustomPlanBuilder from './pages/CustomPlanBuilder';
import Home from './pages/Home';
import Index from './pages/Index';
import PeopleLibrary from './pages/PeopleLibrary';
import PersonDetail from './pages/PersonDetail';
import PlanDetail from './pages/PlanDetail';
import Plans from './pages/Plans';
import Settings from './pages/Settings';
import ShareSummary from './pages/ShareSummary';
import Stats from './pages/Stats';
import ThemeDetail from './pages/ThemeDetail';
import ThemesLibrary from './pages/ThemesLibrary';
import app from './pages/_app';
import Accountability from './pages/Accountability';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Calendar": Calendar,
    "CustomPlanBuilder": CustomPlanBuilder,
    "Home": Home,
    "Index": Index,
    "PeopleLibrary": PeopleLibrary,
    "PersonDetail": PersonDetail,
    "PlanDetail": PlanDetail,
    "Plans": Plans,
    "Settings": Settings,
    "ShareSummary": ShareSummary,
    "Stats": Stats,
    "ThemeDetail": ThemeDetail,
    "ThemesLibrary": ThemesLibrary,
    "_app": app,
    "Accountability": Accountability,
}

export const pagesConfig = {
    mainPage: "Stats",
    Pages: PAGES,
    Layout: __Layout,
};