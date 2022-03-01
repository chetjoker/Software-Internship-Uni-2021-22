import_csv_reader = require('../csv_reader_function');
 
// Test for reading CSV

test('readCSV rejects with wrong file name', () => {
    return expect(import_csv_reader.readCSV("./someinvalidfilepath.csv")).rejects.toMatch('Something went wrong with reading the csv');
});

// Tests for ReadAndCalcParameters

test('correct values for calc parameters', () => {
    let dummyConfig = [1,0,1,1]

    let dummyCSV = `"method_name","root","BLOCKSIZE","JOBS","LEVEL","run_time(ms;<)","energy(mWs;<)"\n"function1",1,0,0,0,2,2\n"function1",0,1,0,0,2,2\n"function1",0,0,1,0,2,2\n"function1",0,0,0,1,2,2\n"function1",0,0,1,1,2,2\n"function1",1,0,1,0,2,2\n"function1",1,1,1,1,2,2\n"function2",1,0,0,0,3,3\n"function2",0,1,0,0,3,3\n"function2",0,1,1,0,3,3\n"function2",1,0,1,0,3,3\n"function3",0,0,1,1,3,3\n`

    //Expects [{name: "function1", runtime: 10, energy: 10}, {name: "function2", runtime: 9, energy: 9}]
    calculatedMethods = import_csv_reader.readAndCalcParameters(dummyConfig, dummyCSV);

    expect(calculatedMethods[0].runtime).toBe(10);
    expect(calculatedMethods[1].energy).toBe(6);
});