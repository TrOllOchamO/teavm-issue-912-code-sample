package flexio;

import org.teavm.interop.Address;
import org.teavm.interop.Export;
import org.teavm.interop.Import;


public class Request {
  private static byte[] url;
  private static byte[] jsonOptions;
  private static byte[] result;
  private static Callback callback;

  public interface Callback {
    void call(byte[] result);
  }

  @Export(name = "runCallback")
  public static void runCallback() {
    Request.callback.call(result);
  }

  @Export(name = "setResultCapacity")
  public static Address setResultCapacity(int wantedCapacity) {
    Request.result = new byte[wantedCapacity];
    return Address.ofData(Request.result);
  }

  @Export(name = "getResultPtr")
  public static Address getResultPtr() {
    return Address.ofData(Request.result);
  }

  @Export(name = "getUrlSize")
  public static int getUrlSize() {
    return Request.url.length;
  }

  @Export(name = "getUrlPtr")
  public static Address getUrlPtr() {
    return Address.ofData(Request.url);
  }

  @Export(name = "getJsonOptionsSize")
  public static int getJsonOptionsSize() {
    return Request.jsonOptions.length;
  }

  @Export(name = "getJsonOptionsPtr")
  public static Address getJsonOptionsPtr() {
    return Address.ofData(Request.jsonOptions);
  }
  
  @Import(name = "fetch", module = "Request")
  public static native void fetch();

  public static void fetch(String url, String jsonOptions, Callback callback) {
    Request.url = url.getBytes();
    Request.jsonOptions = jsonOptions.getBytes();
    Request.callback = callback;
    Request.fetch();
  }
}
