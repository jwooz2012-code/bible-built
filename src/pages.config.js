import Calendar from './pages/Calendar';
import CustomPlanBuilder from './pages/CustomPlanBuilder';
import Home from './pages/Home';
import Index from './pages/Index';
import PlanDetail from './pages/PlanDetail';
import Settings from './pages/Settings';
import Stats from './pages/Stats';
import app from './pages/_app';
import Plans from './pages/Plans';
import ThemesLibrary from './pages/ThemesLibrary';
import PeopleLibrary from './pages/PeopleLibrary';
import ThemeDetail from './pages/ThemeDetail';
import PersonDetail from './pages/PersonDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Calendar": Calendar,
    "CustomPlanBuilder": CustomPlanBuilder,
    "Home": Home,
    "Index": Index,
    "PlanDetail": PlanDetail,
    "Settings": Settings,
    "Stats": Stats,
    "_app": app,
    "Plans": Plans,
    "ThemesLibrary": ThemesLibrary,
    "PeopleLibrary": PeopleLibrary,
    "ThemeDetail": ThemeDetail,
    "PersonDetail": PersonDetail,
}

export const pagesConfig = {
    mainPage: "Stats",
    Pages: PAGES,
    Layout: __Layout,
};