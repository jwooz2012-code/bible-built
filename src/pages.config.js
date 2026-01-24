import Calendar from './pages/Calendar';
import CustomPlanBuilder from './pages/CustomPlanBuilder';
import Home from './pages/Home';
import Index from './pages/Index';
import PeopleLibrary from './pages/PeopleLibrary';
import PersonDetail from './pages/PersonDetail';
import PlanDetail from './pages/PlanDetail';
import Settings from './pages/Settings';
import Stats from './pages/Stats';
import app from './pages/_app';
import Plans from './pages/Plans';
import ThemeDetail from './pages/ThemeDetail';
import ThemesLibrary from './pages/ThemesLibrary';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Calendar": Calendar,
    "CustomPlanBuilder": CustomPlanBuilder,
    "Home": Home,
    "Index": Index,
    "PeopleLibrary": PeopleLibrary,
    "PersonDetail": PersonDetail,
    "PlanDetail": PlanDetail,
    "Settings": Settings,
    "Stats": Stats,
    "_app": app,
    "Plans": Plans,
    "ThemeDetail": ThemeDetail,
    "ThemesLibrary": ThemesLibrary,
}

export const pagesConfig = {
    mainPage: "Stats",
    Pages: PAGES,
    Layout: __Layout,
};