### A WASM POC resulting of this [issue](https://github.com/konsoletyper/teavm/issues/912)

To reproduce :
- clone the repo `git clone git@github.com:TrOllOchamO/teavm-issue-912-code-sample.git`
- build the project in the pom.xml dir `mvn clean package`
- start a local server in the snapshot directory `python3 -m http.server 8080 --bind 127.0.0.1 --directory .`
