/**
 * This function simply returns the value of the input parameter attached together.
 */
export function simpleNodeUUID(roomName: string, nodeName: string, paramObject: any): string {
    // this string uniquely identifies the node call
    return `${roomName}_${nodeName}_${JSON.stringify(paramObject)}`;
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

export function isObject(value: any) {
    try {
        if (
            typeof value === 'boolean' ||
            typeof value === 'number' ||
            typeof value === 'string' ||
            typeof value === 'bigint' ||
            typeof value === 'function' ||
            typeof value === 'symbol'
        ) {
            return false;
        } else {
            if (value.length) {
                // array
                return false;
            } else {
                // possibly object
                return true;
            }
        }
    } catch (error) {
        return false;
    }
}

export function isArray(value: any) {
    return Array.isArray(value);
}

export function isPrimitive(value: any) {
    if (
        typeof value === 'boolean' ||
        typeof value === 'number' ||
        typeof value === 'string' ||
        typeof value === 'bigint' ||
        typeof value === 'function' ||
        typeof value === 'symbol'
    ) {
        return true;
    } else {
        return false;
    }
}

export function valueType(value: any) {
    if (isPrimitive(value)) {
        return 'primitive';
    } else if (isArray(value)) {
        return 'array';
    } else if (isObject(value)) {
        return 'object';
    }
}

export function mergeMissingValues(old_data: any, new_data: any) {
    Object.keys(new_data).forEach((key) => {
        if (!old_data.hasOwnProperty(key)) {
            old_data[key] = new_data[key];
        }
    });

    Object.keys(old_data).forEach((key) => {
        if (!new_data.hasOwnProperty(key)) {
            new_data[key] = old_data[key];
        }
    });

    return {
        old_data,
        new_data,
    };
}

/**
 * This function support three data type -> primitive , array and object
 * Primitive value as supported by the JSON
 */
export function findNewValueFromDelta(oldValue: any, delta: any, id: string) {
    // if we are receiving the different data type then just return the new value ( delta )
    if (valueType(delta) !== valueType(oldValue)) {
        return delta;
    }

    // if the value is primitive then return the delta
    if (valueType(delta) === 'primitive') {
        return delta;
    }

    // if the value is array
    if (valueType(delta) === 'array') {
        // check if all the elements of the array is object or not
        // old value
        const isAllElementObjects = oldValue.every((element: any) => {
            return isObject(element);
        });

        // check if all the elements of the array is object or not
        // delta value
        const isAllElementObjectDelta = delta.every((element: any) => {
            return isObject(element);
        });

        if (isAllElementObjects && isAllElementObjectDelta) {
            const isOldEleIds = oldValue.every((element: any) => {
                return element.hasOwnProperty(id);
            });

            const isNewEleIds = delta.every((element: any) => {
                return element.hasOwnProperty(id);
            });

            if (isOldEleIds && isNewEleIds) {
                // delta consist of three mutation type ( create , update and delete )
                const allNewElements: any[] = delta.filter((element: any) => {
                    return element.hasOwnProperty('nr') && element.nr === true;
                });

                const allDeleteElements: any[] = delta.filter((element: any) => {
                    return element.hasOwnProperty('dr') && element.dr === true;
                });

                const allUpdatedElements: any[] = delta.filter((element: any) => {
                    return element.hasOwnProperty('nr') && element.nr === false;
                });

                const newElements: any[] = [];
                // merge the new item at the proper positions
                for (const element of allNewElements) {
                    // if this is creation row then it must contain pRef with value equal to 'id' or null
                    const ref = element.pRef;
                    if (!ref) {
                        // there should be no row on top of this row
                        // push to the top of the array
                        // delete the ref and nr key generated by the node room
                        delete element.pRef;
                        delete element.nr;
                        oldValue.unshift(element);
                    } else {
                        const indexOfRef = oldValue.findIndex((ele: any) => ele[id] === ref);
                        if (indexOfRef !== -1) {
                            delete element.pRef;
                            delete element.nr;
                            // if the index is found then insert the element at that index
                            oldValue.splice(indexOfRef + 1, 0, element);
                        }
                    }
                }

                // merge the update delta and delete delta
                for (const element of oldValue) {
                    const foundDeleted = allDeleteElements.find((ele: any) => ele[id] === element[id]);
                    if (!foundDeleted) {
                        // this row is not deleted
                        // check for the update
                        const foundUpdated = allUpdatedElements.find((ele: any) => ele[id] === element[id]);
                        if (foundUpdated) {
                            // this row is updated
                            // so we need to add this element to newElements
                            delete foundUpdated.nr;
                            // merge the old and updated properties of the updated row
                            for (const uKey of Object.keys(foundUpdated)) {
                                const oldEleKeyVal = element[uKey];
                                const newEleKeyVal = foundUpdated[uKey];
                                const newValue = findNewValueFromDelta(oldEleKeyVal, newEleKeyVal, id);
                                element[uKey] = newValue;
                            }

                            newElements.push(element);
                        } else {
                            // this row is not updated
                            // so we need to add this element as it is to the final array
                            newElements.push(element);
                        }
                    }
                }

                return newElements;
            } else {
                // delta's elements are not collections of rows
                // just return the delta as latest value
                return delta;
            }
        } else {
            // delta's elements are not collections of rows
            // just return the delta as latest value
            return delta;
        }
    }

    if (valueType(delta) === 'object') {
        // merge the keys of both object to each other
        const { old_data, new_data } = mergeMissingValues(oldValue, delta);
        const deltaFinalObj: any = {};

        for (const key of Object.keys(new_data)) {
            deltaFinalObj[key] = findNewValueFromDelta(old_data[key], new_data[key], id);
        }

        return deltaFinalObj;
    }

    return delta;
}

export function isLocalStorageAvailable() {
    var test = 'test';
    try {
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

// emulate the local storage static methods
export class LocalStorageUniversal {
    private static _instance: LocalStorageUniversal;
    private _storage: any = {};

    private constructor() {}

    public static get instance() {
        if (!LocalStorageUniversal._instance) {
            LocalStorageUniversal._instance = new LocalStorageUniversal();
        }
        return LocalStorageUniversal._instance;
    }

    public setItem(key: string, value: any): void {
        if (isNode()) {
            this._storage[key] = value;
        } else {
            localStorage.setItem(key, value);
        }
    }

    public getItem(key: string): string | null {
        if (isNode()) {
            return this._storage[key];
        } else {
            return localStorage.getItem(key);
        }
    }

    public removeItem(key: string): void {
        if (isNode()) {
            delete this._storage[key];
        } else {
            localStorage.removeItem(key);
        }
    }

    public clear(): void {
        if (isNode()) {
            this._storage = {};
        } else {
            localStorage.clear();
        }
    }

    public key(index: number): string | null {
        if (isNode()) {
            return Object.keys(this._storage)[index];
        } else {
            return localStorage.key(index);
        }
    }

    public get length(): number {
        if (isNode()) {
            return Object.keys(this._storage).length;
        } else {
            return localStorage.length;
        }
    }
}

// is web browser
export function isBrowser() {
    return typeof window !== 'undefined';
}

// is node js
export function isNode() {
    return !isBrowser();
}

// for node js
export class NodeJsConfig {
    private nodeJsConfig!: { nodeFetch: any; nodeEventSource: any };
    private static _instance: NodeJsConfig;

    private constructor() {}

    public static get instance() {
        if (!NodeJsConfig._instance) {
            NodeJsConfig._instance = new NodeJsConfig();
        }
        return NodeJsConfig._instance;
    }

    public setConfig(config: { nodeFetch: any; nodeEventSource: any }) {
        this.nodeJsConfig = config;
    }

    public getConfig() {
        return this.nodeJsConfig;
    }
}
