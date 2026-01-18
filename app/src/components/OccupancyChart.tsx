import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import * as d3 from 'd3';
import { BucketData } from '../types';
import { theme } from '../styles/theme';

const ChartContainer = styled.div`
  width: 100%;
  overflow: hidden;
`;

const SVG = styled.svg`
  display: block;
`;

interface OccupancyChartProps {
  buckets: BucketData[];
  facilities: string[];
  colorMap: Map<string, string>;
  visibility: Map<string, boolean>;
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
}

export function OccupancyChart({
  buckets,
  facilities,
  colorMap,
  visibility,
  width,
  height,
  margin
}: OccupancyChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || buckets.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale - time
    const xScale = d3
      .scaleTime()
      .domain([buckets[0].startTime, buckets[buckets.length - 1].endTime])
      .range([0, innerWidth]);

    // Y scale - occupancy percentage
    const yScale = d3
      .scaleLinear()
      .domain([0, 100])
      .range([innerHeight, 0]);

    // X axis
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(6)
      .tickFormat(d => d3.timeFormat('%a %H:%M')(d as Date));

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '11px')
      .style('fill', theme.colors.text.secondary);

    // Y axis
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => `${d}%`);

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '11px')
      .style('fill', theme.colors.text.secondary);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(yScale.ticks(5))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', theme.colors.border)
      .attr('stroke-dasharray', '3,3');

    // Line generator
    const line = d3
      .line<{ time: Date; value: number }>()
      .x(d => xScale(d.time))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX)
      .defined(d => d.value != null && !isNaN(d.value));

    // Draw lines for each visible facility
    facilities.forEach(facility => {
      if (!visibility.get(facility)) return;

      const color = colorMap.get(facility) || '#999';
      const lineData: { time: Date; value: number }[] = [];

      buckets.forEach(bucket => {
        const value = bucket.facilities.get(facility);
        if (value != null) {
          // Use bucket midpoint for x position
          const midTime = new Date(
            (bucket.startTime.getTime() + bucket.endTime.getTime()) / 2
          );
          lineData.push({ time: midTime, value });
        }
      });

      if (lineData.length > 0) {
        g.append('path')
          .datum(lineData)
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', 2)
          .attr('d', line);
      }
    });

    // Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 15)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#666')
      .text('Occupancy');

  }, [buckets, facilities, colorMap, visibility, width, height, margin]);

  return (
    <ChartContainer>
      <SVG ref={svgRef} width={width} height={height} />
    </ChartContainer>
  );
}
