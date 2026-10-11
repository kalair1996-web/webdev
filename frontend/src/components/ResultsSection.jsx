import useCountUp from '../useCountUp.js';

const RING_LENGTH = 2 * Math.PI * 52; // must match r="52" in the SVG ring

function Chips({ names, kind }) {
  if (names.length === 0) {
    return (
      <p className="empty-note">
        {kind === 'present' ? 'None detected.' : 'Nothing missing — nice resume!'}
      </p>
    );
  }
  return (
    <div className="chips">
      {names.map((name) => (
        <span key={name} className={'chip ' + kind}>
          {name}
        </span>
      ))}
    </div>
  );
}

export default function ResultsSection({ result, onReset }) {
  const { score, present, missing, source } = result;
  const shown = useCountUp(score);
  const ringClass = score >= 70 ? 'score-high' : score >= 40 ? 'score-mid' : 'score-low';

  return (
    <section className="results-section" id="results">
      <div className="container">
        <div className="results-grid">
          <div className="card score-card">
            <h2 className="card-title">Match score</h2>
            <div className={'score-ring ' + ringClass}>
              <svg viewBox="0 0 120 120" aria-hidden="true">
                <circle className="ring-bg" cx="60" cy="60" r="52" />
                <circle
                  className="ring-fg"
                  cx="60"
                  cy="60"
                  r="52"
                  style={{ strokeDashoffset: RING_LENGTH * (1 - score / 100) }}
                />
              </svg>
              <div className="score-value">
                <span id="score-number">{shown}</span>
                <span className="score-unit">%</span>
              </div>
            </div>
            <p className="score-summary">
              {present.length} of {present.length + missing.length} skills matched
              {source ? ` · ${source}` : ''}
            </p>
          </div>

          <div className="skills-column">
            <div className="card">
              <h2 className="card-title">
                Skills present
                <span className="count-badge present">{present.length}</span>
              </h2>
              <Chips names={present} kind="present" />
            </div>

            <div className="card">
              <h2 className="card-title">
                Skills missing
                <span className="count-badge missing">{missing.length}</span>
              </h2>
              <Chips names={missing} kind="missing" />
            </div>
          </div>
        </div>

        <button className="btn-secondary" type="button" onClick={onReset}>
          Parse another resume
        </button>
      </div>
    </section>
  );
}
