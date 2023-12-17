export function logJSON(label: string, obj: any): void
export function logJSON(obj: any): void

export function logJSON(labelOrObj: string, obj?: any) {
	if (obj) {
		console.log(labelOrObj, JSON.stringify(obj, null, 2))
	} else {
		console.log(JSON.stringify(labelOrObj, null, 2))
	}
}
