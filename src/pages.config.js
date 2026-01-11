import Calendar from './pages/Calendar';
import Home from './pages/Home';
import Index from './pages/Index';
import PeopleLibrary from './pages/PeopleLibrary';
import PersonDetail from './pages/PersonDetail';
import PlanDetail from './pages/PlanDetail';
import Plans from './pages/Plans';
import Settings from './pages/Settings';
import Stats from './pages/Stats';
import ThemeDetail from './pages/ThemeDetail';
import ThemesLibrary from './pages/ThemesLibrary';
import app from './pages/_app';
import CustomPlanBuilder from './pages/CustomPlanBuilder';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Calendar": Calendar,
    "Home": Home,
    "Index": Index,
    "PeopleLibrary": PeopleLibrary,
    "PersonDetail": PersonDetail,
    "PlanDetail": PlanDetail,
    "Plans": Plans,
    "Settings": Settings,
    "Stats": Stats,
    "ThemeDetail": ThemeDetail,
    "ThemesLibrary": ThemesLibrary,
    "_app": app,
    "CustomPlanBuilder": CustomPlanBuilder,
}

export const pagesConfig = {
    mainPage: "Stats",
    Pages: PAGES,
    Layout: __Layout,
};