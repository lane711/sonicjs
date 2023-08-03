export type Bindings = {
    USERNAME: string
    PASSWORD: string
    KVDATA: KVNamespace
    D1DATA: D1Database
    __D1_BETA__D1DATA: D1Database
  }
  
  declare global {
    function getMiniflareBindings(): Bindings
  }