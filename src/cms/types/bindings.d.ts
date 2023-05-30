export type Bindings = {
    USERNAME: string
    PASSWORD: string
    KVDATA: KVNamespace
  }
  
  declare global {
    function getMiniflareBindings(): Bindings
  }