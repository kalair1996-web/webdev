import { useState } from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import UploadCard from './components/UploadCard.jsx';
import ResultsSection from './components/ResultsSection.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  const [result, setResult] = useState(null); // { score, present, missing, source }
  const [status, setStatus] = useState({ text: '', kind: 'info' });

  return (
    <>
      <Header />
      <main>
        <Hero />
        <UploadCard onResult={setResult} status={status} onStatus={setStatus} />
        {result && <ResultsSection result={result} onReset={() => setResult(null)} />}
      </main>
      <Footer />
    </>
  );
}
