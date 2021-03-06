export interface SelectCache {
    nodeIdentifier: string;
    roomName: string;
    nodeName: string;
    id: string;
    paramObject: any;
    label: Label[];
    result: any;
}

export interface SelectCacheRequery {
    nodeIdentifier: string;
    roomName: string;
    nodeName: string;
    id: string;
    paramObject: any;
    label: Label[];
    result: any;
    latestResult: any;
}

export type NodeType = 'T' | 'C' | 'R' | 'U' | 'D';

// dao query config
export interface NodeConfig {
    mode: NodeType;
    id: string;
    labels: Label[];
}

// dao client run data
export interface NodeClientRunData {
    roomName: string;
    nodeName: string;
    paramObject: any;
}

// dao client run data result
export interface NodeClientRunDataResult {
    result: any;
}

// when type
export type WhenTypeFunction = (paramName: string) => (paramObject: any) => string | number;
export type WhenParamType = string | WhenTypeFunction;

export type When = (selfParamObject: any, mNodeParamObject: any) => boolean;

export interface Label {
    label: string;
    when: When;
}
