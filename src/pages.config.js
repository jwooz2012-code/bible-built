import Achievements from './pages/Achievements';
import BookDetail from './pages/BookDetail';
import BooksCompleted from './pages/BooksCompleted';
import app from './pages/_app';
import ReadingCalendar from './pages/ReadingCalendar';
import Stats from './pages/Stats';
import Home from './pages/Home';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Achievements": Achievements,
    "BookDetail": BookDetail,
    "BooksCompleted": BooksCompleted,
    "_app": app,
    "ReadingCalendar": ReadingCalendar,
    "Stats": Stats,
    "Home": Home,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};