import Calendar from './pages/Calendar';
import Index from './pages/Index';
import Stats from './pages/Stats';
import app from './pages/_app';
import Settings from './pages/Settings';
import Home from './pages/Home';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Calendar": Calendar,
    "Index": Index,
    "Stats": Stats,
    "_app": app,
    "Settings": Settings,
    "Home": Home,
}

export const pagesConfig = {
    mainPage: "Stats",
    Pages: PAGES,
    Layout: __Layout,
};