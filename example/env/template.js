// @if NODE_ENV = 'pdt'
let homeApi ='http://test.com';
// @endif

// @if NODE_ENV = 'pre'
let homeApi ='http://test.st4.cn';
// @endif

// @if NODE_ENV = 'dev'
let homeApi = 'http://test.st1.cn';
// @endif

let homeApi2 = "/* @echo dev */"
