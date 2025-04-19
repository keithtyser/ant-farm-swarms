/* ────────────────────────────────────────────────────────────────────────────
 * hooks/useForceGraph.ts
 * ---------------------------------------------------------------------------
 * Force‑directed graph shared by <GraphTab/>
 * ------------------------------------------------------------------------- */
import { RefObject, useEffect } from 'react'

/* d3 is split by sub‑packages; importing the exact ones keeps the
   type‑checker happy and tree‑shakes the bundle. */
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  Simulation,
  SimulationNodeDatum,
  SimulationLinkDatum,
} from 'd3-force'
import { select } from 'd3-selection'
import { drag } from 'd3-drag'

/* -------------------------------------------------------------------------- */
/* 1 .  Data types                                                             */
export interface NodeDatum extends SimulationNodeDatum {
  id: string
  label: string
}
export interface LinkDatum extends SimulationLinkDatum<NodeDatum> {
  source: string | NodeDatum
  target: string | NodeDatum
}

/* -------------------------------------------------------------------------- */
/* 2 .  Hook                                                                   */
export function useForceGraph(
  svgRef: RefObject<SVGSVGElement | null>,
  nodes: NodeDatum[],
  links: LinkDatum[]
): void {
  useEffect(() => {
    const svgEl = svgRef.current
    if (!svgEl) return                        // DOM not ready

    const svg = select(svgEl)
    const { width, height } = svgEl.getBoundingClientRect()
    svg.selectAll('*').remove()               // clear prior contents

    /* ── build simulation ──────────────────────────────────────────────── */
    const sim: Simulation<NodeDatum, undefined> = forceSimulation(nodes)
      .force('link', forceLink<NodeDatum, LinkDatum>(links).id((d) => d.id).distance(80))
      .force('charge', forceManyBody<NodeDatum>().strength(-140))
      .force('center', forceCenter(width / 2, height / 2))

    /* ── draw links ────────────────────────────────────────────────────── */
    const linkLines = svg
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke-width', 1.5)

    /* ── draw nodes & labels ───────────────────────────────────────────── */
    const nodeG = svg.append('g')

    const nodeCircles = nodeG
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', 6)
      .attr('fill', '#69b3a2')

    nodeCircles.call(
      drag<SVGCircleElement, NodeDatum>()
        .on('start', (event, d) => {
          if (!event.active) sim.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on('drag', (event, d) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', (event, d) => {
          if (!event.active) sim.alphaTarget(0)
          d.fx = undefined
          d.fy = undefined
        })
    )

    const labels = nodeG
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .text((d) => d.label)
      .attr('font-size', 10)
      .attr('dx', 8)
      .attr('dy', 4)

    /* ── simulation ticks ─────────────────────────────────────────────── */
    sim.on('tick', () => {
      linkLines
        .attr('x1', (d) => (typeof d.source === 'string' ? 0 : d.source.x ?? 0))
        .attr('y1', (d) => (typeof d.source === 'string' ? 0 : d.source.y ?? 0))
        .attr('x2', (d) => (typeof d.target === 'string' ? 0 : d.target.x ?? 0))
        .attr('y2', (d) => (typeof d.target === 'string' ? 0 : d.target.y ?? 0))

      nodeCircles
        .attr('cx', (d) => d.x ?? 0)
        .attr('cy', (d) => d.y ?? 0)

      labels
        .attr('x', (d) => (d.x ?? 0) + 8)
        .attr('y', (d) => (d.y ?? 0) + 4)
    })

    /* ── cleanup when component unmounts ──────────────────────────────── */
    return () => {
      sim.stop()
    }
  }, [svgRef, nodes, links])
}
