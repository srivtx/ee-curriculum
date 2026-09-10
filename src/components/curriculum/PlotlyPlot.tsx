'use client';

import * as React from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-dist-min';

// plotly.js-dist-min is ~1.2 MB gzipped; only this chunk pulls it in.
// The parent component lazy-loads us via next/dynamic({ ssr: false }) so
// Plotly never touches the server bundle.
const Plot = createPlotlyComponent(Plotly);

export interface PlotlyPlotProps {
  data: any[];
  layout?: any;
  config?: any;
  style?: React.CSSProperties;
  className?: string;
}

export function PlotlyPlot({ data, layout, config, style, className }: PlotlyPlotProps) {
  return (
    <Plot
      data={data}
      layout={layout}
      config={config}
      useResizeHandler
      style={{ width: '100%', height: 360, ...style }}
      className={className}
    />
  );
}

export default PlotlyPlot;
