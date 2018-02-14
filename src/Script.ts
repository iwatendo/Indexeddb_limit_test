import * as Test from "./TestDB";

let _db = new Test.DB();

_db.Connect(() => {
    document.getElementById("writeTest").onclick = () => { DoWriteTest(GetBinarySize(), GetRecordCount()); };
    document.getElementById("readTest").onclick = () => { DoReadTest(GetBinarySize(), GetRecordCount()); };
    document.getElementById("deleteTest").onclick = () => { DoDeleteTest(GetBinarySize(), GetRecordCount()); };
});


function GetBinarySize(): number {
    let recSize = Number.parseInt((document.getElementById('binary-size') as HTMLInputElement).value);
    return recSize * 1024 * 1024;
}

function GetRecordCount(): number {
    return Number.parseInt((document.getElementById('record-count') as HTMLInputElement).value);
}

function GetLogElement(): HTMLTextAreaElement {
    return document.getElementById('output-log') as HTMLTextAreaElement;
}

function WriteLog(element: HTMLTextAreaElement, text: string) {
    element.textContent += text;
    element.scrollTop = element.scrollHeight;
}

function CreateKey(cnt: number): string {
    return ("00000" + cnt.toString()).slice(-5);
}

/**
 * 書込テスト
 * @param binarySize 
 * @param recCount 
 */
function DoWriteTest(binarySize: number, recCount: number) {

    let logElement = GetLogElement();
    logElement.textContent = "";

    let totalSize = 0;

    //  書込チェック
    let func = (cnt: number) => {

        if (cnt < recCount) {

            cnt++;
            let key = CreateKey(cnt);

            let dat = new Test.Dummy(key, binarySize);

            _db.Write<Test.Dummy>(Test.DB.DUMMY, key, dat, () => {

                WriteLog(logElement, "Key " + key + " : Write ");

                ExistCheck(key, binarySize, (isExist: boolean) => {

                    if (isExist) {
                        totalSize += binarySize;
                        WriteLog(logElement, "/ Read succeed : Total " + (totalSize / (1024 * 1024)).toString() + " MB\n");
                    }
                    else {
                        WriteLog(logElement, "/ No Data\n");
                    }

                    func(cnt);
                });
            });
        }
    };

    func(0);
}


/**
 * 読込テスト
 * @param binarySize 
 * @param recCount 
 */
function DoReadTest(binarySize: number, recCount: number) {

    let logElement = GetLogElement();
    logElement.textContent = "";

    let totalSize = 0;

    //  読込チェック
    let readCheck = (cnt: number) => {

        if (cnt < recCount) {

            cnt++;
            let key = CreateKey(cnt);

            ExistCheck(key, binarySize, (isExist: boolean) => {
                WriteLog(logElement, "Key " + key + " : ");
                if (isExist) {
                    WriteLog(logElement, "Read succeed\n");
                }
                else {
                    WriteLog(logElement, "No Data\n");
                }
                readCheck(cnt);
            });
        }
    }

    readCheck(0);
}


/**
 * 削除テスト
 * @param binarySize 
 * @param recCount 
 */
function DoDeleteTest(binarySize: number, recCount: number) {

    let logElement = GetLogElement();
    logElement.textContent = "";

    let totalSize = 0;

    //  削除処理
    let func = (cnt: number) => {

        if (cnt < recCount) {

            cnt++;
            let key = CreateKey(cnt);

            ExistCheck(key, binarySize, (isExist: boolean) => {
                WriteLog(logElement, "Key " + key + " : ");
                if (isExist) {
                    _db.Delete<Test.Dummy>(Test.DB.DUMMY, key, () => {
                        WriteLog(logElement, "Delete\n");
                        func(cnt);
                    });
                }
                else {
                    WriteLog(logElement, "No Data\n");
                    func(cnt);
                }
            });

        }
    }

    func(0);
}


function ExistCheck(key: string, recsize: number, callback) {

    _db.Read<Test.Dummy, string>(Test.DB.DUMMY, key, (readRec: Test.Dummy) => {
        if (readRec && readRec.id === key && readRec.buffer.byteLength === recsize) {
            callback(true);
        }
        else {
            callback(false);
        }
    });

}
