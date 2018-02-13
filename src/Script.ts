import * as Test from "./TestDB";

let _db = new Test.DB();

_db.Connect(() => {
    document.getElementById("appendData").onclick = () => {
        AppendData();
    };
});


function AppendData() {

    let recSize = Number.parseInt((document.getElementById('binary-size') as HTMLInputElement).value);
    let recCount = Number.parseInt((document.getElementById('record-count') as HTMLInputElement).value);

    let output = document.getElementById('output-log');

    let counter = 0;
    let totalSize = 0;

    let func = (count: number) => {
        if (count > 0) {
            let dat = new Test.Dummy(recSize);
            counter++;
            let key = ("00000000" + counter.toString()).slice(-8);

            _db.Write<Test.Dummy>(Test.DB.DUMMY, key, dat, () => {
                totalSize += recSize;
                let log = key + " : Total Size = " + totalSize.toString() + "MB";
                output.textContent = output.textContent + log.toString() + "\n";
                console.info(log);
                func(count - 1);
            });
        }
    };

    func(recCount);
}
