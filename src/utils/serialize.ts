/**
 * Utility function to serialize BigInt values recursively
 * This prevents "Do not know how to serialize a BigInt" errors when sending JSON responses
 */
export function serializeBigInt(obj: { [key: string]: unknown }): { [key: string]: unknown } {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return obj.toString();
    if (Array.isArray(obj)) return obj.map(serializeBigInt);
    if (typeof obj === 'object') {
        const serialized: { [key: string]: unknown } = {};
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
