import BookDetail from './pages/BookDetail';
import BooksCompleted from './pages/BooksCompleted';
import Home from './pages/Home';
import ReadingCalendar from './pages/ReadingCalendar';
import Stats from './pages/Stats';
import app from './pages/_app';
import Achievements from './pages/Achievements';
import __Layout from './Layout.jsx';


export const PAGES = {
    "BookDetail": BookDetail,
    "BooksCompleted": BooksCompleted,
    "Home": Home,
    "ReadingCalendar": ReadingCalendar,
    "Stats": Stats,
    "_app": app,
    "Achievements": Achievements,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};