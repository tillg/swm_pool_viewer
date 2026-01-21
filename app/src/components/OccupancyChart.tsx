import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import * as d3 from 'd3';
import { BucketData } from '../types';
import { theme } from '../styles/theme';

const ChartContainer = styled.div`
  width: 100%;
`;

const SVG = styled.svg`
  display: block;
  width: 100%;
  height: auto;
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

    // Helper function to calculate "darkness" based on hour
    // Uses exponential curve for sharper day/night transitions
    const getNightIntensity = (hour: number): number => {
      // Sunrise ~7:00, Sunset ~17:00 (winter in Munich)
      // Use cosine as base, then apply power function for sharper transitions
      const radians = (hour / 24) * 2 * Math.PI;
      const cosValue = Math.cos(radians); // 1 at midnight, -1 at noon
      const linearIntensity = (cosValue + 1) / 2; // Normalize to 0-1 range

      // Apply power function to create sharper transitions
      // Higher power = wider light day, sharper transition to dark night
      const sharpIntensity = Math.pow(linearIntensity, 3);
      return sharpIntensity;
    };

    // Draw day/night background with smooth hourly gradient
    const bgGroup = g.append('g').attr('class', 'day-night-bg');
    const startTime = buckets[0].startTime;
    const endTime = buckets[buckets.length - 1].endTime;
    const totalHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    // Draw one rectangle per hour for smooth gradient
    const hoursToRender = Math.ceil(totalHours);
    for (let i = 0; i < hoursToRender; i++) {
      const hourStart = new Date(startTime.getTime() + i * 60 * 60 * 1000);
      const hourEnd = new Date(Math.min(hourStart.getTime() + 60 * 60 * 1000, endTime.getTime()));

      const x1 = xScale(hourStart);
      const x2 = xScale(hourEnd);
      const hour = hourStart.getHours() + hourStart.getMinutes() / 60;
      const intensity = getNightIntensity(hour);

      bgGroup.append('rect')
        .attr('x', x1)
        .attr('y', 0)
        .attr('width', Math.max(0, x2 - x1))
        .attr('height', innerHeight)
        .attr('fill', '#cbd5e1') // Slate gray for night
        .attr('opacity', intensity * 0.4);
    }

    // Find all midnights in the time range and draw vertical lines
    const midnights: Date[] = [];

    // Start from the first midnight after or at startTime
    const firstMidnight = new Date(startTime);
    firstMidnight.setHours(0, 0, 0, 0);
    if (firstMidnight < startTime) {
      firstMidnight.setDate(firstMidnight.getDate() + 1);
    }

    // Collect all midnights in range
    let current = new Date(firstMidnight);
    while (current <= endTime) {
      midnights.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    // Draw midnight lines
    g.append('g')
      .attr('class', 'midnight-lines')
      .selectAll('line')
      .data(midnights)
      .enter()
      .append('line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4')
      .attr('opacity', 0.7);

    // X axis - use bucket end times as ticks to show actual data boundaries
    // Pick evenly spaced bucket end times, always including the last one
    const numTicks = 6;
    const step = Math.max(1, Math.floor(buckets.length / numTicks));
    const tickValues: Date[] = [];
    for (let i = step - 1; i < buckets.length; i += step) {
      tickValues.push(buckets[i].endTime);
    }
    // Always include the last bucket's end time if not already included
    const lastEndTime = buckets[buckets.length - 1].endTime;
    if (tickValues.length === 0 || tickValues[tickValues.length - 1].getTime() !== lastEndTime.getTime()) {
      tickValues.push(lastEndTime);
    }

    // German day abbreviations
    const germanDays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(tickValues)
      .tickFormat(d => {
        const date = d as Date;
        const day = germanDays[date.getDay()];
        const time = d3.timeFormat('%H:%M')(date);
        return `${day} ◷ ${time}`;
      });

    const xAxisGroup = g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    xAxisGroup.selectAll('text')
      .style('fill', '#000')
      .each(function() {
        const text = d3.select(this);
        const content = text.text();
        // Split into parts: "Do ◷ 20:15" -> ["Do ", "◷", " 20:15"]
        const parts = content.split(/(◷)/);
        text.text('');
        parts.forEach(part => {
          if (part === '◷') {
            text.append('tspan').text(part).style('font-size', '13px');
          } else {
            text.append('tspan').text(part).style('font-size', '12px');
          }
        });
      });

    // Position the last tick label to the left of the tick mark so it doesn't overflow
    const tickTexts = xAxisGroup.selectAll('text').nodes();
    if (tickTexts.length > 0) {
      d3.select(tickTexts[tickTexts.length - 1])
        .style('text-anchor', 'end')
        .attr('dx', '-0.3em');
    }

    // Y axis
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => `${d}%`);

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#000');

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
      .style('font-size', '14px')
      .style('fill', '#000')
      .text('Auslastung');

  }, [buckets, facilities, colorMap, visibility, width, height, margin]);

  return (
    <ChartContainer>
      <SVG
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMinYMin meet"
      />
    </ChartContainer>
  );
}
