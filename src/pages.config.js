import Calendar from './pages/Calendar';
import Home from './pages/Home';
import Index from './pages/Index';
import Settings from './pages/Settings';
import Stats from './pages/Stats';
import app from './pages/_app';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Calendar": Calendar,
    "Home": Home,
    "Index": Index,
    "Settings": Settings,
    "Stats": Stats,
    "_app": app,
}

export const pagesConfig = {
    mainPage: "Stats",
    Pages: PAGES,
    Layout: __Layout,
};