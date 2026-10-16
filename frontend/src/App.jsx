import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout.jsx';
import { SettingsProvider } from './lib/settings.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Pillar from './pages/Pillar.jsx';
import ServicePage from './pages/ServicePage.jsx';
import Academy from './pages/Academy.jsx';
import Courses from './pages/Courses.jsx';
import CoursePage from './pages/CoursePage.jsx';
import CorporateTraining from './pages/CorporateTraining.jsx';
import Research from './pages/Research.jsx';
import ResearchRequest from './pages/ResearchRequest.jsx';
import Insights from './pages/Insights.jsx';
import Article from './pages/Article.jsx';
import Work from './pages/Work.jsx';
import CaseStudyPage from './pages/CaseStudyPage.jsx';
import Contact from './pages/Contact.jsx';
import Book from './pages/Book.jsx';
import Start from './pages/Start.jsx';
import Enroll from './pages/Enroll.jsx';
import ThankYou from './pages/ThankYou.jsx';
import PaymentCallback from './pages/PaymentCallback.jsx';
import Faq from './pages/Faq.jsx';
import Legal from './pages/Legal.jsx';
import Resources from './pages/Resources.jsx';
import NewsletterConfirm from './pages/NewsletterConfirm.jsx';
import NotFound from './pages/NotFound.jsx';

// Admin is code-split so public visitors never download it.
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));

export default function App() {
  return (
    <SettingsProvider>
      <Routes>
        <Route path="/admin/*" element={<Suspense fallback={<p style={{ padding: '2rem' }}>Loading admin</p>}><AdminApp /></Suspense>} />
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="solutions" element={<Pillar pillarKey="solutions" />} />
          <Route path="solutions/:slug" element={<ServicePage pillarKey="solutions" />} />
          <Route path="consulting" element={<Pillar pillarKey="consulting" />} />
          <Route path="consulting/:slug" element={<ServicePage pillarKey="consulting" />} />
          <Route path="academy" element={<Academy />} />
          <Route path="academy/courses" element={<Courses />} />
          <Route path="academy/courses/:slug" element={<CoursePage />} />
          <Route path="academy/corporate-training" element={<CorporateTraining />} />
          <Route path="academy/research" element={<Research />} />
          <Route path="academy/research/request" element={<ResearchRequest />} />
          <Route path="academy/research/:slug" element={<ServicePage pillarKey="academy" track="research" />} />
          <Route path="insights" element={<Insights />} />
          <Route path="insights/:slug" element={<Article />} />
          <Route path="work" element={<Work />} />
          <Route path="work/:slug" element={<CaseStudyPage />} />
          <Route path="contact" element={<Contact />} />
          <Route path="book" element={<Book />} />
          <Route path="start" element={<Start />} />
          <Route path="enroll" element={<Enroll />} />
          <Route path="enroll/:slug" element={<Enroll />} />
          <Route path="thank-you" element={<ThankYou />} />
          <Route path="payment/callback" element={<PaymentCallback />} />
          <Route path="faq" element={<Faq />} />
          <Route path="privacy" element={<Legal doc="privacy" />} />
          <Route path="terms" element={<Legal doc="terms" />} />
          <Route path="cookies" element={<Legal doc="cookies" />} />
          <Route path="resources" element={<Resources />} />
          <Route path="newsletter/confirm" element={<NewsletterConfirm />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </SettingsProvider>
  );
}
