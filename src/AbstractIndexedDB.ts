interface OnCreateDB { (): void };
export interface OnRemoveDB { (): void };
interface ObtainWritekey<T> { (T): string };
interface OnReadObject<T> { (T): void };
interface OnWriteDB<T> { (): void };
interface OnDeleteObject<T> { (): void };
interface OnClearObject<T> { (): void };
interface OnConnect { (): void };
export interface OnLoadComplete<T> { (data: T): void }
export interface OnWriteComplete { (): void }


export default abstract class AbstractIndexedDB<D> {

    protected _dbname: string;
    protected _db: IDBDatabase;
    protected _storelist: Array<string>;


    constructor(dbName: string) {
        this._dbname = dbName;
        this._storelist = new Array<string>();
    }


    protected SetStoreList(storeName: string) {
        this._storelist.push(storeName);
    }


    private RequestError(e: Event, req: IDBRequest) {
        if (req && req.error) {
            alert(req.error.toString());
        }
        else {
            alert("Unknown request error in IndexedDB.");
        }
    }


    protected Create(onCreate: OnCreateDB) {
        let rep: IDBOpenDBRequest = window.indexedDB.open(this._dbname, 2);
        rep.onupgradeneeded = (e) => { this.CreateStore(e) };
        rep.onsuccess = (e) => { onCreate(); };
        rep.onerror = (e) => { this.RequestError(e, rep); };
    }


    private CreateStore(event: IDBVersionChangeEvent) {
        this._db = (<IDBRequest>event.target).result;
        this._storelist.forEach((s) => this._db.createObjectStore(s));
    }


    public Remove(onRemove: OnRemoveDB) {

        if (this._db)
            this._db.close();

        let req = window.indexedDB.deleteDatabase(this._dbname);
        req.onsuccess = (e) => { onRemove(); };
        req.onerror = (e) => { this.RequestError(e, req); }

        req.onblocked = (e: IDBVersionChangeEvent) => {
            //
        };

        req.onupgradeneeded
    }


    public Connect(onconnect: OnConnect) {

        let rep: IDBOpenDBRequest = window.indexedDB.open(this._dbname, 2);

        rep.onupgradeneeded = (e) => { this.CreateStore(e); }

        rep.onerror = (e) => { alert(rep.error.toString()); };

        rep.onsuccess = (e) => {
            this._db = rep.result;
            onconnect();
        };
    }


    public Write<T>(storeName: string, key: IDBKeyRange | IDBValidKey, data: T, callback: OnWriteDB<T> = null) {

        let trans = this._db.transaction(storeName, 'readwrite');
        let store = trans.objectStore(storeName);

        if (key) {
            let req = store.put(data, key);

            req.onerror = (e) => { this.RequestError(e, req); };

            if (callback != null) {
                req.onsuccess = (e) => {
                    callback();
                }
            }

        }
        else {
            alert("Store key is empty.");
        }
    }


    public Delete<T>(storeName: string, key: IDBKeyRange | IDBValidKey, callback: OnDeleteObject<T> = null) {
        let trans = this._db.transaction(storeName, 'readwrite');
        let store = trans.objectStore(storeName);
        let request = store.delete(key);
        request.onerror = (e) => { this.RequestError(e, request); }

        if (callback != null) {
            request.onsuccess = (e) => { callback(); }
        }
    }


    public WriteAll<T>(storeName: string, getkey: ObtainWritekey<T>, datalist: Array<T>, callback: OnWriteDB<T> = null) {

        let writefunc = (data) => {

            if (data == undefined) {
                if (callback != null)
                    callback();
            }
            else {
                this.Write(storeName, getkey(data), data, () => {
                    writefunc(datalist.pop());
                });
            }
        };

        writefunc(datalist.pop());
    }


    public Read<T, K>(storeName: string, key: K, callback: OnReadObject<T>) {

        let trans = this._db.transaction(storeName, 'readonly');
        let store = trans.objectStore(storeName);
        let req = store.get(key);

        req.onerror = (e) => { this.RequestError(e, req); }
        req.onsuccess = (e) => { callback(req.result); };
    }


    public ReadAll<T>(storeName: string, callback: OnReadObject<Array<T>>) {

        this._db.onerror = (e) => {
            alert(e.target)
        }
        let trans = this._db.transaction(storeName, 'readonly');
        let store = trans.objectStore(storeName);
        let req = store.openCursor();

        let result: Array<T> = new Array<T>();

        req.onerror = (e) => { this.RequestError(e, req); }
        req.onsuccess = (e) => {
            let cursor = <IDBCursorWithValue>(req).result;

            if (cursor) {
                let msg = cursor.value as T;
                if (msg)
                    result.push(cursor.value);

                cursor.continue();
            }
            else {
                callback(result);
            }
        };

    }


    public ClearAll<T>(storeName: string, callback: OnClearObject<T>) {

        let trans = this._db.transaction(storeName, 'readwrite');
        let store = trans.objectStore(storeName);
        let req = store.openCursor();
        store.clear();
        req.onerror = (e) => { this.RequestError(e, req); };
        req.onsuccess = (e) => { callback(); };

    }

    public abstract GetName(): string;

    public abstract GetNote(): string;

}