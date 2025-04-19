export interface ChatMsg {
    room: string
    sender: string
    text: string
    ts: number
    role: 'human' | 'agent'
  }
  
  export interface NodeDatum {
    id: string
    label: string
  }
  
  export interface LinkDatum {
    source: string
    target: string
  }
  