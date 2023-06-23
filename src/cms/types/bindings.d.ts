export type Bindings = {
    USERNAME: string
    PASSWORD: string
    KVDATA: KVNamespace
    D1DATA: KVNamespace
  }
  
  declare global {
    function getMiniflareBindings(): Bindings
  }