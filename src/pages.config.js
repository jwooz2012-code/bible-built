import Calendar from './pages/Calendar';
import Stats from './pages/Stats';
import app from './pages/_app';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Calendar": Calendar,
    "Stats": Stats,
    "_app": app,
    "Auth": Auth,
    "Home": Home,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Stats",
    Pages: PAGES,
    Layout: __Layout,
};