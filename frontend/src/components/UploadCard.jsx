import { useRef, useState } from 'react';

const SAMPLE_JD = `Frontend Developer — Acme Corp

We are looking for a frontend developer with 2+ years of experience.

Required skills:
- JavaScript and TypeScript
- React and modern CSS (flexbox, grid)
- REST API integration
- Git, CI/CD (GitHub Actions), unit testing with Jest
- Docker and accessibility (a11y) are a plus`;

export default function UploadCard({ onResult, status, onStatus }) {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState(SAMPLE_JD);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  async function handleParse() {
    if (!file) {
      onStatus({ text: 'Choose a PDF resume first.', kind: 'error' });
      return;
    }
    if (!jd.trim()) {
      onStatus({ text: 'Paste a job description first.', kind: 'error' });
      return;
    }
    setBusy(true);
    onStatus({ text: 'Parsing…', kind: 'info' });
    try {
      const form = new FormData();
      form.append('resume', file);
      form.append('jd', jd);
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? ''}/api/analyze`, { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Parse failed');
      onResult(data);
      onStatus({ text: '', kind: 'info' });
    } catch (err) {
      onStatus({ text: err.message, kind: 'error' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="upload-section" id="upload">
      <div className="container">
        <div className="card">
          <div
            className={'dropzone' + (dragging ? ' dragover' : '')}
            tabIndex={0}
            role="button"
            aria-label="Upload a PDF resume"
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files?.[0];
              if (f) setFile(f);
            }}
          >
            <div className="dropzone-icon" aria-hidden="true">📄</div>
            <p className="dropzone-title">
              {file ? file.name : 'Drop your resume here'}
            </p>
            <p className="dropzone-hint">
              or <span className="link">browse files</span> · PDF only
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              hidden
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <label className="jd-label" htmlFor="jd">Job description</label>
          <textarea
            id="jd"
            className="jd-input"
            rows={10}
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste the job description here…"
          />

          <div className="actions-row">
            <button className="btn-primary" type="button" onClick={handleParse} disabled={busy}>
              {busy ? 'Parsing…' : 'Parse resume'}
            </button>
          </div>

          <p className={'status ' + status.kind} role="status">{status.text}</p>
        </div>
      </div>
    </section>
  );
}
