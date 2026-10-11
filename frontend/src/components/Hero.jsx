export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container">
        <p className="eyebrow">Resume Parser · resume vs. job description</p>
        <h1>Score your resume against the job.</h1>
        <p className="subtitle">
          Upload a resume PDF, paste a job description, and get a 0-to-shipped
          match, the skills it detects, and the skills it's missing. The parser
          runs on a small Express server — your PDF never leaves your machine
          until you hit Parse.
        </p>
      </div>
    </section>
  );
}
