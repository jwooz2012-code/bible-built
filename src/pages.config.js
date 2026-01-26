import Accountability from './pages/Accountability';
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
import ThemeDetail from './pages/ThemeDetail';
import ThemesLibrary from './pages/ThemesLibrary';
import app from './pages/_app';
import Stats from './pages/Stats';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Accountability": Accountability,
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
    "ThemeDetail": ThemeDetail,
    "ThemesLibrary": ThemesLibrary,
    "_app": app,
    "Stats": Stats,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};