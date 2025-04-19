/* 100 % replacement */
import { useMemo, useRef } from 'react'
import { useForceGraph, NodeDatum, LinkDatum } from './hooks/useForceGraph'

// TODO: replace with a real socket‑feed later
const demoData = () => {
  const nodes: NodeDatum[] = [
    { id: 'you', label: 'You' },
    { id: 'agent‑1', label: 'Agent 1' },
    { id: 'agent‑2', label: 'Agent 2' },
  ]
  const links: LinkDatum[] = [
    { source: 'you', target: 'agent‑1' },
    { source: 'agent‑1', target: 'agent‑2' },
  ]
  return { nodes, links }
}

export default function GraphTab() {
  const svgRef = useRef<SVGSVGElement>(null)

  // memoise demo data so it stays referentially stable
  const { nodes, links } = useMemo(demoData, [])

  // hook wires up the force‑graph
  useForceGraph(svgRef, nodes, links)

  return (
    <svg
      ref={svgRef}
      width={800}
      height={600}
      style={{ border: '1px solid #ddd', background: '#fafafa' }}
    />
  )
}
