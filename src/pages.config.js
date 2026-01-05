import Calendar from './pages/Calendar';
import Home from './pages/Home';
import Index from './pages/Index';
import Stats from './pages/Stats';
import app from './pages/_app';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Calendar": Calendar,
    "Home": Home,
    "Index": Index,
    "Stats": Stats,
    "_app": app,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Stats",
    Pages: PAGES,
    Layout: __Layout,
};