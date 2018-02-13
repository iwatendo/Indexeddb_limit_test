import AbstractIndexedDB from "./AbstractIndexedDB";
import * as DBI from "./AbstractIndexedDB";


export class Dummy {
    buffer: ArrayBuffer;
    constructor(size:number) {
        this.buffer = new ArrayBuffer(1024 * 1024 * size);
    }
}

export class Data {
    Rooms: Array<Dummy>;
}

export class DB extends AbstractIndexedDB<Data> {

    public static NAME = "Test";
    public static NOTE = "テスト";
    public static DUMMY: string = 'dummy';

    constructor() {
        super(DB.NAME);
        this.SetStoreList(DB.DUMMY);
    }

    public GetName(): string { return DB.NAME; }
    public GetNote(): string { return DB.NOTE; }
}
