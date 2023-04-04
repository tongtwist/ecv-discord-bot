export type TJSONPrimitive = string | number | boolean | null
export type TJSONArray = TJSON[]
export type TJSONObject = {[key: string]: TJSON}
export type TJSON = TJSONPrimitive | TJSONArray | TJSONObject
