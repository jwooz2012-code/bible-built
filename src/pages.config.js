import Auth from './pages/Auth';
import Calendar from './pages/Calendar';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Stats from './pages/Stats';
import app from './pages/_app';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Auth": Auth,
    "Calendar": Calendar,
    "Home": Home,
    "Settings": Settings,
    "Stats": Stats,
    "_app": app,
}

export const pagesConfig = {
    mainPage: "Stats",
    Pages: PAGES,
    Layout: __Layout,
};