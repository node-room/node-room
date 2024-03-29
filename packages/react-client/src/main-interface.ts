export type loading_status = 'loading' | 'loaded' | 'error';

export interface signalResult {
    status: loading_status;
    error: any | null;
    data: any | null;
    isLocal: boolean;
    paginationID: string | null;
    nodeRelationID: string | null;
    isReachEnd: boolean;
    isLoadingMore:boolean;
}

export function generateUUID(): string {
    let d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
}