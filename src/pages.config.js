import Home from './pages/Home';
import ReadingCalendar from './pages/ReadingCalendar';
import Stats from './pages/Stats';
import app from './pages/_app';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "ReadingCalendar": ReadingCalendar,
    "Stats": Stats,
    "_app": app,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};