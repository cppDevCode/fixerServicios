import { Outlet } from 'react-router-dom';
import { Header } from '../header/Header';
import { Footer } from '../footer/Footer';
import './Layout.css';

export const Layout = () => {
  return (
    <div className="layout-container">
      <Header />

      <main className="content-area">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};
