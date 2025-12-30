import Achievements from './pages/Achievements';
import BookDetail from './pages/BookDetail';
import Home from './pages/Home';
import Stats from './pages/Stats';
import BooksCompleted from './pages/BooksCompleted';
import app from './pages/_app';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Achievements": Achievements,
    "BookDetail": BookDetail,
    "Home": Home,
    "Stats": Stats,
    "BooksCompleted": BooksCompleted,
    "_app": app,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};