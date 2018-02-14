import AbstractIndexedDB from "./AbstractIndexedDB";
import * as DBI from "./AbstractIndexedDB";


export class Dummy {
    id: string;
    buffer: ArrayBuffer;
    constructor(id: string, size: number) {
        this.id = id;
        this.buffer = new ArrayBuffer(size);
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
