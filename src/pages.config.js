import Calendar from './pages/Calendar';
import Index from './pages/Index';
import Settings from './pages/Settings';
import Stats from './pages/Stats';
import app from './pages/_app';
import Home from './pages/Home';
import PlanDetail from './pages/PlanDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Calendar": Calendar,
    "Index": Index,
    "Settings": Settings,
    "Stats": Stats,
    "_app": app,
    "Home": Home,
    "PlanDetail": PlanDetail,
}

export const pagesConfig = {
    mainPage: "Stats",
    Pages: PAGES,
    Layout: __Layout,
};