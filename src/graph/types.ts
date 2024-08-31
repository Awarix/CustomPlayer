export interface Person {
    name: string;
    surname: string;
    age: number;
    location: string;
    phone: string;
    outgoing: string[];
    incoming: string[];
  }
  
  export interface Node extends d3.SimulationNodeDatum {
    id: string;
    name: string;
  }
  
  export interface Link extends d3.SimulationLinkDatum<Node> {
    source: string;
    target: string;
  }
  
  export interface Graph {
    nodes: Node[];
    links: Link[];
  }