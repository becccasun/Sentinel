import { FIcon } from '@/lib/icons';

/* One report finding line. `html` carries <strong> emphasis from buildReport. */
export default function Finding({ ic = 'check', html }) {
  return (
    <div className="finding">
      <span className="f-ic"><FIcon ic={ic} /></span>
      <span dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
