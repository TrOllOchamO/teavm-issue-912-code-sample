package flexio;

import org.teavm.interop.Export;
import org.teavm.interop.Address;

import flexio.Request.Callback;

public class ExpressionInterpreter {
  static byte[] context;
  static byte[] expression;

  @Export(name = "setContextCapacity")
  public static Address setContextCapacity(int wantedCapacity) {
    ExpressionInterpreter.context= new byte[wantedCapacity];
    return Address.ofData(ExpressionInterpreter.context);
  }

  @Export(name = "setExpressionCapacity")
  public static Address setExpressionCapacity(int wantedCapacity) {
    ExpressionInterpreter.expression = new byte[wantedCapacity];
    return Address.ofData(ExpressionInterpreter.expression);
  }

  @Export(name = "interpret")
  public static void interpret() {
    Logger.logBytesAsUTF16String(context);
    Logger.logBytesAsUTF16String(expression);
    final Callback callback = (res) -> { Logger.logBytesAsUTF16String(res); };
    final String url = new String("resource.json");
    final String options = new String("" 
    + "{"
    +    "\"method\": \"GET\","
    +    "\"headers\": {"
    +      "\"Content-Type\": \"application/json\""
    +    "}"
    + "}"
    );
    Request.fetch(url, options, callback);
  }

  public static void main(String[] args) {}
}
