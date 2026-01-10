import Calendar from './pages/Calendar';
import Home from './pages/Home';
import Index from './pages/Index';
import PlanDetail from './pages/PlanDetail';
import Settings from './pages/Settings';
import Stats from './pages/Stats';
import app from './pages/_app';
import CustomPlanBuilder from './pages/CustomPlanBuilder';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Calendar": Calendar,
    "Home": Home,
    "Index": Index,
    "PlanDetail": PlanDetail,
    "Settings": Settings,
    "Stats": Stats,
    "_app": app,
    "CustomPlanBuilder": CustomPlanBuilder,
}

export const pagesConfig = {
    mainPage: "Stats",
    Pages: PAGES,
    Layout: __Layout,
};