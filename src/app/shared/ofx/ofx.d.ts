// The adpator for ofx lib
declare module 'ofx' {
  export function parse(data: string): any
  export function serialize(header: any, body: any): string
}
