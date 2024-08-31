import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

interface CallRecord {
  id: string;
  outgoingNumber: string;
  incomingNumber: string;
  name: string;
  location: string;
}

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string;
  target: string;
}

interface Props {
  callRecords: CallRecord[];
}

const CallGraph: React.FC<Props> = ({ callRecords }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<CallRecord | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 2000;
    const height = 1500;

    svg.attr('width', width).attr('height', height);

    const nodes: Node[] = [];
    const links: Link[] = [];
    const nodeMap = new Map<string, Node>();

    callRecords.forEach(record => {
      // if (record.outgoingNumber && record.incomingNumber) {
      //   if (!nodeMap.has(record.outgoingNumber)) {
      //     const node = { id: record.id, name: record.outgoingNumber }; // Используем номер телефона как имя
      //     nodes.push(node);
      //     nodeMap.set(record.outgoingNumber, node);
      //   }
      //   if (!nodeMap.has(record.incomingNumber)) {
      //     const node = { id: record.id, name: record.incomingNumber }; // Используем номер телефона как имя
      //     nodes.push(node);
      //     nodeMap.set(record.incomingNumber, node);
      //   }
      //   links.push({
      //     source: record.outgoingNumber,
      //     target: record.incomingNumber,
      //   });
      // }
      if (!nodeMap.has(record.outgoingNumber)) {
        const node = { id: record.outgoingNumber, name: record.outgoingNumber };
        nodes.push(node);
        nodeMap.set(record.outgoingNumber, node);
      }
      if (!nodeMap.has(record.incomingNumber)) {
        const node = { id: record.incomingNumber, name: record.incomingNumber };
        nodes.push(node);
        nodeMap.set(record.incomingNumber, node);
      }
      links.push({
            source: record.outgoingNumber,
            target: record.incomingNumber,
          });
    });

    // Добавление определения стрелки
    svg.append("defs").selectAll("marker")
      .data(["end"])
      .enter().append("marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -1.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
      .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#999");

    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1)
      .attr("marker-end", "url(#arrow)"); 
      
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2));

      simulation.on('tick', () => {
        link
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y);
  
        node
          .attr('cx', (d: any) => d.x)
          .attr('cy', (d: any) => d.y);
      });

    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 5)
      .attr('fill', '#69b3a2')
      .call(drag(simulation) as any);

    node.append('title')
      .text((d: Node) => d.name);

   
  
      node.on('click', (event: any, d: Node) => {
        const record = callRecords.find(r => r.outgoingNumber === d.id || r.incomingNumber === d.id);
        setSelectedNode(record || null);
  
        // Выделение выбранного узла
        node.attr('fill', (n: Node) => n === d ? '#ff0000' : '#69b3a2');
  
        // Выделение связанных линий без изменения стрелок
        link
          .attr('stroke', (l: any) => (l.source === d || l.target === d) ? '#ff0000' : '#999')
      });

      // Изменение размера узла в зависимости от количества связей
      const nodeDegree = new Map<string, number>();
        links.forEach(link => {
          nodeDegree.set(link.source, (nodeDegree.get(link.source) || 0) + 1);
          nodeDegree.set(link.target, (nodeDegree.get(link.target) || 0) + 1);
        });

        node.attr('r', (d: any) => 5 + (nodeDegree.get(d.id) || 0)); // Увеличиваем радиус в зависимости от количества связей

  
      // Функция для реализации перетаскивания узлов
      function drag(simulation: d3.Simulation<Node, undefined>) {
        function dragstarted(event: any) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        }
  
        function dragged(event: any) {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        }
  
        function dragended(event: any) {
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
        }
  
        return d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended);
      }
  
      // Добавление зума
      const zoom = d3.zoom()
        .scaleExtent([0.1, 10])
        .on('zoom', (event) => {
          svg.selectAll('g').attr('transform', event.transform);
        });
  
      svg.call(zoom as any);
  
      // Очистка при размонтировании компонента
      return () => {
        simulation.stop();
      };
    }, [callRecords]);
  
    return (
      <div style={{ display: 'flex' }}>
        <svg ref={svgRef}></svg>
        <div style={{ marginLeft: '20px' }}>
          {selectedNode && (
            <div>
              <h3>Selected Node Info</h3>
              <p>Name: {selectedNode.name}</p>
              <p>Location: {selectedNode.location}</p>
              <p>Outgoing Number: {selectedNode.outgoingNumber}</p>
              <p>Incoming Number: {selectedNode.incomingNumber}</p>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default CallGraph;