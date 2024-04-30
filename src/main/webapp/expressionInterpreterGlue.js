class WasmInstance {
  teavm;
  buffer;
  exports;
  path;

  constructor(teavmInstance, wasmPath) {
    this.teavm = teavmInstance;
    this.buffer = this.teavm.memory.buffer;
    this.exports = this.teavm.instance.exports;
    this.wasmPath = wasmPath;
  }

  assertIsWellInitialized() {
    if (this.teavm === undefined ||
        this.buffer === undefined ||
        this.exports === undefined ||
        this.wasmPath === undefined) {
      throw "WasmInstance hasn't been build yet";
    }
  }
}

class WasmInstanceFactory {
  static wasmInstance;

  /**
   * @return {Promise}
   */
  static async build(wasmPath) {
    const options = {
      installImports: (importObj, _controller) => {
        importObj.Request = {
          fetch: Request.fetch,
        };
        importObj.Logger = {
          logJavaString: Logger.logJavaString,
        };
      }
    };
    const teavmInstance = await TeaVM.wasm.load(wasmPath, options);
    this.wasmInstance = new WasmInstance(teavmInstance, wasmPath);
    teavmInstance.main([]);
  }

  /**
   * @return {WasmInstance}
   */
  static get() {
    const wasmInstance = WasmInstanceFactory.wasmInstance;
    if (!wasmInstance) {
      throw "WasmInstance hasn't been build yet";
    }
    wasmInstance.assertIsWellInitialized();
    return wasmInstance;
  }
}

class Logger {
  static logJavaString() {
    const wasmInstance = WasmInstanceFactory.get();
    wasmInstance.assertIsWellInitialized();

    const buffer = wasmInstance.buffer;
    const exports = wasmInstance.exports;
    
    const message = WasmMemoryTools.getString(buffer, exports.getMessagePtr(), exports.getMessageSize());
    console.log(message);
  }
}

class Request {
  static async fetch() {
    const wasmInstance = WasmInstanceFactory.get();
    wasmInstance.assertIsWellInitialized();

    const buffer = wasmInstance.buffer;
    const exports = wasmInstance.exports;

    const url = WasmMemoryTools.getString(buffer, exports.getUrlPtr(), exports.getUrlSize());
    const options = WasmMemoryTools.getJson(buffer, exports.getJsonOptionsPtr(), exports.getJsonOptionsSize());

    const result = await fetch(url, options);
    const resultData = new Uint8Array(await result.arrayBuffer());
    const resultPtr = exports.setResultCapacity(resultData.length);

    WasmMemoryTools.writeAt(buffer, resultPtr, resultData, resultData.length);

    exports.runCallback();
  }
}

class WasmMemoryTools {
  /**
   * @param {ArrayBuffer} buffer - The WASM memory buffer
   * @param {number} ptr - The position of the first char of the string
   * @param {number} stringSize - The size of the string pointed by ptr
   * @return {String} The String queried from the wasm memory
   */
  static getString(buffer, ptr, stringSize) {
    const stringArray = new Uint8Array(buffer, ptr, stringSize);
    return new TextDecoder().decode(stringArray);
  }

  /**
   * @param {ArrayBuffer} buffer - The WASM memory buffer
   * @param {number} ptr - The position of the first byte of json data
   * @param {number} jsonSize - The size of the string pointed by ptr
   * @return {String} The json object queried from the wasm memory
   */
  static getJson(buffer, ptr, jsonSize) {
    return JSON.parse(WasmMemoryTools.getString(buffer, ptr, jsonSize));
  }

  /**
   * @param {ArrayBuffer} buffer - The WASM memory buffer
   * @param {number} ptr - The position of the first byte where we should write
   * @param {Uint8Array} dataToWrite - The array of data to write
   * @param {number} dataSize - The size of the data to write
   */
  static writeAt(buffer, ptr, dataToWrite, dataSize) {
    const sharedArray = new Uint8Array(buffer, ptr, dataSize);
    sharedArray.set(dataToWrite);
  }

  /**
   * @param {String} str - The string to convert
   * @param {Uint8Array} The array generated from the string
   */
  static stringToUTF16Uint8Array(str) {
    const strLen = str.length;
    const buf = new ArrayBuffer(strLen*2); // 2 bytes for each char
    const bufView = new Uint16Array(buf);
    for (let i = 0; i < strLen; ++i) {
      bufView[i] = str.charCodeAt(i);
    }
    return new Uint8Array(bufView);
  }
}

class ExpressionInterpreter {
  /**
   * @param {String} context
   * @param {String} expression
   */
  static interpret(context, expression) {
    const wasmInstance = WasmInstanceFactory.get();
    wasmInstance.assertIsWellInitialized();

    const contextData = WasmMemoryTools.stringToUTF16Uint8Array(context);
    const expressionData = WasmMemoryTools.stringToUTF16Uint8Array(expression);
    
    const contextPtr = wasmInstance.exports.setContextCapacity(contextData.length);
    const expressionPtr = wasmInstance.exports.setExpressionCapacity(expressionData.length);

    const buffer = wasmInstance.buffer;
    WasmMemoryTools.writeAt(buffer, contextPtr, contextData, contextData.length);
    WasmMemoryTools.writeAt(buffer, expressionPtr, expressionData, expressionData.length);

    wasmInstance.exports.interpret();
  }
}

WasmInstanceFactory.build("classes.wasm").then(() => {
  const context = "Hello";
  const expression = "World";
  ExpressionInterpreter.interpret(context, expression);
});

