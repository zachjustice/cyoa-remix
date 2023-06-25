export function isObjectEmpty(obj: Object): boolean {
	return !obj || Object.keys(obj).length === 0
}
