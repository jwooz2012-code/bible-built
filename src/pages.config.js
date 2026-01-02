import Achievements from './pages/Achievements';
import BookDetail from './pages/BookDetail';
import BooksCompleted from './pages/BooksCompleted';
import Home from './pages/Home';
import ReadingCalendar from './pages/ReadingCalendar';
import Stats from './pages/Stats';
import app from './pages/_app';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Achievements": Achievements,
    "BookDetail": BookDetail,
    "BooksCompleted": BooksCompleted,
    "Home": Home,
    "ReadingCalendar": ReadingCalendar,
    "Stats": Stats,
    "_app": app,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};