/**
 * Utility function to serialize BigInt values recursively
 * This prevents "Do not know how to serialize a BigInt" errors when sending JSON responses
 */
export function serializeBigInt(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return obj.toString();
    if (Array.isArray(obj)) return obj.map(serializeBigInt);
    if (typeof obj === 'object') {
        const serialized: any = {};
        for (const [key, value] of Object.entries(obj)) {
            serialized[key] = serializeBigInt(value);
        }
        return serialized;
    }
    return obj;
}

/**
 * Serialize an array of objects with BigInt values
 */
export function serializeBigIntArray<T>(arr: T[]): T[] {
    return arr.map(item => serializeBigInt(item));
}
