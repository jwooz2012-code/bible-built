import Home from './pages/Home';
import BookDetail from './pages/BookDetail';
import Achievements from './pages/Achievements';
import Stats from './pages/Stats';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "BookDetail": BookDetail,
    "Achievements": Achievements,
    "Stats": Stats,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};