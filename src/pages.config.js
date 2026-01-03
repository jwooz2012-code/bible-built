import Calendar from './pages/Calendar';
import Stats from './pages/Stats';
import app from './pages/_app';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Calendar": Calendar,
    "Stats": Stats,
    "_app": app,
}

export const pagesConfig = {
    mainPage: "Stats",
    Pages: PAGES,
    Layout: __Layout,
};