import Stats from './pages/Stats';
import app from './pages/_app';
import Calendar from './pages/Calendar';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Stats": Stats,
    "_app": app,
    "Calendar": Calendar,
}

export const pagesConfig = {
    mainPage: "Stats",
    Pages: PAGES,
    Layout: __Layout,
};