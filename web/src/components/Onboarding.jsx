import { useState } from 'react';
import { StorePicker } from './StorePicker.jsx';
import { Stepper } from './ui.jsx';

const DEFAULT = ['9ba51', '11deC', '71c90'];

export function Onboarding({ data, onDone }) {
  const available = data.stores.filter((s) => s.offerCount > 0).map((s) => s.id);
  const [stores, setStores] = useState(DEFAULT.filter((id) => available.includes(id)));
  const [people, setPeople] = useState(2);
  return (
    <div className="onboarding">
      <div className="onboarding-head">
        <div className="brand brand--big">Mæt</div>
        <h1>Ugens aftensmad, bygget på ugens tilbud.</h1>
      </div>

      <section>
        <h2 className="section-title">Hvor handler du?</h2>
        <StorePicker stores={data.stores} selected={stores} onChange={setStores} />
      </section>

      <section>
        <Stepper
          label="Hvor mange er I?" value={people} onChange={setPeople}
          unit={(n) => (n === 1 ? 'person' : 'personer')}
        />
      </section>

      <button
        type="button" className="primary wide" disabled={stores.length === 0}
        onClick={() => onDone({ stores, people })}
      >
        Vis ugens retter
      </button>
    </div>
  );
}
