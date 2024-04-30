package flexio;

import org.teavm.interop.Import;
import org.teavm.interop.Export;
import org.teavm.interop.Address;

public class Logger {
  static byte[] message;

  public static void logString(String message) {
    Logger.message = message.getBytes();
    logJavaString();
  }

  public static void logBytesAsUTF16String(byte[] message) {
    Logger.message = message;
    logJavaString();
  }

  @Export(name = "getMessageSize")
  public static int getMessageSize() {
    return Logger.message.length;
  }

  @Export(name = "getMessagePtr")
  public static Address getMessagePtr() {
    return Address.ofData(Logger.message);
  }
  
  @Import(name = "logJavaString", module = "Logger")
  public static native void logJavaString();
}
